import type { User } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || ''

export interface InternalRegisterInput {
  admin_secret: string
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

  const res = await fetch(`${API_URL}/auth/internal/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Falha ao cadastrar professor')
  }

  return json.user as User
}
