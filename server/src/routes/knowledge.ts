import { Hono } from 'hono'
import {
  createDocumentFromPdf,
  deleteDocument,
  getDocument,
  isKnowledgeEnabled,
  listDocuments,
} from '../services/knowledge.js'
import { loadAuth, requireAuth, type AuthVariables } from '../middleware/auth.js'

export const knowledgeRoutes = new Hono<{ Variables: AuthVariables }>()

knowledgeRoutes.use('*', loadAuth)

knowledgeRoutes.get('/health', (c) =>
  c.json({
    ok: true,
    enabled: isKnowledgeEnabled(),
  }),
)

knowledgeRoutes.get('/documents', requireAuth, async (c) => {
  if (!isKnowledgeEnabled()) {
    return c.json({ error: 'Base de conhecimento indisponível (DATABASE_URL ausente)' }, 503)
  }

  const teacherId = c.get('teacherId') as string
  const documents = await listDocuments(teacherId)
  return c.json({ documents })
})

knowledgeRoutes.get('/documents/:id', requireAuth, async (c) => {
  if (!isKnowledgeEnabled()) {
    return c.json({ error: 'Base de conhecimento indisponível' }, 503)
  }

  const doc = await getDocument(c.req.param('id') || '')
  if (!doc) return c.json({ error: 'Documento não encontrado' }, 404)

  const teacherId = c.get('teacherId') as string
  if (doc.teacher_id !== teacherId) {
    return c.json({ error: 'Acesso negado' }, 403)
  }

  return c.json({ document: doc })
})

knowledgeRoutes.post('/documents', requireAuth, async (c) => {
  if (!isKnowledgeEnabled()) {
    return c.json({ error: 'Base de conhecimento indisponível' }, 503)
  }

  const teacherId = c.get('teacherId') as string
  const form = await c.req.parseBody()
  const file = form.file
  const title = String(form.title || '').trim()
  const subject = String(form.subject || '').trim()
  const description = String(form.description || '').trim()

  if (!file || typeof file === 'string') {
    return c.json({ error: 'Arquivo PDF inválido' }, 400)
  }

  const blob = file as File
  const mimeType = blob.type || 'application/octet-stream'

  if (mimeType !== 'application/pdf') {
    return c.json({ error: 'Apenas arquivos PDF são aceitos na base de conhecimento' }, 400)
  }

  const buffer = Buffer.from(await blob.arrayBuffer())
  if (buffer.length > 15 * 1024 * 1024) {
    return c.json({ error: 'PDF muito grande (máx. 15 MB)' }, 400)
  }

  const document = await createDocumentFromPdf({
    teacherId,
    title: title || blob.name.replace(/\.pdf$/i, ''),
    fileName: blob.name || 'documento.pdf',
    mimeType,
    fileData: buffer,
    subject: subject || undefined,
    description: description || undefined,
  })

  return c.json({ document }, 201)
})

knowledgeRoutes.delete('/documents/:id', requireAuth, async (c) => {
  if (!isKnowledgeEnabled()) {
    return c.json({ error: 'Base de conhecimento indisponível' }, 503)
  }

  const doc = await getDocument(c.req.param('id') || '')
  if (!doc) return c.json({ error: 'Documento não encontrado' }, 404)

  const teacherId = c.get('teacherId') as string
  if (doc.teacher_id !== teacherId) {
    return c.json({ error: 'Acesso negado' }, 403)
  }

  const deleted = await deleteDocument(c.req.param('id') || '')
  if (!deleted) return c.json({ error: 'Documento não encontrado' }, 404)
  return c.json({ ok: true })
})
