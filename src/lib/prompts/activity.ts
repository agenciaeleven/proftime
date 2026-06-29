import type { InvokeLLMParams } from '@/types'

export type ActivityType =
  | 'multipla_escolha'
  | 'dissertativa'
  | 'verdadeiro_falso'
  | 'pratica'

export interface ActivityFormInput {
  subject: string
  topic: string
  level: string
  type: ActivityType | string
  quantity: string | number
}

const TYPE_LABELS: Record<string, string> = {
  multipla_escolha: 'Múltipla Escolha',
  dissertativa: 'Dissertativa',
  verdadeiro_falso: 'Verdadeiro ou Falso',
  pratica: 'Atividade Prática',
}

const LEVEL_GUIDANCE: Record<string, string> = {
  Fácil:
    'Linguagem simples, conceitos fundamentais, exemplos guiados e baixa abstração. Adequado para introdução ou revisão básica.',
  Médio:
    'Exige compreensão e aplicação do conteúdo. Enunciados claros com um passo de raciocínio intermediário.',
  Difícil:
    'Exige análise, comparação ou resolução em múltiplas etapas. Vocabulário técnico moderado.',
  Avançado:
    'Alto grau de complexidade, síntese, justificativa aprofundada ou aplicação em contextos não triviais.',
}

const TYPE_RULES: Record<string, string> = {
  multipla_escolha: `Cada questão DEVE ter:
- enunciado focado exclusivamente no tema informado
- exatamente 4 alternativas rotuladas A), B), C) e D)
- gabarito com a letra correta
- alternativas plausíveis (distratores coerentes com o tema)
Não inclua questões dissertativas nem atividades práticas.`,
  dissertativa: `Cada questão DEVE ter:
- enunciado que peça argumentação, explicação ou resolução escrita
- criterios_correcao com 3 a 5 critérios objetivos de avaliação
- gabarito com resposta esperada ou modelo de resposta
Não inclua alternativas de múltipla escolha.`,
  verdadeiro_falso: `Cada questão DEVE ter:
- enunciado em forma de afirmação sobre o tema (não perguntas abertas)
- gabarito apenas "Verdadeiro" ou "Falso"
- criterios_correcao explicando por que a afirmação é V ou F
Não inclua alternativas A/B/C/D.`,
  pratica: `Cada questão representa UMA atividade prática e DEVE ter:
- enunciado com objetivo pedagógico claro
- passos numerados (3 a 6 etapas)
- materiais necessários
- tempo_estimado_min realista
- criterios_correcao ou orientações de avaliação
Não gere questões de prova tradicional.`,
}

export const ACTIVITY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    titulo: { type: 'string' },
    disciplina: { type: 'string' },
    tema: { type: 'string' },
    nivel: { type: 'string' },
    tipo: { type: 'string' },
    orientacoes_gerais: { type: 'string' },
    questoes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          numero: { type: 'integer' },
          enunciado: { type: 'string' },
          alternativas: { type: 'array', items: { type: 'string' } },
          gabarito: { type: 'string' },
          criterios_correcao: { type: 'string' },
          materiais: { type: 'string' },
          passos: { type: 'array', items: { type: 'string' } },
          tempo_estimado_min: { type: 'integer' },
        },
        required: ['numero', 'enunciado'],
      },
    },
  },
  required: ['titulo', 'disciplina', 'tema', 'nivel', 'tipo', 'questoes'],
}

