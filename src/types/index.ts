export interface User {
  id: string
  email: string
  full_name?: string
  name?: string
  avatar_url?: string
  [key: string]: unknown
}

export interface EntityRecord {
  id: string
  created_date?: string
  updated_date?: string
  [key: string]: unknown
}

export interface AnswerKey extends EntityRecord {
  name: string
  answers: string[]
  max_score?: number | null
  subject?: string
}

export interface Student extends EntityRecord {
  name: string
  class_name?: string
  subject?: string
  email?: string
  notes?: string
  avatar_color?: string
}

export interface StudentRecord extends EntityRecord {
  student_id?: string
  title?: string
  content?: string
  type?: string
  date?: string
}

export interface AgendaNote extends EntityRecord {
  title: string
  content?: string
  color?: string
}

export interface AgendaEvent extends EntityRecord {
  title: string
  date?: string
  time?: string
  description?: string
  color?: string
}

export interface NeuralNode extends EntityRecord {
  label: string
  x?: number
  y?: number
  parent_id?: string | null
  color?: string
}

export interface FinancialTransaction extends EntityRecord {
  name: string
  value: number
  type: 'entrada' | 'saida' | string
  date?: string
  category?: string
  receipt_url?: string
}

export interface FinancialReminder extends EntityRecord {
  title: string
  amount?: number
  due_date?: string
  paid?: boolean
}

export interface Project extends EntityRecord {
  name: string
  description?: string
  color?: string
}

export interface OrgFolder extends EntityRecord {
  name: string
  project_id?: string
  parent_id?: string | null
}

export interface OrgList extends EntityRecord {
  name: string
  project_id?: string
  folder_id?: string | null
}

export interface OrgTask extends EntityRecord {
  title: string
  description?: string
  status?: string
  priority?: string
  due_date?: string
  list_id?: string
  project_id?: string
}

export interface OrgDocument extends EntityRecord {
  name: string
  file_url?: string
  project_id?: string
  folder_id?: string | null
}

export interface School extends EntityRecord {
  name: string
  city?: string
  state?: string
  logo_url?: string
}

export interface CurriculumApplication extends EntityRecord {
  school_id?: string
  status?: string
  message?: string
}

export interface StoreProfile extends EntityRecord {
  store_name?: string
  display_name?: string
  description?: string
  bio?: string
  logo_url?: string
  photo_url?: string
  banner_url?: string
  theme_color?: string
  featured_product_id?: string
  slug?: string
}

export interface InfoProduct extends EntityRecord {
  title: string
  description?: string
  price?: number
  cover_url?: string
  status?: string
  type?: string
}

export interface ProductContent extends EntityRecord {
  product_id?: string
  title: string
  type?: string
  file_url?: string
  content?: string
}

export interface ProductSale extends EntityRecord {
  product_id?: string
  amount?: number
  buyer_email?: string
  status?: string
}

export interface AffiliateProduct extends EntityRecord {
  title: string
  commission_rate?: number
  external_url?: string
}

export interface Affiliation extends EntityRecord {
  product_id?: string
  affiliate_code?: string
  clicks?: number
  sales?: number
}

export type LLMModel =
  | 'gpt_5_mini'
  | 'gemini_3_flash'
  | 'gpt_5'
  | 'gpt_5_4'
  | 'gpt_5_5'
  | 'gemini_3_1_pro'
  | 'claude_sonnet_4_6'
  | 'claude_opus_4_6'
  | 'claude_opus_4_7'

export interface InvokeLLMParams {
  prompt: string
  model?: LLMModel | string
  add_context_from_internet?: boolean
  response_json_schema?: object
  file_urls?: string[]
  /** Busca trechos relevantes na base de conhecimento (PDFs do professor). */
  use_knowledge_base?: boolean
}

export interface UploadFileResult {
  file_url: string
}

export type AuthErrorType = 'auth_required' | 'user_not_registered' | 'unknown' | string

export interface AuthError {
  type: AuthErrorType
  message: string
}

export interface AppPublicSettings {
  id?: string
  public_settings?: Record<string, unknown>
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface GradingComparison {
  question: number
  correct: string
  student: string
  isCorrect: boolean
}

export interface GradingResults {
  hits: number
  misses: number
  maxScore: number
  finalScore: number
  comparison: GradingComparison[]
}

export interface TrendItem {
  title: string
  category: string
  description: string
  tip?: string
  heat?: number
}

export interface EntityClient<T extends EntityRecord = EntityRecord> {
  list: (sort?: string) => Promise<T[]>
  filter: (query?: Record<string, unknown>, sort?: string, limit?: number) => Promise<T[]>
  get: (id: string) => Promise<T | null>
  create: (data: Partial<T>) => Promise<T>
  update: (id: string, data: Partial<T>) => Promise<T>
  delete: (id: string) => Promise<void>
  bulkCreate?: (data: Partial<T>[]) => Promise<T[]>
}

export interface AuthModule {
  isAuthenticated: () => Promise<boolean>
  me: () => Promise<User | null>
  login: (email: string, password: string) => Promise<User>
  updateMe: (data: Partial<User>) => Promise<User>
  logout: (redirectUrl?: string) => void
  redirectToLogin: (returnUrl?: string) => void
}

export interface CoreIntegrations {
  InvokeLLM: (params: InvokeLLMParams) => Promise<string | Record<string, unknown>>
  UploadFile: (params: { file: File }) => Promise<UploadFileResult>
}

export interface EntitiesModule {
  AnswerKey: EntityClient<AnswerKey>
  Student: EntityClient<Student>
  StudentRecord: EntityClient<StudentRecord>
  AgendaNote: EntityClient<AgendaNote>
  AgendaEvent: EntityClient<AgendaEvent>
  NeuralNode: EntityClient<NeuralNode>
  FinancialTransaction: EntityClient<FinancialTransaction>
  FinancialReminder: EntityClient<FinancialReminder>
  Project: EntityClient<Project>
  OrgFolder: EntityClient<OrgFolder>
  OrgList: EntityClient<OrgList>
  OrgTask: EntityClient<OrgTask>
  OrgDocument: EntityClient<OrgDocument>
  School: EntityClient<School>
  CurriculumApplication: EntityClient<CurriculumApplication>
  StoreProfile: EntityClient<StoreProfile>
  InfoProduct: EntityClient<InfoProduct>
  ProductContent: EntityClient<ProductContent>
  ProductSale: EntityClient<ProductSale>
  AffiliateProduct: EntityClient<AffiliateProduct>
  Affiliation: EntityClient<Affiliation>
  [key: string]: EntityClient
}

export interface ApiClient {
  auth: AuthModule
  entities: EntitiesModule
  integrations: {
    Core: CoreIntegrations
  }
}

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoadingAuth: boolean
  isLoadingPublicSettings: boolean
  authError: AuthError | null
  appPublicSettings: AppPublicSettings | null
  logout: (shouldRedirect?: boolean) => void
  navigateToLogin: () => void
  checkAppState: () => Promise<void>
}
