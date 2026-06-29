import { hasDatabase, query } from '../db/pool.js'
import {
  createGammaGeneration,
  getGammaGeneration,
  hasGammaKey,
  type GammaExportFormat,
} from './gamma.js'

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
  export_format: GammaExportFormat
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  num_cards: number
  created_at: string
  updated_at: string
}

export interface CreatePresentationInput {
  teacherId: string
  title: string
  topic?: string
  inputText: string
  numCards?: number
  exportAs?: GammaExportFormat
  tone?: string
  audience?: string
}

export function isSlidesEnabled(): boolean {
  return hasDatabase()
}

function mapRow(row: SlidePresentation): SlidePresentation {
  return row
}

export async function listPresentations(teacherId: string): Promise<SlidePresentation[]> {
  const { rows } = await query<SlidePresentation>(
    `SELECT id, teacher_id, title, topic, input_text, generation_id, gamma_id, gamma_url,
            export_url, export_format, status, error_message, num_cards, created_at, updated_at
     FROM gamma_presentations
     WHERE teacher_id = $1
     ORDER BY created_at DESC`,
    [teacherId],
  )
  return rows.map(mapRow)
}

export async function getPresentation(id: string): Promise<SlidePresentation | null> {
  const { rows } = await query<SlidePresentation>(
    `SELECT id, teacher_id, title, topic, input_text, generation_id, gamma_id, gamma_url,
            export_url, export_format, status, error_message, num_cards, created_at, updated_at
     FROM gamma_presentations WHERE id = $1`,
    [id],
  )
  return rows[0] ? mapRow(rows[0]) : null
}

async function syncGammaStatus(presentation: SlidePresentation): Promise<SlidePresentation> {
  if (!presentation.generation_id || !hasGammaKey()) return presentation
  if (presentation.status === 'completed' || presentation.status === 'failed') {
    return presentation
  }

  try {
    const gamma = await getGammaGeneration(presentation.generation_id)
    const status =
      gamma.status === 'completed'
        ? 'completed'
        : gamma.status === 'failed'
          ? 'failed'
          : 'processing'

    const { rows } = await query<SlidePresentation>(
      `UPDATE gamma_presentations SET
        status = $2,
        gamma_id = COALESCE($3, gamma_id),
        gamma_url = COALESCE($4, gamma_url),
        export_url = COALESCE($5, export_url),
        error_message = $6,
        updated_at = NOW()
       WHERE id = $1
       RETURNING id, teacher_id, title, topic, input_text, generation_id, gamma_id, gamma_url,
                 export_url, export_format, status, error_message, num_cards, created_at, updated_at`,
      [
        presentation.id,
        status,
        gamma.gammaId ?? null,
        gamma.gammaUrl ?? null,
        gamma.exportUrl ?? null,
        gamma.error ?? null,
      ],
    )

    return rows[0] ?? presentation
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao consultar Gamma'
    await query(
      `UPDATE gamma_presentations SET status = 'failed', error_message = $2, updated_at = NOW() WHERE id = $1`,
      [presentation.id, message],
    )
    return { ...presentation, status: 'failed', error_message: message }
  }
}

export async function getPresentationSynced(id: string): Promise<SlidePresentation | null> {
  const presentation = await getPresentation(id)
  if (!presentation) return null
  return syncGammaStatus(presentation)
}

