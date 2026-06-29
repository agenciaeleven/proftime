import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import {
  cookieOptions,
  createTeacher,
  getCookieName,
  loginTeacher,
  toPublicUser,
  updateTeacherProfile,
  type PublicUser,
} from '../services/auth.js'
import { loadAuth, requireAuth, type AuthVariables } from '../middleware/auth.js'

export const authRoutes = new Hono<{ Variables: AuthVariables }>()

authRoutes.post('/login', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>()
  const email = body.email?.trim()
  const password = body.password

  if (!email || !password) {
    return c.json({ error: 'E-mail e senha são obrigatórios' }, 400)
  }

  const result = await loginTeacher(email, password)
  if ('error' in result) {
    return c.json({ error: result.error }, 401)
  }

  setCookie(c, getCookieName(), result.token, cookieOptions())
  return c.json({ user: result.user, token: result.token })
})

authRoutes.post('/internal/register', async (c) => {
  const body = await c.req.json<{
    admin_secret?: string
    email?: string
    password?: string
    full_name?: string
    phone?: string
    city?: string
    bio?: string
    subjects?: string
    experience?: string
  }>()

  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) {
    return c.json({ error: 'Cadastro interno não configurado no servidor' }, 503)
  }
  if (body.admin_secret !== adminSecret) {
    return c.json({ error: 'Chave de administrador inválida' }, 403)
  }

  const email = body.email?.trim()
  const password = body.password
  const fullName = body.full_name?.trim()

  if (!email || !password || !fullName) {
    return c.json({ error: 'Nome, e-mail e senha são obrigatórios' }, 400)
  }

  const result = await createTeacher(email, password, fullName, {
    phone: body.phone,
    city: body.city,
    bio: body.bio,
    subjects: body.subjects,
    experience: body.experience,
  })

  if ('error' in result) {
    return c.json({ error: result.error }, 400)
  }

  return c.json({ user: result.user }, 201)
})

authRoutes.use('*', loadAuth)

authRoutes.get('/me', (c) => {
  const user = c.get('user') as PublicUser | null
  if (!user) return c.json({ error: 'Não autenticado' }, 401)
  return c.json(user)
})

authRoutes.patch('/me', requireAuth, async (c) => {
  const current = c.get('user') as PublicUser
  const body = await c.req.json<Partial<PublicUser>>()
  const updated = await updateTeacherProfile(current.id, body)
  if (!updated) return c.json({ error: 'Usuário não encontrado' }, 404)
  return c.json(updated)
})

authRoutes.post('/logout', (c) => {
  deleteCookie(c, getCookieName(), { path: '/' })
  return c.json({ ok: true })
})

authRoutes.get('/session', (c) => {
  const user = c.get('user') as PublicUser | null
  return c.json({ authenticated: !!user, user })
})
