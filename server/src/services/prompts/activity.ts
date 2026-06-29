const ACTIVITY_SYSTEM = `Você gera atividades escolares para professores brasileiros.
Siga rigorosamente disciplina, tema, nível, tipo e quantidade informados no prompt.
Não invente outro assunto. Não altere os parâmetros pedidos.
Respeite o formato pedido para cada tipo de atividade.
Responda somente em JSON válido conforme o schema.`

export function enhancePrompt(prompt: string): string {
  if (!prompt.includes('[PROFTIME_TASK:activity_generation]')) {
    return prompt
  }

  return `${ACTIVITY_SYSTEM}\n\n${prompt.replace('[PROFTIME_TASK:activity_generation]', '').trim()}`
}
