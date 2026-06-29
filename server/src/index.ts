import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { aiRoutes } from './routes/ai.js'
import { filesRoutes } from './routes/files.js'
import { authRoutes } from './routes/auth.js'
import { knowledgeRoutes } from './routes/knowledge.js'
import { slidesRoutes } from './routes/slides.js'
import { hasGeminiKey } from './services/gemini.js'
import { hasGammaKey } from './services/gamma.js'
import { isKnowledgeEnabled } from './services/knowledge.js'
import { checkDatabaseConnection } from './db/pool.js'
import { runMigrations } from './db/migrate.js'

const app = new Hono()

const corsOrigins = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) || ['*']

app.use(
  '*',
  cors({
    origin: corsOrigins.includes('*') ? '*' : corsOrigins,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
)

app.get('/health', async (c) => {
  const dbOk = isKnowledgeEnabled() ? await checkDatabaseConnection() : false

  return c.json({
    status: 'ok',
    service: 'proftime-api',
    gemini: hasGeminiKey() ? 'live' : 'mock',
    knowledge: isKnowledgeEnabled() ? (dbOk ? 'live' : 'error') : 'disabled',
    auth: isKnowledgeEnabled() ? (dbOk ? 'live' : 'error') : 'disabled',
    gamma: hasGammaKey() ? 'live' : 'mock',
  })
})

app.route('/ai', aiRoutes)
app.route('/files', filesRoutes)
app.route('/auth', authRoutes)
app.route('/knowledge', knowledgeRoutes)
app.route('/slides', slidesRoutes)

const port = Number(process.env.PORT || 3001)

async function start() {
  try {
    await runMigrations()
  } catch (err) {
    console.error('[db] Falha nas migrações:', err)
  }

  console.log(`ProfTime API → http://0.0.0.0:${port}`)
  console.log(`Gemini: ${hasGeminiKey() ? 'GEMINI_API_KEY configurada' : 'modo mock (sem chave)'}`)
  console.log(`Knowledge: ${isKnowledgeEnabled() ? 'PostgreSQL + pgvector' : 'desativado'}`)

  serve({ fetch: app.fetch, port, hostname: '0.0.0.0' })
}

start()
