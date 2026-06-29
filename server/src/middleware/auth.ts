import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { getAuthHeaderName, getCookieName, verifyToken, type PublicUser } from '../services/auth.js'

export type AuthVariables = {
  user: PublicUser | null
  teacherId: string | null
}

function extractToken(c: Context): string | null {
  const header = c.req.header(getAuthHeaderName())
  if (header?.startsWith('Bearer ')) {
    return header.slice(7).trim()
  }
  return getCookie(c, getCookieName()) || null
}

export async function loadAuth(c: Context, next: Next) {
  const token = extractToken(c)
  if (!token) {
    c.set('user', null)
    c.set('teacherId', null)
    await next()
    return
  }

  const user = await verifyToken(token)
  c.set('user', user)
  c.set('teacherId', user?.id ?? null)
  await next()
}

export async function requireAuth(c: Context, next: Next) {
  const user = c.get('user') as PublicUser | null
  if (!user) {
    return c.json({ error: 'Não autenticado' }, 401)
  }
  await next()
}
