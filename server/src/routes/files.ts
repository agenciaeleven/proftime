import { Hono } from 'hono'
import { randomUUID } from 'node:crypto'

interface StoredFile {
  buffer: Buffer
  mimeType: string
  name: string
}

const store = new Map<string, StoredFile>()

export const filesRoutes = new Hono()

function publicBase(c: { req: { url: string } }): string {
  return process.env.PUBLIC_URL || new URL(c.req.url).origin
}

filesRoutes.post('/upload', async (c) => {
  const form = await c.req.parseBody()
  const file = form.file

  if (!file || typeof file === 'string') {
    return c.json({ error: 'Arquivo inválido' }, 400)
  }

  const blob = file as File
  const buffer = Buffer.from(await blob.arrayBuffer())
  const id = randomUUID()
  const mimeType = blob.type || 'application/octet-stream'

  store.set(id, { buffer, mimeType, name: blob.name || 'upload' })

  const file_url = `${publicBase(c)}/files/${id}`
  return c.json({ file_url })
})

filesRoutes.get('/:id', (c) => {
  const id = c.req.param('id')
  const entry = store.get(id)

  if (!entry) return c.text('Not found', 404)

  return new Response(new Uint8Array(entry.buffer), {
    headers: {
      'Content-Type': entry.mimeType,
      'Content-Disposition': `inline; filename="${entry.name}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  })
})
