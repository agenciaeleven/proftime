import type { User } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || ''
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || ''

export function hasAdminSecret(): boolean {
  return !!ADMIN_SECRET
}

export interface InternalRegisterInput {
  email: string
  password: string
  full_name: string
  phone?: string
  city?: string
  bio?: string
  subjects?: string
  experience?: string
}

export async function createTeacherInternal(data: InternalRegisterInput): Promise<User> {
  if (!API_URL) {
    throw new Error('API remota não configurada')
  }
  if (!ADMIN_SECRET) {
    throw new Error('Chave administrativa não configurada no frontend (VITE_ADMIN_SECRET)')
  }

  const res = await fetch(`${API_URL}/auth/internal/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, admin_secret: ADMIN_SECRET }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Falha ao cadastrar professor')
  }

  return json.user as User
}
