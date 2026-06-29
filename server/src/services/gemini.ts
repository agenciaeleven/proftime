import {
  GoogleGenerativeAI,
  SchemaType,
  type ResponseSchema,
  type Part,
  type ModelParams,
} from '@google/generative-ai'
import { fallbackInvoke, type InvokeParams } from './fallback.js'
import { enhancePrompt } from './prompts/activity.js'

const MODEL_MAP: Record<string, string> = {
  gemini_3_flash: 'gemini-2.0-flash',
  gemini_3_1_pro: 'gemini-1.5-pro',
  gpt_5_mini: 'gemini-2.0-flash',
  gpt_5: 'gemini-2.0-flash',
}

function resolveModel(name?: string): string {
  if (!name) return 'gemini-2.0-flash'
  return MODEL_MAP[name] || 'gemini-2.0-flash'
}

/** Converte JSON Schema simples (OpenAPI) para ResponseSchema do Gemini. */
function toGeminiSchema(schema: object): ResponseSchema {
  const s = schema as Record<string, unknown>
  const type = String(s.type || 'object').toLowerCase()

  if (type === 'array') {
    const items = s.items as Record<string, unknown> | undefined
    return {
      type: SchemaType.ARRAY,
      items: items ? toGeminiSchema(items) : { type: SchemaType.STRING },
    }
  }

  if (type === 'object') {
    const props = (s.properties as Record<string, Record<string, unknown>>) || {}
    const properties: Record<string, ResponseSchema> = {}
    for (const [key, val] of Object.entries(props)) {
      properties[key] = toGeminiSchema(val)
    }
    return { type: SchemaType.OBJECT, properties }
  }

  if (type === 'number' || type === 'integer') return { type: SchemaType.NUMBER }
  if (type === 'boolean') return { type: SchemaType.BOOLEAN }
  return { type: SchemaType.STRING }
}

async function fetchFilePart(url: string): Promise<Part | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    const contentType = res.headers.get('content-type') || 'application/octet-stream'
    return {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType: contentType.split(';')[0],
      },
    }
  } catch {
    return null
  }
}

export async function invokeGemini(params: InvokeParams): Promise<string | Record<string, unknown>> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.warn('[gemini] GEMINI_API_KEY ausente — usando respostas mock (plano gratuito local)')
    return fallbackInvoke(params)
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const modelName = resolveModel(params.model)

  const generationConfig: Record<string, unknown> = {}

  if (params.response_json_schema) {
    generationConfig.responseMimeType = 'application/json'
    generationConfig.responseSchema = toGeminiSchema(params.response_json_schema)
  }

  const prompt = enhancePrompt(
    params.add_context_from_internet && !params.response_json_schema
      ? `${params.prompt}\n\nUse seu conhecimento atualizado sobre tendências e cultura jovem brasileira em ${new Date().getFullYear()}.`
      : params.prompt,
  )

  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: generationConfig as ModelParams['generationConfig'],
  })

  const parts: Part[] = [{ text: prompt }]

  if (params.file_urls?.length) {
    for (const url of params.file_urls) {
      const part = await fetchFilePart(url)
      if (part) parts.push(part)
    }
  }

  try {
    const result = await model.generateContent({ contents: [{ role: 'user', parts }] })
    const text = result.response.text()

    if (params.response_json_schema) {
      try {
        return JSON.parse(text) as Record<string, unknown>
      } catch {
        return { raw: text }
      }
    }

    return text
  } catch (err) {
    console.error('[gemini] Erro na API:', err)
    return fallbackInvoke(params)
  }
}

export function hasGeminiKey(): boolean {
  return !!process.env.GEMINI_API_KEY
}
