import pg from 'pg'

const { Pool } = pg

let pool: pg.Pool | null = null

export function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL
}

export function getPool(): pg.Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada')
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_URL.includes('localhost') ||
        process.env.DATABASE_URL.includes('127.0.0.1')
          ? undefined
          : { rejectUnauthorized: false },
      max: 10,
    })
  }

  return pool
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  return getPool().query<T>(text, params)
}

export async function checkDatabaseConnection(): Promise<boolean> {
  if (!hasDatabase()) return false
  try {
    await query('SELECT 1')
    return true
  } catch {
    return false
  }
}
