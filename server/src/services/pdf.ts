import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer)
  return result.text.replace(/\s+/g, ' ').trim()
}

export function chunkText(text: string, chunkSize = 900, overlap = 120): string[] {
  if (!text.trim()) return []

  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length)

    if (end < text.length) {
      const slice = text.slice(start, end)
      const lastBreak = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('\n'))
      if (lastBreak > chunkSize * 0.5) {
        end = start + lastBreak + 1
      }
    }

    const chunk = text.slice(start, end).trim()
    if (chunk) chunks.push(chunk)

    if (end >= text.length) break
    start = Math.max(end - overlap, start + 1)
  }

  return chunks
}