export function buildActivityGenerationRequest(form: ActivityFormInput): InvokeLLMParams {
  const quantity = Math.min(20, Math.max(1, Number(form.quantity) || 5))
  const typeLabel = TYPE_LABELS[form.type] || form.type
  const levelGuide = LEVEL_GUIDANCE[form.level] || LEVEL_GUIDANCE.Médio
  const typeRules = TYPE_RULES[form.type] || TYPE_RULES.multipla_escolha

  const prompt = `[PROFTIME_TASK:activity_generation]

Você é um especialista em avaliação e design instrucional para professores brasileiros.

## Parâmetros obrigatórios (respeite exatamente)
- Disciplina: ${form.subject}
- Tema / conteúdo: ${form.topic}
- Nível de dificuldade: ${form.level}
- Tipo de atividade: ${typeLabel} (${form.type})
- Quantidade exata de itens: ${quantity}

## Nível "${form.level}"
${levelGuide}

## Regras do tipo "${typeLabel}"
${typeRules}

## Regras gerais
1. Gere EXATAMENTE ${quantity} itens em "questoes", numerados de 1 a ${quantity}.
2. TODO o conteúdo deve ser sobre "${form.topic}" na disciplina ${form.subject}. Não mude de assunto.
3. Use português brasileiro, linguagem adequada ao nível "${form.level}".
4. Evite repetir enunciados ou estruturas idênticas entre os itens.
5. Contextualize com exemplos coerentes com a disciplina quando fizer sentido.
6. Se houver contexto da base de conhecimento do professor, priorize-o sem contradizer o tema.
7. O campo "tipo" na resposta deve ser "${typeLabel}".
8. O campo "tema" deve ser exatamente "${form.topic}".
9. O campo "disciplina" deve ser exatamente "${form.subject}".
10. O campo "nivel" deve ser exatamente "${form.level}".

Retorne JSON válido seguindo o schema solicitado.`

  return {
    prompt,
    model: 'gemini_3_flash',
    use_knowledge_base: true,
    response_json_schema: ACTIVITY_JSON_SCHEMA,
  }
}

interface ActivityQuestion {
  numero?: number
  enunciado?: string
  alternativas?: string[]
  gabarito?: string
  criterios_correcao?: string
  materiais?: string
  passos?: string[]
  tempo_estimado_min?: number
}

interface ActivityPayload {
  titulo?: string
  disciplina?: string
  tema?: string
  nivel?: string
  tipo?: string
  orientacoes_gerais?: string
  questoes?: ActivityQuestion[]
}

function formatQuestion(q: ActivityQuestion, type: string, index: number): string {
  const n = q.numero ?? index + 1
  const lines: string[] = [`### Questão ${n}`, q.enunciado || '']

  if (type === 'multipla_escolha' && q.alternativas?.length) {
    lines.push('', ...q.alternativas.map((alt, i) => {
      const label = ['A', 'B', 'C', 'D'][i] || String(i + 1)
      return alt.trim().match(/^[A-D]\)/) ? alt : `${label}) ${alt.replace(/^[A-D]\)\s*/, '')}`
    }))
  }

  if (type === 'pratica' && q.materiais) {
    lines.push('', `**Materiais:** ${q.materiais}`)
  }

  if (type === 'pratica' && q.passos?.length) {
    lines.push('', '**Passos:**')
    q.passos.forEach((step, i) => lines.push(`${i + 1}. ${step}`))
  }

  if (type === 'pratica' && q.tempo_estimado_min) {
    lines.push('', `**Tempo estimado:** ${q.tempo_estimado_min} min`)
  }

  if (q.gabarito) {
    lines.push('', `**Gabarito:** ${q.gabarito}`)
  }

  if (q.criterios_correcao) {
    lines.push('', `**Critérios de correção:** ${q.criterios_correcao}`)
  }

  return lines.join('\n')
}

export function formatActivityResult(data: Record<string, unknown>): string {
  const payload = data as ActivityPayload
  const questoes = payload.questoes || []

  if (!questoes.length) {
    return typeof data.raw === 'string' ? data.raw : JSON.stringify(data, null, 2)
  }

  const header = [
    `# ${payload.titulo || 'Atividades Geradas'}`,
    '',
    `**Disciplina:** ${payload.disciplina || '—'}`,
    `**Tema:** ${payload.tema || '—'}`,
    `**Nível:** ${payload.nivel || '—'}`,
    `**Tipo:** ${payload.tipo || '—'}`,
  ]

  if (payload.orientacoes_gerais) {
    header.push('', `> ${payload.orientacoes_gerais}`)
  }

  const typeKey = Object.entries(TYPE_LABELS).find(([, label]) => label === payload.tipo)?.[0] || 'multipla_escolha'

  const body = questoes.map((q, i) => formatQuestion(q, typeKey, i)).join('\n\n')

  return [...header, '', '---', '', body].join('\n')
}
