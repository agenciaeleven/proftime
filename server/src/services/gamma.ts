const GAMMA_BASE = 'https://public-api.gamma.app/v1.0'

export type GammaExportFormat = 'pdf' | 'pptx' | 'png'
export type GammaStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface GammaCreateParams {
  inputText: string
  title?: string
  numCards?: number
  exportAs?: GammaExportFormat
  tone?: string
  audience?: string
  additionalInstructions?: string
}

export interface GammaGenerationResult {
  generationId: string
  status: GammaStatus | string
  gammaId?: string
  gammaUrl?: string
  exportUrl?: string
  error?: string
}

export function hasGammaKey(): boolean {
  return !!process.env.GAMMA_API_KEY
}

export async function createGammaGeneration(
  params: GammaCreateParams,
): Promise<{ generationId: string }> {
  const apiKey = process.env.GAMMA_API_KEY
  if (!apiKey) throw new Error('GAMMA_API_KEY não configurada')

  const res = await fetch(`${GAMMA_BASE}/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({
      inputText: params.inputText,
      title: params.title,
      format: 'presentation',
      textMode: 'generate',
      numCards: params.numCards ?? 10,
      exportAs: params.exportAs ?? 'pdf',
      additionalInstructions: params.additionalInstructions,
      textOptions: {
        language: 'pt-br',
        tone: params.tone || 'profissional, claro e didático',
        audience: params.audience || 'professores e estudantes do ensino brasileiro',
      },
      sharingOptions: {
        externalAccess: 'edit',
      },
      cardOptions: {
        dimensions: '16x9',
      },
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      data.message || data.error || `Gamma API error (${res.status})`
    throw new Error(message)
  }

  if (!data.generationId) {
    throw new Error('Gamma não retornou generationId')
  }

  return { generationId: data.generationId }
}

export async function getGammaGeneration(
  generationId: string,
): Promise<GammaGenerationResult> {
  const apiKey = process.env.GAMMA_API_KEY
  if (!apiKey) throw new Error('GAMMA_API_KEY não configurada')

  const res = await fetch(`${GAMMA_BASE}/generations/${generationId}`, {
    headers: { 'X-API-KEY': apiKey },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || `Gamma status error (${res.status})`)
  }

  return {
    generationId,
    status: data.status || 'pending',
    gammaId: data.gammaId,
    gammaUrl: data.gammaUrl,
    exportUrl: data.exportUrl,
    error: data.error?.message || data.error,
  }
}