export async function createPresentation(
  input: CreatePresentationInput,
): Promise<SlidePresentation> {
  const numCards = Math.min(30, Math.max(3, input.numCards ?? 10))
  const exportFormat = input.exportAs ?? 'pdf'

  const { rows } = await query<SlidePresentation>(
    `INSERT INTO gamma_presentations
      (teacher_id, title, topic, input_text, export_format, num_cards, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending')
     RETURNING id, teacher_id, title, topic, input_text, generation_id, gamma_id, gamma_url,
               export_url, export_format, status, error_message, num_cards, created_at, updated_at`,
    [
      input.teacherId,
      input.title,
      input.topic ?? null,
      input.inputText,
      exportFormat,
      numCards,
    ],
  )

  let presentation = rows[0]

  if (!hasGammaKey()) {
    const { rows: mockRows } = await query<SlidePresentation>(
      `UPDATE gamma_presentations SET
        status = 'completed',
        gamma_url = $2,
        export_url = NULL,
        error_message = 'Modo demo — configure GAMMA_API_KEY para gerar apresentações reais.',
        updated_at = NOW()
       WHERE id = $1
       RETURNING id, teacher_id, title, topic, input_text, generation_id, gamma_id, gamma_url,
                 export_url, export_format, status, error_message, num_cards, created_at, updated_at`,
      [
        presentation.id,
        `https://gamma.app/create?prompt=${encodeURIComponent(input.inputText.slice(0, 500))}`,
      ],
    )
    return mockRows[0]
  }

  try {
    const gamma = await createGammaGeneration({
      inputText: input.inputText,
      title: input.title,
      numCards,
      exportAs: exportFormat,
      tone: input.tone,
      audience: input.audience,
      additionalInstructions:
        'Crie slides educacionais em português brasileiro, com títulos claros e bullet points objetivos.',
    })

    const { rows: updated } = await query<SlidePresentation>(
      `UPDATE gamma_presentations SET
        generation_id = $2,
        status = 'processing',
        updated_at = NOW()
       WHERE id = $1
       RETURNING id, teacher_id, title, topic, input_text, generation_id, gamma_id, gamma_url,
                 export_url, export_format, status, error_message, num_cards, created_at, updated_at`,
      [presentation.id, gamma.generationId],
    )

    presentation = updated[0]
    return syncGammaStatus(presentation)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao criar no Gamma'
    const { rows: failed } = await query<SlidePresentation>(
      `UPDATE gamma_presentations SET status = 'failed', error_message = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING id, teacher_id, title, topic, input_text, generation_id, gamma_id, gamma_url,
                 export_url, export_format, status, error_message, num_cards, created_at, updated_at`,
      [presentation.id, message],
    )
    return failed[0]
  }
}

export async function updatePresentation(
  id: string,
  teacherId: string,
  data: { title?: string; input_text?: string; topic?: string },
): Promise<SlidePresentation | null> {
  const { rows } = await query<SlidePresentation>(
    `UPDATE gamma_presentations SET
      title = COALESCE($3, title),
      input_text = COALESCE($4, input_text),
      topic = COALESCE($5, topic),
      updated_at = NOW()
     WHERE id = $1 AND teacher_id = $2
     RETURNING id, teacher_id, title, topic, input_text, generation_id, gamma_id, gamma_url,
               export_url, export_format, status, error_message, num_cards, created_at, updated_at`,
    [id, teacherId, data.title ?? null, data.input_text ?? null, data.topic ?? null],
  )
  return rows[0] ?? null
}

export async function regeneratePresentation(
  id: string,
  teacherId: string,
): Promise<SlidePresentation | null> {
  const current = await getPresentation(id)
  if (!current || current.teacher_id !== teacherId) return null

  if (!hasGammaKey()) {
    const { rows } = await query<SlidePresentation>(
      `UPDATE gamma_presentations SET
        status = 'completed',
        gamma_url = $2,
        export_url = NULL,
        error_message = 'Modo demo — configure GAMMA_API_KEY.',
        updated_at = NOW()
       WHERE id = $1
       RETURNING id, teacher_id, title, topic, input_text, generation_id, gamma_id, gamma_url,
                 export_url, export_format, status, error_message, num_cards, created_at, updated_at`,
      [
        id,
        `https://gamma.app/create?prompt=${encodeURIComponent(current.input_text.slice(0, 500))}`,
      ],
    )
    return rows[0] ?? null
  }

  try {
    const gamma = await createGammaGeneration({
      inputText: current.input_text,
      title: current.title,
      numCards: current.num_cards,
      exportAs: current.export_format,
      additionalInstructions:
        'Crie slides educacionais em português brasileiro, com títulos claros e bullet points objetivos.',
    })

    const { rows } = await query<SlidePresentation>(
      `UPDATE gamma_presentations SET
        generation_id = $2,
        gamma_id = NULL,
        gamma_url = NULL,
        export_url = NULL,
        status = 'processing',
        error_message = NULL,
        updated_at = NOW()
       WHERE id = $1
       RETURNING id, teacher_id, title, topic, input_text, generation_id, gamma_id, gamma_url,
                 export_url, export_format, status, error_message, num_cards, created_at, updated_at`,
      [id, gamma.generationId],
    )

    return syncGammaStatus(rows[0])
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao regenerar no Gamma'
    const { rows } = await query<SlidePresentation>(
      `UPDATE gamma_presentations SET status = 'failed', error_message = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING id, teacher_id, title, topic, input_text, generation_id, gamma_id, gamma_url,
                 export_url, export_format, status, error_message, num_cards, created_at, updated_at`,
      [id, message],
    )
    return rows[0] ?? null
  }
}

export async function deletePresentation(id: string, teacherId: string): Promise<boolean> {
  const { rowCount } = await query(
    'DELETE FROM gamma_presentations WHERE id = $1 AND teacher_id = $2',
    [id, teacherId],
  )
  return (rowCount ?? 0) > 0
}
