import {
  generatedLessonPlan,
  mockAgenda,
  mockAIResponses,
  mockFinancial,
  mockStudents,
  mockTrends,
} from '@/lib/mockData'
import type { EntityRecord, InvokeLLMParams, User } from '@/types'

const STORAGE_KEY = 'proftime_static_db'

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

const SEED: Record<string, EntityRecord[]> = {
  AnswerKey: [
    {
      id: 'ak1',
      name: 'Prova Bimestral - Matemática',
      answers: ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B'],
      max_score: 10,
      subject: 'Matemática',
      created_date: now(),
    },
  ],
  Student: mockStudents.map((s, i) => ({
    id: `student_${i + 1}`,
    name: s.name,
    class_name: s.grade,
    subject: 'Matemática',
    email: `${s.name.split(' ')[0].toLowerCase()}@email.com`,
    notes: s.status === 'reprovado' ? 'Necessita reforço' : 'Bom desempenho',
    avatar_color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][i % 4],
    created_date: now(),
  })),
  StudentRecord: [
    {
      id: 'sr1',
      student_id: 'student_1',
      title: 'Participação em aula',
      content: 'Aluna participativa e engajada.',
      type: 'observacao',
      date: '2026-06-10',
      created_date: now(),
    },
    {
      id: 'sr2',
      student_id: 'student_3',
      title: 'Recuperação',
      content: 'Agendar reforço em equações.',
      type: 'alerta',
      date: '2026-06-12',
      created_date: now(),
    },
  ],
  AgendaNote: [
    {
      id: 'an1',
      title: 'Reunião pedagógica',
      content: 'Levar relatório de desempenho da turma 9A.',
      date: '2026-06-20',
      color: '#3b82f6',
      created_date: now(),
    },
  ],
  AgendaEvent: mockAgenda.map((a, i) => ({
    id: `ae${i + 1}`,
    title: `${a.subject} - ${a.class}`,
    date: '2026-06-19',
    time: a.time,
    description: a.school,
    color: '#8b5cf6',
    created_date: now(),
  })),
  NeuralNode: [
    {
      id: 'nn1',
      label: 'Equações do 2º Grau',
      type: 'aula',
      category: 'Matemática',
      x: 320,
      y: 240,
      tags: ['álgebra', '9º ano'],
      created_date: now(),
    },
    {
      id: 'nn2',
      label: 'Prova Bimestral',
      type: 'tarefa',
      category: 'Matemática',
      x: 520,
      y: 180,
      parent_id: 'nn1',
      tags: ['avaliação'],
      created_date: now(),
    },
    {
      id: 'nn3',
      label: 'Gamificação em sala',
      type: 'ideia',
      category: 'Metodologia',
      x: 180,
      y: 320,
      tags: ['engajamento'],
      created_date: now(),
    },
  ],
  FinancialTransaction: mockFinancial.entries.map((e, i) => ({
    id: `ft${i + 1}`,
    name: e.name,
    value: e.value,
    type: e.type === 'saída' ? 'saida' : 'entrada',
    date: e.date,
    category: e.type === 'entrada' ? 'Aula Particular' : 'Material Escolar',
    created_date: now(),
  })),
  FinancialReminder: [
    {
      id: 'fr1',
      title: 'Mensalidade plataforma',
      amount: 89.9,
      due_date: '2026-06-25',
      paid: false,
      created_date: now(),
    },
    {
      id: 'fr2',
      title: 'Internet escritório',
      amount: 119.9,
      due_date: '2026-06-28',
      paid: false,
      created_date: now(),
    },
  ],
  Project: [
    { id: 'p1', name: 'Matemática 9º Ano', color: '#3b82f6', created_date: now() },
    { id: 'p2', name: 'Planejamento 2026', color: '#8b5cf6', created_date: now() },
  ],
  OrgFolder: [
    { id: 'f1', name: '1º Bimestre', project_id: 'p1', created_date: now() },
    { id: 'f2', name: 'Avaliações', project_id: 'p1', created_date: now() },
  ],
  OrgList: [
    { id: 'l1', name: 'Aulas', folder_id: 'f1', project_id: 'p1', created_date: now() },
    { id: 'l2', name: 'Provas', folder_id: 'f2', project_id: 'p1', created_date: now() },
  ],
  OrgTask: [
    {
      id: 't1',
      title: 'Preparar prova bimestral',
      status: 'Em Andamento',
      priority: 'Alta',
      list_id: 'l2',
      project_id: 'p1',
      due_date: '2026-06-22',
      created_date: now(),
    },
    {
      id: 't2',
      title: 'Plano de aula - Funções',
      status: 'A Fazer',
      priority: 'Normal',
      list_id: 'l1',
      project_id: 'p1',
      due_date: '2026-06-20',
      created_date: now(),
    },
  ],
  OrgDocument: [
    {
      id: 'd1',
      name: 'Calendário Escolar 2026.pdf',
      file_url: '#',
      project_id: 'p2',
      created_date: now(),
    },
  ],
  School: [
    {
      id: 'sch1',
      name: 'E.E. Castro Alves',
      city: 'São Paulo',
      state: 'SP',
      type: 'publica',
      modality: 'presencial',
      hiring: true,
      logo_color: '#3b82f6',
      created_date: now(),
    },
    {
      id: 'sch2',
      name: 'Colégio São Paulo',
      city: 'São Paulo',
      state: 'SP',
      type: 'particular',
      modality: 'hibrido',
      hiring: true,
      logo_color: '#8b5cf6',
      created_date: now(),
    },
  ],
  CurriculumApplication: [
    {
      id: 'ca1',
      school_id: 'sch1',
      status: 'enviado',
      message: 'Currículo enviado para vaga de Matemática.',
      created_date: now(),
    },
  ],
  StoreProfile: [
    {
      id: 'sp1',
      display_name: 'ProfTime Educação',
      store_name: 'ProfTime Educação',
      bio: 'Materiais didáticos e planos de aula para professores.',
      slug: 'proftime-educacao',
      theme_color: '#4D7CFE',
      photo_url: '/logo.png',
      banner_url: '/logo.png',
      created_date: now(),
    },
  ],
  InfoProduct: [
    {
      id: 'ip1',
      title: 'Kit de Atividades - Matemática 9º',
      description: '50 atividades prontas com gabarito.',
      price: 49.9,
      status: 'ativo',
      type: 'digital',
      cover_url: '/logo.png',
      created_date: now(),
    },
    {
      id: 'ip2',
      title: 'Planos de Aula - Ciências',
      description: '20 planos completos para o 6º ano.',
      price: 39.9,
      status: 'ativo',
      type: 'digital',
      cover_url: '/logo.png',
      created_date: now(),
    },
  ],
  ProductContent: [
    {
      id: 'pc1',
      product_id: 'ip1',
      title: 'Atividade 01 - Equações',
      type: 'pdf',
      order: 1,
      file_url: '#',
      created_date: now(),
    },
  ],
  ProductSale: [
    {
      id: 'ps1',
      product_id: 'ip1',
      amount: 49.9,
      buyer_email: 'comprador@email.com',
      status: 'pago',
      created_date: now(),
    },
  ],
  AffiliateProduct: [],
  Affiliation: [],
}

