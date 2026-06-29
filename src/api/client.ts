import type {
  ApiClient,
  EntityClient,
  EntityRecord,
  InvokeLLMParams,
  UploadFileResult,
  User,
} from '@/types'
import {
  createStaticEntityClient,
  staticInvokeLLM,
  staticUploadFile,
  updateStaticUser,
} from './staticStore'
import { authHeaders, clearAuthToken, setAuthToken } from './authToken'

const API_URL = import.meta.env.VITE_API_URL || ''

/** Backend Railway configurado (IA + arquivos + auth stub). */
export const hasRemoteApi = !!API_URL

/** Modo 100% local (sem Railway). */
export const isStaticMode = !hasRemoteApi

const entitiesHandler: ProxyHandler<Record<string, EntityClient>> = {
  get: (_target, prop: string) => {
    if (prop === 'then') return undefined
    return createStaticEntityClient(prop)
  },
}

async function invokeLLM(
  params: InvokeLLMParams,
): Promise<string | Record<string, unknown>> {
  if (!hasRemoteApi) return staticInvokeLLM(params)

  const res = await fetch(`${API_URL}/ai/invoke`, {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error(`AI request failed: ${res.status}`)
  return res.json()
}

async function uploadFile(file: File): Promise<UploadFileResult> {
  if (!hasRemoteApi) return staticUploadFile(file)

  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_URL}/files/upload`, {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
    body: form,
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json()
}

export const db: ApiClient = {
  auth: {
    isAuthenticated: async () => !!(await db.auth.me()),
    login: async (email, password) => {
      if (!hasRemoteApi) {
        const { staticLogin } = await import('./staticStore')
        return staticLogin(email, password)
      }

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Falha no login')
      }
      if (data.token) setAuthToken(data.token)
      return data.user as User
    },
    me: async (): Promise<User | null> => {
      if (!hasRemoteApi) {
        const { getStaticSession } = await import('./staticStore')
        return getStaticSession()
      }
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
        headers: authHeaders(),
      })
      if (res.status === 401) return null
      if (!res.ok) throw new Error('Failed to fetch user')
      return res.json()
    },
    updateMe: async (data) => {
      if (!hasRemoteApi) return updateStaticUser(data)
      const res = await fetch(`${API_URL}/auth/me`, {
        method: 'PATCH',
        credentials: 'include',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update user')
      return res.json()
    },
    logout: (redirectUrl?: string) => {
      if (hasRemoteApi) {
        fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: authHeaders(),
        })
        clearAuthToken()
      } else {
        void import('./staticStore').then(({ staticLogout }) => staticLogout())
      }
      const target = redirectUrl?.includes('/login') ? redirectUrl : '/login'
      window.location.href = target
    },
    redirectToLogin: (returnUrl?: string) => {
      const path = returnUrl
        ? `/login?return=${encodeURIComponent(returnUrl)}`
        : '/login'
      window.location.href = path
    },
  },
  entities: new Proxy({}, entitiesHandler) as ApiClient['entities'],
  integrations: {
    Core: {
      InvokeLLM: invokeLLM,
      UploadFile: ({ file }) => uploadFile(file),
    },
  },
}

export const api = db
export default db
