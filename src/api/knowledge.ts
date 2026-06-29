import { authHeaders } from '@/api/authToken'

const API_URL = import.meta.env.VITE_API_URL || ''

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

function knowledgeUrl(path: string): string {
  if (!API_URL) throw new Error('VITE_API_URL não configurada')
  return `${API_URL}/knowledge${path}`
}

export async function listKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
  const res = await fetch(knowledgeUrl('/documents'), {
    credentials: 'include',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Falha ao listar documentos')
  const data = await res.json()
  return data.documents
}

export async function uploadKnowledgeDocument(
  file: File,
  meta: { title?: string; subject?: string; description?: string },
): Promise<KnowledgeDocument> {
  const form = new FormData()
  form.append('file', file)
  if (meta.title) form.append('title', meta.title)
  if (meta.subject) form.append('subject', meta.subject)
  if (meta.description) form.append('description', meta.description)

  const res = await fetch(knowledgeUrl('/documents'), {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Falha ao enviar PDF')
  }

  const data = await res.json()
  return data.document
}

export async function deleteKnowledgeDocument(id: string): Promise<void> {
  const res = await fetch(knowledgeUrl(`/documents/${id}`), {
    method: 'DELETE',
    credentials: 'include',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Falha ao remover documento')
}

export function isKnowledgeApiAvailable(): boolean {
  return !!API_URL
}