type DbState = Record<string, EntityRecord[]>

function loadState(): DbState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as DbState
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

function formatActivity(prompt: string) {
  const topic = prompt.match(/sobre "([^"]+)"/)?.[1] || 'o tema escolhido'
  const subject = prompt.match(/disciplina de ([^,]+)/)?.[1] || 'a disciplina'
  return `## Atividades - ${subject}
Tema: ${topic}

### Questão 1
Enunciado: Explique com suas palavras o conceito principal de ${topic}.
Gabarito: Resposta deve citar definição, exemplo e aplicação prática.

### Questão 2
Enunciado: Apresente um problema contextualizado sobre ${topic}.
Gabarito: Resolução passo a passo com justificativa.

### Questão 3
Enunciado: Compare duas abordagens de estudo sobre ${topic}.
Gabarito: Comparar vantagens e limitações de cada abordagem.

### Questão 4
Enunciado: Crie um exemplo do cotidiano relacionado a ${topic}.
Gabarito: Exemplo válido com explicação clara.

### Questão 5
Enunciado: Proponha uma atividade em grupo sobre ${topic}.
Gabarito: Descrição da dinâmica e critérios de avaliação.`
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
  }

  if (params.prompt.includes('plano de aula')) return formatLessonPlan()
  if (params.prompt.includes('questões')) return formatActivity(params.prompt)

  const response = mockAIResponses[aiResponseIndex % mockAIResponses.length]
  aiResponseIndex += 1
  return response
}

export async function staticUploadFile(file: File) {
  return { file_url: URL.createObjectURL(file) }
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
