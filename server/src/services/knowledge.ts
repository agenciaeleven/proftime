import { hasDatabase, query } from '../db/pool.js'
import { chunkText, extractPdfText } from './pdf.js'
import { embedText, vectorToSql } from './embeddings.js'

export interface KnowledgeDocument {
  id: string
  teacher_id: string
  title: string
  file_name: string
  mime_type: string
  file_size: number
  subject: string | null
  description: string | null
  status: 'processing' | 'ready' | 'error'
  error_message: string | null
  chunk_count: number
  created_at: string
  updated_at: string
}

export interface CreateDocumentInput {
  teacherId?: string
  title: string
  fileName: string
  mimeType: string
  fileData: Buffer
  subject?: string
  description?: string
}

export function isKnowledgeEnabled(): boolean {
  return hasDatabase()
}

export async function listDocuments(teacherId = 'demo'): Promise<KnowledgeDocument[]> {
  const { rows } = await query<KnowledgeDocument>(
    `SELECT id, teacher_id, title, file_name, mime_type, file_size, subject, description,
            status, error_message, chunk_count, created_at, updated_at
     FROM knowledge_documents
     WHERE teacher_id = $1
     ORDER BY created_at DESC`,
    [teacherId],
  )
  return rows
}

export async function getDocument(id: string): Promise<KnowledgeDocument | null> {
  const { rows } = await query<KnowledgeDocument>(
    `SELECT id, teacher_id, title, file_name, mime_type, file_size, subject, description,
            status, error_message, chunk_count, created_at, updated_at
     FROM knowledge_documents WHERE id = $1`,
    [id],
  )
  return rows[0] ?? null
}

export async function deleteDocument(id: string): Promise<boolean> {
  const { rowCount } = await query('DELETE FROM knowledge_documents WHERE id = $1', [id])
  return (rowCount ?? 0) > 0
}

export async function createDocumentFromPdf(input: CreateDocumentInput): Promise<KnowledgeDocument> {
  const { rows } = await query<KnowledgeDocument>(
    `INSERT INTO knowledge_documents
      (teacher_id, title, file_name, mime_type, file_data, file_size, subject, description, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'processing')
     RETURNING id, teacher_id, title, file_name, mime_type, file_size, subject, description,
               status, error_message, chunk_count, created_at, updated_at`,
    [
      input.teacherId || 'demo',
      input.title,
      input.fileName,
      input.mimeType,
      input.fileData,
      input.fileData.length,
      input.subject || null,
      input.description || null,
    ],
  )

  const doc = rows[0]
  processDocument(doc.id).catch((err) => {
    console.error('[knowledge] Erro ao processar documento:', err)
  })

  return doc
}

async function processDocument(documentId: string): Promise<void> {
  const { rows } = await query<{ file_data: Buffer; mime_type: string }>(
    'SELECT file_data, mime_type FROM knowledge_documents WHERE id = $1',
    [documentId],
  )

  const row = rows[0]
  if (!row) return

  try {
    let text = ''

    if (row.mime_type === 'application/pdf') {
      text = await extractPdfText(row.file_data)
    } else {
      text = row.file_data.toString('utf8')
    }

    if (!text.trim()) {
      throw new Error('Não foi possível extrair texto do arquivo')
    }

    const chunks = chunkText(text)
    if (!chunks.length) {
      throw new Error('Documento sem conteúdo indexável')
    }

    await query('DELETE FROM knowledge_chunks WHERE document_id = $1', [documentId])

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embedText(chunks[i])
      await query(
        `INSERT INTO knowledge_chunks (document_id, chunk_index, content, embedding)
         VALUES ($1, $2, $3, $4::vector)`,
        [documentId, i, chunks[i], vectorToSql(embedding)],
      )
    }

    await query(
      `UPDATE knowledge_documents
       SET status = 'ready', chunk_count = $2, error_message = NULL, updated_at = NOW()
       WHERE id = $1`,
      [documentId, chunks.length],
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    await query(
      `UPDATE knowledge_documents
       SET status = 'error', error_message = $2, updated_at = NOW()
       WHERE id = $1`,
      [documentId, message],
    )
  }
}

export interface RetrievedChunk {
  content: string
  document_title: string
  subject: string | null
  similarity: number
}

export async function searchKnowledge(queryText: string, limit = 5): Promise<RetrievedChunk[]> {
  const embedding = await embedText(queryText)
  const vector = vectorToSql(embedding)

  const { rows } = await query<RetrievedChunk>(
    `SELECT c.content,
            d.title AS document_title,
            d.subject,
            1 - (c.embedding <=> $1::vector) AS similarity
     FROM knowledge_chunks c
     JOIN knowledge_documents d ON d.id = c.document_id
     WHERE d.status = 'ready' AND c.embedding IS NOT NULL
     ORDER BY c.embedding <=> $1::vector
     LIMIT $2`,
    [vector, limit],
  )

  return rows.filter((row) => row.similarity > 0.15)
}

export function formatKnowledgeContext(chunks: RetrievedChunk[]): string {
  if (!chunks.length) return ''

  const blocks = chunks.map(
    (chunk, i) =>
      `[Fonte ${i + 1}: ${chunk.document_title}${chunk.subject ? ` — ${chunk.subject}` : ''}]\n${chunk.content}`,
  )

  return `Use os trechos abaixo da base de conhecimento do professor como contexto auxiliar. Cite a fonte quando relevante.\n\n${blocks.join('\n\n---\n\n')}`
}
