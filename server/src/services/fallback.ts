/** Respostas mock quando GEMINI_API_KEY não está configurada (dev / free tier local). */

export interface InvokeParams {
  prompt: string
  model?: string
  add_context_from_internet?: boolean
  response_json_schema?: object
  file_urls?: string[]
}

const AI_RESPONSES = [
  'Aqui está uma sugestão de dinâmica: **Quiz Interativo** — Divida a turma em grupos de 4. Cada grupo cria 3 perguntas sobre o tema. Os grupos trocam perguntas e têm 2 minutos para responder.',
  'Experimente **Think-Pair-Share**: 1) Pergunta desafiadora. 2) 2 min pensando sozinhos. 3) Discutem em duplas. 4) Compartilham com a turma.',
  'Para avaliação formativa, use **rubricas de autoavaliação** com critérios claros (1–4 estrelas) por habilidade.',
]

let responseIndex = 0

function lessonPlan() {
  return `## Introdução (10 min)
Apresente o tema com uma pergunta motivadora e conecte ao cotidiano dos alunos.

## Desenvolvimento (25 min)
Explique o conceito com exemplos visuais. Resolva 2 exercícios no quadro com participação da turma.

## Atividade prática (10 min)
Duplas resolvem problemas contextualizados. Circule para tirar dúvidas.

## Conclusão (5 min)
Revisão dos pontos-chave e tarefa de casa com 5 exercícios.`
}

function parseActivityParams(prompt: string) {
  const subject = prompt.match(/Disciplina:\s*([^\n]+)/)?.[1]?.trim() || 'a disciplina'
  const topic = prompt.match(/Tema \/ conteúdo:\s*([^\n]+)/)?.[1]?.trim() || 'o tema'
  const level = prompt.match(/Nível de dificuldade:\s*([^\n]+)/)?.[1]?.trim() || 'Médio'
  const typeLine = prompt.match(/Tipo de atividade:\s*([^\n]+)/)?.[1]?.trim() || 'Múltipla Escolha'
  const quantity = Number(prompt.match(/Quantidade exata de itens:\s*(\d+)/)?.[1] || 5)
  const typeKey = typeLine.includes('(')
    ? typeLine.match(/\(([^)]+)\)/)?.[1] || 'multipla_escolha'
    : 'multipla_escolha'

  return { subject, topic, level, typeKey, typeLine, quantity }
}

function buildMockActivityJson(prompt: string) {
  const { subject, topic, level, typeKey, typeLine, quantity } = parseActivityParams(prompt)

  const questoes = Array.from({ length: quantity }, (_, i) => {
    const numero = i + 1
    if (typeKey === 'verdadeiro_falso') {
      return {
        numero,
        enunciado: `${topic}: afirmação ${numero} para análise em ${subject}.`,
        gabarito: numero % 2 === 0 ? 'Falso' : 'Verdadeiro',
        criterios_correcao: `Explicar o conceito de ${topic} com base no conteúdo da disciplina.`,
      }
    }
    if (typeKey === 'dissertativa') {
      return {
        numero,
        enunciado: `Discorra sobre ${topic} em ${subject}, considerando o nível ${level}.`,
        gabarito: 'Resposta modelo com introdução, desenvolvimento e conclusão.',
        criterios_correcao: 'Clareza, domínio do conteúdo, exemplos e coerência argumentativa.',
      }
    }
    if (typeKey === 'pratica') {
      return {
        numero,
        enunciado: `Atividade prática ${numero} sobre ${topic}.`,
        materiais: 'Quadro, caderno e material de apoio.',
        passos: [
          'Apresentar o desafio aos estudantes.',
          'Organizar grupos e distribuir instruções.',
          'Acompanhar a execução da atividade.',
          'Socializar resultados e síntese final.',
        ],
        tempo_estimado_min: 20 + numero * 5,
        criterios_correcao: 'Participação, aplicação do conteúdo e registro das conclusões.',
      }
    }
    return {
      numero,
      enunciado: `Questão ${numero} sobre ${topic} em ${subject}.`,
      alternativas: [
        `A) Alternativa correta sobre ${topic}`,
        'B) Alternativa plausível',
        'C) Alternativa incorreta',
        'D) Alternativa incorreta',
      ],
      gabarito: 'A',
    }
  })

  return {
    titulo: `Atividades de ${topic}`,
    disciplina: subject,
    tema: topic,
    nivel: level,
    tipo: typeLine.split('(')[0].trim(),
    orientacoes_gerais: `Conjunto gerado para ${subject}, focado em ${topic}, nível ${level}.`,
    questoes,
  }
}

export async function fallbackInvoke(params: InvokeParams): Promise<string | Record<string, unknown>> {
  await new Promise((r) => setTimeout(r, 400))

  if (params.response_json_schema) {
    if (params.prompt.includes('student_answers')) {
      return { student_answers: ['A', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'B', 'A'] }
    }
    if (params.prompt.includes('tendências') || params.prompt.includes('trends')) {
      return {
        trends: [
          { title: 'IA na Educação', category: 'tech', description: 'Personalização do aprendizado com IA.', tip: 'Use um chatbot para revisão.', heat: 95 },
          { title: 'Gamificação', category: 'educacao', description: 'Elementos de jogos em sala.', tip: 'Crie missões semanais.', heat: 88 },
          { title: 'Gen Z Slang', category: 'viral', description: 'Linguagem atual dos adolescentes.', tip: 'Conecte gírias ao conteúdo.', heat: 82 },
          { title: 'Sala Invertida', category: 'educacao', description: 'Vídeos curtos como tarefa.', tip: 'Use o tempo de aula para prática.', heat: 79 },
          { title: 'Sustentabilidade', category: 'cultura', description: 'Debates ambientais em alta.', tip: 'Projeto interdisciplinar.', heat: 75 },
        ],
      }
    }
    if (params.prompt.includes('[PROFTIME_TASK:activity_generation]')) {
      return buildMockActivityJson(params.prompt)
    }
  }

  if (params.prompt.includes('plano de aula')) return lessonPlan()
  if (params.prompt.includes('[PROFTIME_TASK:activity_generation]')) {
    return buildMockActivityJson(params.prompt)
  }

  const text = AI_RESPONSES[responseIndex % AI_RESPONSES.length]
  responseIndex += 1
  return text
}
