import { hasDatabase, query, getPool } from './pool.js'
import { seedDefaultTeacher } from '../services/auth.js'

async function resetDatabase(): Promise<void> {
  if (!hasDatabase()) {
    console.error('[db:reset] DATABASE_URL não configurada')
    process.exit(1)
  }

  console.log('[db:reset] Zerando tabelas...')

  await query('TRUNCATE knowledge_chunks, knowledge_documents, gamma_presentations RESTART IDENTITY CASCADE')
  await query('DELETE FROM teachers')

  await seedDefaultTeacher()

  console.log('[db:reset] Banco zerado. Professor inicial recriado.')
}

resetDatabase()
  .catch((err) => {
    console.error('[db:reset] Falha:', err)
    process.exit(1)
  })
  .finally(async () => {
    await getPool().end()
  })
