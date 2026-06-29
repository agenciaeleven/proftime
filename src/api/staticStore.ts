import {
  generatedLessonPlan,
  mockAIResponses,
  mockTrends,
} from '@/lib/mockData'
import type { EntityRecord, InvokeLLMParams, User } from '@/types'
import { formatActivityResult } from '@/lib/prompts/activity'

const STORAGE_KEY = 'proftime_static_db'
const SESSION_KEY = 'proftime_static_session'
const STATIC_LOGIN_EMAIL = 'professor@proftime.com.br'
const STATIC_LOGIN_PASSWORD = 'ProfTime@2026'
const DB_VERSION = 3
const VERSION_KEY = 'proftime_static_db_version'

export const MOCK_USER: User = {
  id: 'user_demo',
  email: 'professor@proftime.com.br',
  full_name: 'Prof. Ana Oliveira',
  name: 'Prof. Ana Oliveira',
  avatar_url: '',
  phone: '(11) 98765-4321',
  city: 'São Paulo, SP',
  bio: 'Professora de Matemática e Ciências com 12 anos de experiência.',
  subjects: 'Matemática, Ciências',
  experience: '12 anos',
}

const now = () => new Date().toISOString()

function id() {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function sortItems<T extends EntityRecord>(items: T[], sort?: string): T[] {
  const list = [...items]
  if (!sort) return list
  const desc = sort.startsWith('-')
  const field = desc ? sort.slice(1) : sort
  list.sort((a, b) => {
    const av = String(a[field] ?? '')
    const bv = String(b[field] ?? '')
    return desc ? bv.localeCompare(av) : av.localeCompare(bv)
  })
  return list
}

function matchesQuery(item: EntityRecord, query?: Record<string, unknown>) {
  if (!query) return true
  return Object.entries(query).every(([key, value]) => item[key] === value)
}

const ENTITY_NAMES = [
  'AnswerKey',
  'Student',
  'StudentRecord',
  'AgendaNote',
  'AgendaEvent',
  'NeuralNode',
  'FinancialTransaction',
  'FinancialReminder',
  'Project',
  'OrgFolder',
  'OrgList',
  'OrgTask',
  'OrgDocument',
  'School',
  'CurriculumApplication',
  'StoreProfile',
  'InfoProduct',
  'ProductContent',
  'ProductSale',
  'AffiliateProduct',
  'Affiliation',
] as const

const SEED: Record<string, EntityRecord[]> = Object.fromEntries(
  ENTITY_NAMES.map((name) => [name, []]),
)

type DbState = Record<string, EntityRecord[]>

function loadState(): DbState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const storedVersion = Number(localStorage.getItem(VERSION_KEY) || 1)
    let db: DbState

    if (raw) {
      db = JSON.parse(raw) as DbState
    } else {
      db = structuredClone(SEED)
    }

    if (storedVersion < DB_VERSION) {
      db = structuredClone(SEED)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
      localStorage.setItem(VERSION_KEY, String(DB_VERSION))
    }

    return db
  } catch {
    /* ignore */
  }
  return structuredClone(SEED)
}

