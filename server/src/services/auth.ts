import { sign, verify } from 'hono/jwt'
import { hasDatabase, query } from '../db/pool.js'
import { hashPassword, verifyPassword } from './password.js'

export interface TeacherRow {
  id: string
  email: string
  password_hash: string
  full_name: string
  phone: string | null
  city: string | null
  bio: string | null
  subjects: string | null
  experience: string | null
  avatar_url: string | null
  verified: boolean
  created_at: string
  updated_at: string
}

export interface PublicUser {
  id: string
  email: string
  full_name: string
  name: string
  avatar_url: string
  phone?: string
  city?: string
  bio?: string
  subjects?: string
  experience?: string
}

const COOKIE_NAME = 'proftime_token'
const TOKEN_TTL_SEC = 60 * 60 * 24 * 7
const AUTH_HEADER = 'Authorization'

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET não configurado')
  }
  return secret || 'proftime-dev-secret'
}

export function getCookieName(): string {
  return COOKIE_NAME
}

export function getAuthHeaderName(): string {
  return AUTH_HEADER
}

export function toPublicUser(row: TeacherRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    name: row.full_name,
    avatar_url: row.avatar_url || '',
    phone: row.phone || undefined,
    city: row.city || undefined,
    bio: row.bio || undefined,
    subjects: row.subjects || undefined,
    experience: row.experience || undefined,
  }
}

export async function findTeacherByEmail(email: string): Promise<TeacherRow | null> {
  const { rows } = await query<TeacherRow>(
    `SELECT id, email, password_hash, full_name, phone, city, bio, subjects, experience,
            avatar_url, verified, created_at, updated_at
     FROM teachers WHERE LOWER(email) = LOWER($1)`,
    [email.trim()],
  )
  return rows[0] ?? null
}

export async function findTeacherById(id: string): Promise<TeacherRow | null> {
  const { rows } = await query<TeacherRow>(
    `SELECT id, email, password_hash, full_name, phone, city, bio, subjects, experience,
            avatar_url, verified, created_at, updated_at
     FROM teachers WHERE id = $1`,
    [id],
  )
  return rows[0] ?? null
}

async function issueToken(teacher: TeacherRow): Promise<{ user: PublicUser; token: string }> {
  const token = await sign(
    { sub: teacher.id, email: teacher.email },
    jwtSecret(),
    'HS256',
  )
  return { user: toPublicUser(teacher), token }
}

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'A senha deve ter no mínimo 8 caracteres'
  }
  return null
}

export interface CreateTeacherProfile {
  phone?: string
  city?: string
  bio?: string
  subjects?: string
  experience?: string
}

export async function createTeacher(
  email: string,
  password: string,
  fullName: string,
  profile: CreateTeacherProfile = {},
): Promise<{ user: PublicUser } | { error: string }> {
  if (!hasDatabase()) {
    return { error: 'Cadastro indisponível (banco não configurado)' }
  }

  const normalizedEmail = email.trim().toLowerCase()
  const name = fullName.trim()

  if (!normalizedEmail || !password || !name) {
    return { error: 'Nome, e-mail e senha são obrigatórios' }
  }

  const passwordError = validatePassword(password)
  if (passwordError) return { error: passwordError }

  const existing = await findTeacherByEmail(normalizedEmail)
  if (existing) {
    return { error: 'Este e-mail já está cadastrado' }
  }

  const passwordHash = await hashPassword(password)

  const { rows } = await query<TeacherRow>(
    `INSERT INTO teachers (email, password_hash, full_name, phone, city, bio, subjects, experience, verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
     RETURNING id, email, password_hash, full_name, phone, city, bio, subjects, experience,
               avatar_url, verified, created_at, updated_at`,
    [
      normalizedEmail,
      passwordHash,
      name,
      profile.phone?.trim() || null,
      profile.city?.trim() || null,
      profile.bio?.trim() || null,
      profile.subjects?.trim() || null,
      profile.experience?.trim() || null,
    ],
  )

  const teacher = rows[0]
  if (!teacher) {
    return { error: 'Não foi possível criar a conta' }
  }

  return { user: toPublicUser(teacher) }
}

export async function loginTeacher(
  email: string,
  password: string,
): Promise<{ user: PublicUser; token: string } | { error: string }> {
  if (!hasDatabase()) {
    return { error: 'Autenticação indisponível (banco não configurado)' }
  }

  const teacher = await findTeacherByEmail(email)
  if (!teacher) {
    return { error: 'E-mail ou senha incorretos' }
  }

  if (!teacher.verified) {
    return { error: 'Conta aguardando verificação. Entre em contato com o suporte.' }
  }

  const valid = await verifyPassword(password, teacher.password_hash)
  if (!valid) {
    return { error: 'E-mail ou senha incorretos' }
  }

  return issueToken(teacher)
}

export async function verifyToken(token: string): Promise<PublicUser | null> {
  try {
    const payload = await verify(token, jwtSecret(), 'HS256')
    const sub = payload.sub
    if (typeof sub !== 'string') return null

    const teacher = await findTeacherById(sub)
    if (!teacher || !teacher.verified) return null

    return toPublicUser(teacher)
  } catch {
    return null
  }
}

export async function updateTeacherProfile(
  id: string,
  data: Partial<PublicUser>,
): Promise<PublicUser | null> {
  const teacher = await findTeacherById(id)
  if (!teacher) return null

  const { rows } = await query<TeacherRow>(
    `UPDATE teachers SET
      full_name = COALESCE($2, full_name),
      phone = COALESCE($3, phone),
      city = COALESCE($4, city),
      bio = COALESCE($5, bio),
      subjects = COALESCE($6, subjects),
      experience = COALESCE($7, experience),
      avatar_url = COALESCE($8, avatar_url),
      updated_at = NOW()
     WHERE id = $1
     RETURNING id, email, password_hash, full_name, phone, city, bio, subjects, experience,
               avatar_url, verified, created_at, updated_at`,
    [
      id,
      data.full_name || data.name || null,
      data.phone ?? null,
      data.city ?? null,
      data.bio ?? null,
      data.subjects ?? null,
      data.experience ?? null,
      data.avatar_url ?? null,
    ],
  )

  return rows[0] ? toPublicUser(rows[0]) : null
}

export async function seedDefaultTeacher(): Promise<void> {
  if (!hasDatabase()) return

  const { rows } = await query<{ count: string }>('SELECT COUNT(*)::text AS count FROM teachers')
  if (Number(rows[0]?.count || 0) > 0) return

  const email = process.env.SEED_TEACHER_EMAIL || 'professor@proftime.com.br'
  const password = process.env.SEED_TEACHER_PASSWORD || 'ProfTime@2026'
  const passwordHash = await hashPassword(password)

  await query(
    `INSERT INTO teachers (email, password_hash, full_name, phone, city, bio, subjects, experience, verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)`,
    [
      email,
      passwordHash,
      'Prof. Ana Oliveira',
      '(11) 98765-4321',
      'São Paulo, SP',
      'Professora de Matemática e Ciências com 12 anos de experiência.',
      'Matemática, Ciências',
      '12 anos',
    ],
  )

  console.log(`[auth] Professor inicial criado: ${email}`)
}

export function cookieOptions() {
  const secure = process.env.NODE_ENV === 'production' || !!process.env.PUBLIC_URL?.startsWith('https')

  return {
    httpOnly: true,
    secure,
    sameSite: 'Lax' as const,
    path: '/',
    maxAge: TOKEN_TTL_SEC,
  }
}
