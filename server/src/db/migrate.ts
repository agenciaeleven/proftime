import { hasDatabase, query } from './pool.js'

export async function runMigrations(): Promise<void> {
  if (!hasDatabase()) {
    console.warn('[db] DATABASE_URL ausente — base de conhecimento desativada')
    return
  }

  await query('CREATE EXTENSION IF NOT EXISTS vector')
  await query('CREATE EXTENSION IF NOT EXISTS pgcrypto')

  await query(`
    CREATE TABLE IF NOT EXISTS knowledge_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      teacher_id TEXT NOT NULL DEFAULT 'demo',
      title TEXT NOT NULL,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL DEFAULT 'application/pdf',
      file_data BYTEA NOT NULL,
      file_size INTEGER NOT NULL,
      subject TEXT,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'processing',
      error_message TEXT,
      chunk_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS knowledge_chunks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
      chunk_index INTEGER NOT NULL,
      content TEXT NOT NULL,
      embedding vector(768),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await query(`
    CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document
    ON knowledge_chunks (document_id)
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS teachers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      city TEXT,
      bio TEXT,
      subjects TEXT,
      experience TEXT,
      avatar_url TEXT,
      verified BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await query(`
    CREATE INDEX IF NOT EXISTS idx_teachers_email
    ON teachers (LOWER(email))
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS gamma_presentations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      topic TEXT,
      input_text TEXT NOT NULL,
      generation_id TEXT,
      gamma_id TEXT,
      gamma_url TEXT,
      export_url TEXT,
      export_format TEXT NOT NULL DEFAULT 'pdf',
      status TEXT NOT NULL DEFAULT 'pending',
      error_message TEXT,
      num_cards INTEGER NOT NULL DEFAULT 10,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await query(`
    CREATE INDEX IF NOT EXISTS idx_gamma_presentations_teacher
    ON gamma_presentations (teacher_id, created_at DESC)
  `)

  const { seedDefaultTeacher } = await import('../services/auth.js')
  await seedDefaultTeacher()

  console.log('[db] Migrações aplicadas (knowledge base + auth)')
}
