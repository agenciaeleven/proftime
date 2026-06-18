import type {
  ApiClient,
  EntityClient,
  EntityRecord,
  InvokeLLMParams,
  UploadFileResult,
  User,
} from '@/types'

const API_URL = import.meta.env.VITE_API_URL || ''

function createEntityClient<T extends EntityRecord = EntityRecord>(
  resource: string,
): EntityClient<T> {
  const base = `${API_URL}/entities/${resource}`

  const request = async <R>(url: string, init?: RequestInit): Promise<R> => {
    const res = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      ...init,
    })
    if (!res.ok) {
      const error = new Error(`Request failed: ${res.status}`) as Error & {
        status?: number
      }
      error.status = res.status
      throw error
    }
    if (res.status === 204) return undefined as R
    return res.json() as Promise<R>
  }

  return {
    list: (sort) => {
      const params = sort ? `?sort=${encodeURIComponent(sort)}` : ''
      return request<T[]>(`${base}${params}`)
    },
    filter: (query, sort, limit) => {
      const params = new URLSearchParams()
      if (query) params.set('q', JSON.stringify(query))
      if (sort) params.set('sort', sort)
      if (limit) params.set('limit', String(limit))
      const qs = params.toString()
      return request<T[]>(`${base}${qs ? `?${qs}` : ''}`)
    },
    get: (id) => request<T | null>(`${base}/${id}`),
    create: (data) =>
      request<T>(base, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) =>
      request<T>(`${base}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request<void>(`${base}/${id}`, { method: 'DELETE' }),
    bulkCreate: (data) =>
      request<T[]>(`${base}/bulk`, { method: 'POST', body: JSON.stringify(data) }),
  }
}

const noopEntity = createEntityClient('noop')

const entitiesHandler: ProxyHandler<Record<string, EntityClient>> = {
  get: (_target, prop: string) => {
    if (prop === 'then') return undefined
    const resource = prop.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
    return createEntityClient(resource)
  },
}

async function invokeLLM(
  params: InvokeLLMParams,
): Promise<string | Record<string, unknown>> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/ai/invoke`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    if (!res.ok) throw new Error(`AI request failed: ${res.status}`)
    return res.json()
  }
  return `[Dev] Resposta simulada para: ${params.prompt.slice(0, 80)}...`
}

async function uploadFile(file: File): Promise<UploadFileResult> {
  if (API_URL) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API_URL}/files/upload`, {
      method: 'POST',
      credentials: 'include',
      body: form,
    })
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
    return res.json()
  }
  return { file_url: URL.createObjectURL(file) }
}

export const db: ApiClient = {
  auth: {
    isAuthenticated: async () => {
      try {
        const user = await db.auth.me()
        return !!user
      } catch {
        return false
      }
    },
    me: async (): Promise<User | null> => {
      if (!API_URL) return null
      const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      if (res.status === 401) return null
      if (!res.ok) throw new Error('Failed to fetch user')
      return res.json()
    },
    updateMe: async (data) => {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update user')
      return res.json()
    },
    logout: (redirectUrl?: string) => {
      if (API_URL) {
        fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
      }
      if (redirectUrl) window.location.href = redirectUrl
    },
    redirectToLogin: (returnUrl?: string) => {
      const loginUrl = API_URL
        ? `${API_URL}/auth/sign-in?returnUrl=${encodeURIComponent(returnUrl || window.location.href)}`
        : '/login'
      window.location.href = loginUrl
    },
  },
  entities: new Proxy(
    { noop: noopEntity },
    entitiesHandler,
  ) as ApiClient['entities'],
  integrations: {
    Core: {
      InvokeLLM: invokeLLM,
      UploadFile: ({ file }) => uploadFile(file),
    },
  },
}

export const api = db
export default db
