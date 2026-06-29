import { Hono } from 'hono'
import { invokeGemini, hasGeminiKey } from '../services/gemini.js'
import { formatKnowledgeContext, isKnowledgeEnabled, searchKnowledge } from '../services/knowledge.js'

export const aiRoutes = new Hono()

aiRoutes.get('/health', (c) =>
  c.json({
    ok: true,
    gemini: hasGeminiKey() ? 'configured' : 'mock (defina GEMINI_API_KEY no Railway)',
    knowledge: isKnowledgeEnabled() ? 'enabled' : 'disabled',
    model: 'gemini-2.0-flash',
  }),
)

aiRoutes.post('/invoke', async (c) => {
  const body = await c.req.json()
  const {
    prompt,
    model,
    add_context_from_internet,
    response_json_schema,
    file_urls,
    use_knowledge_base,
  } = body

  if (!prompt || typeof prompt !== 'string') {
    return c.json({ error: 'prompt é obrigatório' }, 400)
  }

  let enrichedPrompt = prompt

  if (use_knowledge_base && isKnowledgeEnabled()) {
    try {
      const chunks = await searchKnowledge(prompt, 5)
      const context = formatKnowledgeContext(chunks)
      if (context) {
        enrichedPrompt = `${context}\n\n---\n\n${prompt}`
      }
    } catch (err) {
      console.error('[ai] Falha ao buscar base de conhecimento:', err)
    }
  }

  const result = await invokeGemini({
    prompt: enrichedPrompt,
    model,
    add_context_from_internet,
    response_json_schema,
    file_urls,
  })

  return c.json(result)
})
