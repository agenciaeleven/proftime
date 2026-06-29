import { db } from '@/api/client'
import { asText } from '@/lib/ai'
import type { ChatMessage } from '@/types'
import KnowledgeBasePanel from '@/components/KnowledgeBasePanel'

import { useState, useRef, useEffect } from 'react'
import { motion } from "framer-motion";
import { Bot, Send, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const SYSTEM_PROMPT = `Você é a ProfIA, assistente pedagógica para professores brasileiros. Seu estilo é:
- Respostas curtas e diretas (máximo 3-4 parágrafos)
- Linguagem natural, como um colega professor experiente
- Use tópicos e listas quando ajudar
- Evite textos longos e repetitivos
- Seja prático, dê exemplos reais
- Responda sempre em português
Se a pergunta for simples, responda em 1-2 parágrafos. Priorize clareza e aplicabilidade.`;

const SUGGESTIONS = ["Como gamificar uma aula?", "Dinâmica para revisão de conteúdo", "Como lidar com alunos dispersos?", "Metodologia de sala invertida"];

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Olá! Sou sua assistente pedagógica com IA. Posso ajudar com planejamento, metodologias, dinâmicas e muito mais. Por onde começamos? 😊' },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isTyping])

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    setIsTyping(true);
    const history = messages.map(m => `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.content}`).join("\n");
    const response = await db.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}\n\nHistórico:\n${history}\n\nUsuário: ${msg}\n\nAssistente:`,
      model: 'gemini_3_flash',
      use_knowledge_base: true,
    })
    setMessages((prev) => [...prev, { role: 'assistant', content: asText(response) }])
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)" }}>
      {/* Header */}
      <div className="px-6 lg:px-10 py-4 border-b border-[#DDD9D3] shrink-0 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#F1F5FF", border: "1px solid rgba(77,124,254,0.2)" }}>
            <Bot className="w-5 h-5 text-[#4D7CFE]" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#1F1F1F]">IA Assistente Pedagógica</h1>
            <p className="text-xs text-[#A0A0A6]">Especialista em educação brasileira</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-[#A0A0A6]">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 lg:px-10 py-6">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6">
          <div className="lg:w-72 shrink-0 order-2 lg:order-1">
            <KnowledgeBasePanel />
          </div>
          <div className="flex-1 space-y-4 order-1 lg:order-2 min-w-0">
          {messages.length === 1 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-2 mb-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => handleSend(s)}
                  className="p-3 rounded-xl text-left text-xs text-[#6E6E73] border border-[#DDD9D3] bg-white hover:border-[#4D7CFE]/40 hover:bg-[#F1F5FF] hover:text-[#4D7CFE] transition-all flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#A0A0A6] shrink-0" />{s}
                </button>
              ))}
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "#4D7CFE" }}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={cn("max-w-[80%] rounded-2xl px-4 py-3",
                msg.role === "user" ? "text-white" : "border border-[#DDD9D3] bg-white shadow-sm"
              )}
              style={msg.role === "user" ? { background: "#4D7CFE" } : {}}>
                <p className={cn("text-sm leading-relaxed", msg.role === "user" ? "text-white" : "text-[#1F1F1F]")}>{msg.content}</p>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#4D7CFE" }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="rounded-2xl px-4 py-4 border border-[#DDD9D3] bg-white shadow-sm">
                <div className="flex gap-1.5">
                  {[0,1,2].map(i => (
                    <motion.div key={i} className="w-2 h-2 rounded-full bg-[#DDD9D3]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
        </div>
      </div>

      {/* Input */}
      <div className="px-6 lg:px-10 py-4 border-t border-[#DDD9D3] shrink-0 bg-white/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Pergunte algo sobre pedagogia, metodologias, dinâmicas..."
            className="flex-1 h-11 rounded-xl px-4 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20 border border-[#DDD9D3] bg-white"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="h-11 w-11 rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
            style={{ background: "#4D7CFE" }}
          >
            <Send className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}