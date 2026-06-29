import { Hono } from 'hono'
import {
  createPresentation,
  deletePresentation,
  getPresentationSynced,
  isSlidesEnabled,
  listPresentations,
  regeneratePresentation,
  updatePresentation,
} from '../services/slides.js'
import { hasGammaKey } from '../services/gamma.js'
import { loadAuth, requireAuth, type AuthVariables } from '../middleware/auth.js'

export const slidesRoutes = new Hono<{ Variables: AuthVariables }>()

slidesRoutes.use('*', loadAuth)

slidesRoutes.get('/health', (c) =>
  c.json({
    ok: true,
    enabled: isSlidesEnabled(),
    gamma: hasGammaKey() ? 'configured' : 'mock',
  }),
)

slidesRoutes.get('/', requireAuth, async (c) => {
  if (!isSlidesEnabled()) {
    return c.json({ error: 'Slides indisponível (DATABASE_URL ausente)' }, 503)
  }

  const teacherId = c.get('teacherId') as string
  const presentations = await listPresentations(teacherId)
  return c.json({ presentations })
})

slidesRoutes.get('/:id/download', requireAuth, async (c) => {
  if (!isSlidesEnabled()) {
    return c.json({ error: 'Slides indisponível' }, 503)
  }

  const teacherId = c.get('teacherId') as string
  const presentation = await getPresentationSynced(c.req.param('id') || '')
  if (!presentation) return c.json({ error: 'Apresentação não encontrada' }, 404)
  if (presentation.teacher_id !== teacherId) {
    return c.json({ error: 'Acesso negado' }, 403)
  }

  if (!presentation.export_url) {
    return c.json(
      {
        error:
          presentation.status === 'processing'
            ? 'Exportação ainda em processamento. Aguarde alguns segundos.'
            : 'Arquivo de exportação indisponível',
      },
      409,
    )
  }

  const fileRes = await fetch(presentation.export_url)
  if (!fileRes.ok) {
    return c.json({ error: 'Não foi possível baixar o arquivo do Gamma' }, 502)
  }

  const buffer = Buffer.from(await fileRes.arrayBuffer())
  const ext = presentation.export_format
  const filename = `${presentation.title.replace(/[^\w\s-]/g, '').trim() || 'apresentacao'}.${ext}`

  return new Response(buffer, {
    headers: {
      'Content-Type': fileRes.headers.get('content-type') || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-cache',
    },
  })
})

slidesRoutes.get('/:id', requireAuth, async (c) => {
  if (!isSlidesEnabled()) {
    return c.json({ error: 'Slides indisponível' }, 503)
  }

  const teacherId = c.get('teacherId') as string
  const presentation = await getPresentationSynced(c.req.param('id') || '')
  if (!presentation) return c.json({ error: 'Apresentação não encontrada' }, 404)
  if (presentation.teacher_id !== teacherId) {
    return c.json({ error: 'Acesso negado' }, 403)
  }

  return c.json({ presentation })
})

slidesRoutes.post('/', requireAuth, async (c) => {
  if (!isSlidesEnabled()) {
    return c.json({ error: 'Slides indisponível' }, 503)
  }

  const teacherId = c.get('teacherId') as string
  const body = await c.req.json<{
    title?: string
    topic?: string
    inputText?: string
    numCards?: number
    exportAs?: 'pdf' | 'pptx' | 'png'
    tone?: string
    audience?: string
  }>()

  const title = body.title?.trim()
  const inputText = body.inputText?.trim()

  if (!title || !inputText) {
    return c.json({ error: 'Título e conteúdo são obrigatórios' }, 400)
  }

  const presentation = await createPresentation({
    teacherId,
    title,
    topic: body.topic?.trim(),
    inputText,
    numCards: body.numCards,
    exportAs: body.exportAs,
    tone: body.tone,
    audience: body.audience,
  })

  return c.json({ presentation }, 201)
})

slidesRoutes.patch('/:id', requireAuth, async (c) => {
  if (!isSlidesEnabled()) {
    return c.json({ error: 'Slides indisponível' }, 503)
  }

  const teacherId = c.get('teacherId') as string
  const body = await c.req.json<{ title?: string; input_text?: string; topic?: string }>()
  const updated = await updatePresentation(c.req.param('id') || '', teacherId, body)
  if (!updated) return c.json({ error: 'Apresentação não encontrada' }, 404)
  return c.json({ presentation: updated })
})

slidesRoutes.post('/:id/regenerate', requireAuth, async (c) => {
  if (!isSlidesEnabled()) {
    return c.json({ error: 'Slides indisponível' }, 503)
  }

  const teacherId = c.get('teacherId') as string
  const current = await getPresentationSynced(c.req.param('id') || '')
  if (!current) return c.json({ error: 'Apresentação não encontrada' }, 404)
  if (current.teacher_id !== teacherId) {
    return c.json({ error: 'Acesso negado' }, 403)
  }

  const presentation = await regeneratePresentation(c.req.param('id') || '', teacherId)
  if (!presentation) return c.json({ error: 'Apresentação não encontrada' }, 404)

  return c.json({ presentation })
})

slidesRoutes.delete('/:id', requireAuth, async (c) => {
  if (!isSlidesEnabled()) {
    return c.json({ error: 'Slides indisponível' }, 503)
  }

  const teacherId = c.get('teacherId') as string
  const deleted = await deletePresentation(c.req.param('id') || '', teacherId)
  if (!deleted) return c.json({ error: 'Apresentação não encontrada' }, 404)
  return c.json({ ok: true })
})
