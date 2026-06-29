import { authHeaders } from '@/api/authToken'

const API_URL = import.meta.env.VITE_API_URL || ''

export type SlideExportFormat = 'pdf' | 'pptx' | 'png'
export type SlideStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface SlidePresentation {
  id: string
  teacher_id: string
  title: string
  topic: string | null
  input_text: string
  generation_id: string | null
  gamma_id: string | null
  gamma_url: string | null
  export_url: string | null
  export_format: SlideExportFormat
  status: SlideStatus
  error_message: string | null
  num_cards: number
  created_at: string
  updated_at: string
}

export interface CreateSlideInput {
  title: string
  topic?: string
  inputText: string
  numCards?: number
  exportAs?: SlideExportFormat
  tone?: string
  audience?: string
}

function slidesUrl(path: string): string {
  if (!API_URL) throw new Error('VITE_API_URL não configurada')
  return `${API_URL}/slides${path}`
}

export function isSlidesApiAvailable(): boolean {
  return !!API_URL
}

export async function listSlidePresentations(): Promise<SlidePresentation[]> {
  const res = await fetch(slidesUrl('/'), {
    credentials: 'include',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Falha ao listar apresentações')
  const data = await res.json()
  return data.presentations
}

export async function getSlidePresentation(id: string): Promise<SlidePresentation> {
  const res = await fetch(slidesUrl(`/${id}`), {
    credentials: 'include',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Falha ao carregar apresentação')
  const data = await res.json()
  return data.presentation
}

export async function createSlidePresentation(
  input: CreateSlideInput,
): Promise<SlidePresentation> {
  const res = await fetch(slidesUrl('/'), {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(input),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Falha ao gerar slides')
  return data.presentation
}

export async function updateSlidePresentation(
  id: string,
  data: { title?: string; input_text?: string; topic?: string },
): Promise<SlidePresentation> {
  const res = await fetch(slidesUrl(`/${id}`), {
    method: 'PATCH',
    credentials: 'include',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'Falha ao atualizar')
  return body.presentation
}

export async function regenerateSlidePresentation(id: string): Promise<SlidePresentation> {
  const res = await fetch(slidesUrl(`/${id}/regenerate`), {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Falha ao regenerar')
  return data.presentation
}

export async function downloadSlidePresentation(id: string, title: string): Promise<void> {
  const res = await fetch(slidesUrl(`/${id}/download`), {
    credentials: 'include',
    headers: authHeaders(),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Falha no download')
  }

  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition') || ''
  const match = disposition.match(/filename="([^"]+)"/)
  const filename = match?.[1] || `${title.replace(/[^\w\s-]/g, '').trim() || 'apresentacao'}.pdf`

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function deleteSlidePresentation(id: string): Promise<void> {
  const res = await fetch(slidesUrl(`/${id}`), {
    method: 'DELETE',
    credentials: 'include',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Falha ao excluir apresentação')
}