function saveState(state: DbState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

let state = loadState()

function ensureEntity(name: string): EntityRecord[] {
  if (!state[name]) state[name] = []
  return state[name]
}

export function createStaticEntityClient<T extends EntityRecord = EntityRecord>(
  entityName: string,
) {
  return {
    list: async (sort?: string) => sortItems(ensureEntity(entityName) as T[], sort),
    filter: async (query?: Record<string, unknown>, sort?: string) => {
      const items = (ensureEntity(entityName) as T[]).filter((item) =>
        matchesQuery(item, query),
      )
      return sortItems(items, sort)
    },
    get: async (recordId: string) =>
      (ensureEntity(entityName).find((item) => item.id === recordId) as T) ?? null,
    create: async (data: Partial<T>) => {
      const record = {
        ...data,
        id: id(),
        created_date: now(),
        updated_date: now(),
      } as T
      ensureEntity(entityName).unshift(record)
      saveState(state)
      return record
    },
    update: async (recordId: string, data: Partial<T>) => {
      const items = ensureEntity(entityName)
      const index = items.findIndex((item) => item.id === recordId)
      if (index === -1) throw new Error('Not found')
      items[index] = { ...items[index], ...data, updated_date: now() }
      saveState(state)
      return items[index] as T
    },
    delete: async (recordId: string) => {
      const items = ensureEntity(entityName)
      const index = items.findIndex((item) => item.id === recordId)
      if (index !== -1) items.splice(index, 1)
      saveState(state)
    },
    bulkCreate: async (data: Partial<T>[]) => {
      const created = data.map((item) => ({
        ...item,
        id: id(),
        created_date: now(),
        updated_date: now(),
      })) as T[]
      ensureEntity(entityName).unshift(...created)
      saveState(state)
      return created
    },
  }
}

let aiResponseIndex = 0

function formatLessonPlan() {
  const p = generatedLessonPlan
  return `## ${p.introduction.title} (${p.introduction.duration})
${p.introduction.content}

## ${p.development.title} (${p.development.duration})
${p.development.content}

## ${p.activity.title} (${p.activity.duration})
${p.activity.content}

## ${p.conclusion.title} (${p.conclusion.duration})
${p.conclusion.content}`
}

function mockActivityJson(prompt: string) {
  const subject = prompt.match(/Disciplina:\s*([^\n]+)/)?.[1]?.trim() || 'Disciplina'
  const topic = prompt.match(/Tema \/ conteúdo:\s*([^\n]+)/)?.[1]?.trim() || 'Tema'
  const level = prompt.match(/Nível de dificuldade:\s*([^\n]+)/)?.[1]?.trim() || 'Médio'
  const typeLine = prompt.match(/Tipo de atividade:\s*([^\n]+)/)?.[1]?.trim() || 'Múltipla Escolha (multipla_escolha)'
  const typeKey = typeLine.match(/\(([^)]+)\)/)?.[1] || 'multipla_escolha'
  const quantity = Math.min(20, Math.max(1, Number(prompt.match(/Quantidade exata de itens:\s*(\d+)/)?.[1] || 5)))

  const questoes = Array.from({ length: quantity }, (_, i) => {
    const numero = i + 1
    if (typeKey === 'verdadeiro_falso') {
      return {
        numero,
        enunciado: `${topic}: afirmação ${numero} para análise em ${subject}.`,
        gabarito: numero % 2 === 0 ? 'Falso' : 'Verdadeiro',
        criterios_correcao: `Explicar o conceito de ${topic} com base no conteúdo da disciplina.`,
      }
    }
    if (typeKey === 'dissertativa') {
      return {
        numero,
        enunciado: `Discorra sobre ${topic} em ${subject}, considerando o nível ${level}.`,
        gabarito: 'Resposta modelo com introdução, desenvolvimento e conclusão.',
        criterios_correcao: 'Clareza, domínio do conteúdo, exemplos e coerência argumentativa.',
      }
    }
    if (typeKey === 'pratica') {
      return {
        numero,
        enunciado: `Atividade prática ${numero} sobre ${topic}.`,
        materiais: 'Quadro, caderno e material de apoio.',
        passos: [
          'Apresentar o desafio aos estudantes.',
          'Organizar grupos e distribuir instruções.',
          'Acompanhar a execução da atividade.',
          'Socializar resultados e síntese final.',
        ],
        tempo_estimado_min: 20 + numero * 5,
        criterios_correcao: 'Participação, aplicação do conteúdo e registro das conclusões.',
      }
    }
    return {
      numero,
      enunciado: `Questão ${numero} sobre ${topic} em ${subject}.`,
      alternativas: [
        `A) Alternativa correta sobre ${topic}`,
        'B) Alternativa plausível',
        'C) Alternativa incorreta',
        'D) Alternativa incorreta',
      ],
      gabarito: 'A',
    }
  })

  return {
    titulo: `Atividades de ${topic}`,
    disciplina: subject,
    tema: topic,
    nivel: level,
    tipo: typeLine.split('(')[0].trim(),
    orientacoes_gerais: `Conjunto gerado para ${subject}, focado em ${topic}, nível ${level}.`,
    questoes,
  }
}

export async function staticInvokeLLM(
  params: InvokeLLMParams,
): Promise<string | Record<string, unknown>> {
  await new Promise((r) => setTimeout(r, 600))

  if (params.response_json_schema) {
    if (params.prompt.includes('student_answers')) {
      return { student_answers: ['A', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'B', 'A'] }
    }
    if (params.prompt.includes('tendências')) {
      return {
        trends: mockTrends.map((t, i) => ({
          title: t.title,
          category: ['educacao', 'educacao', 'educacao', 'educacao', 'tech', 'educacao'][i] || 'educacao',
          description: t.description,
          tip: `Use em sala com uma dinâmica de 10 minutos sobre ${t.title}.`,
          heat: 90 - i * 5,
        })),
      }
    }
    if (params.prompt.includes('[PROFTIME_TASK:activity_generation]')) {
      return mockActivityJson(params.prompt)
    }
  }

  if (params.prompt.includes('plano de aula')) return formatLessonPlan()
  if (params.prompt.includes('[PROFTIME_TASK:activity_generation]')) {
    return formatActivityResult(mockActivityJson(params.prompt))
  }

  const response = mockAIResponses[aiResponseIndex % mockAIResponses.length]
  aiResponseIndex += 1
  return response
}

export async function staticUploadFile(file: File) {
  return { file_url: URL.createObjectURL(file) }
}

export function getStaticSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export async function staticLogin(email: string, password: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 300))

  if (
    email.trim().toLowerCase() !== STATIC_LOGIN_EMAIL.toLowerCase() ||
    password !== STATIC_LOGIN_PASSWORD
  ) {
    throw new Error('E-mail ou senha incorretos')
  }

  const user = { ...MOCK_USER }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return user
}

export function staticLogout(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function getStaticUser(): User {
  try {
    const raw = localStorage.getItem('proftime_static_user')
    if (raw) return JSON.parse(raw) as User
  } catch {
    /* ignore */
  }
  return { ...MOCK_USER }
}

export function updateStaticUser(data: Partial<User>): User {
  const user = { ...getStaticUser(), ...data }
  localStorage.setItem('proftime_static_user', JSON.stringify(user))
  return user
}

export const isStaticMode = !import.meta.env.VITE_API_URL
