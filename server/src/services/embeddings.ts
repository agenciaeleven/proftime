import { GoogleGenerativeAI } from '@google/generative-ai'

const EMBEDDING_MODEL = 'text-embedding-004'
const EMBEDDING_DIM = 768

export function hasEmbeddingSupport(): boolean {
  return !!process.env.GEMINI_API_KEY
}

export async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return pseudoEmbedding(text)
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL })
  const result = await model.embedContent(text.slice(0, 8000))
  const values = result.embedding.values

  if (values.length !== EMBEDDING_DIM) {
    throw new Error(`Embedding inválido: dimensão ${values.length}`)
  }

  return values
}

/** Fallback local quando não há chave Gemini (dev). */
function pseudoEmbedding(text: string): number[] {
  const vector = new Array<number>(EMBEDDING_DIM).fill(0)
  const normalized = text.toLowerCase()

  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i)
    vector[i % EMBEDDING_DIM] += code / 255
  }

  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1
  return vector.map((v) => v / magnitude)
}

export function vectorToSql(values: number[]): string {
  return `[${values.join(',')}]`
}

export { EMBEDDING_DIM }
