import { db } from '@/api/client'
import { asText } from '@/lib/ai'

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Copy, Save, Edit3, Presentation, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const SUBJECTS = ["Matemática","Português","Ciências","História","Geografia","Física","Química","Biologia","Inglês","Ed. Física","Artes","Filosofia","Sociologia","Direito","Administração","Contabilidade","Economia","Engenharia","Medicina","Pedagogia","Nutrição","Psicologia","Enfermagem","Arquitetura","Tecnologia da Informação"];
const GRADES = ["6º Ano","7º Ano","8º Ano","9º Ano","1º EM","2º EM","3º EM","Graduação","Pós-Graduação","EAD","Curso Livre","Cursinho/ENEM"];
const STYLES = ["Expositiva","Dialogada","Prática","Sala Invertida","Gamificada","Híbrida","Projeto"];

export default function LessonCreator() {
  const [step, setStep] = useState("inputs");
  const [formData, setFormData] = useState({ subject: "", topic: "", grade: "", duration: "", objective: "", style: "" });
  const [rawText, setRawText] = useState("");

  const handleGenerate = async () => {
    if (!formData.subject || !formData.topic) { toast.error("Preencha disciplina e tema."); return; }
    setStep("loading");
    const response = await db.integrations.Core.InvokeLLM({
      prompt: `Crie um plano de aula completo e bem estruturado para:
- Disciplina: ${formData.subject}
- Nível/Turma: ${formData.grade || "não informado"}
- Tema: "${formData.topic}"
- Duração: ${formData.duration || "50 minutos"}
- Metodologia: ${formData.style || "expositiva"}
- Objetivo: ${formData.objective || "não informado"}

Estruture assim:
1. INTRODUÇÃO (com tempo estimado)
2. DESENVOLVIMENTO (com atividades detalhadas)
3. ATIVIDADE PRÁTICA
4. CONCLUSÃO / AVALIAÇÃO
5. RECURSOS NECESSÁRIOS

Seja prático e objetivo. Inclua dicas reais para o professor.`,
      model: "gemini_3_flash"
    });
    setRawText(asText(response))
    setStep("result");
  };

  const handleCopy = () => { navigator.clipboard.writeText(rawText); toast.success("Copiado!"); };

  return (
    <div className="min-h-full" style={{ background: "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)" }}>
      <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-4" style={{ background: "#F1F5FF", border: "1px solid rgba(77,124,254,0.2)" }}>
            <BookOpen className="w-3.5 h-3.5 text-[#4D7CFE]" />
            <span className="text-xs text-[#4D7CFE] font-medium">Plano de Aula com IA</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1F1F1F] tracking-tight">Criador de Plano de Aula</h1>
          <p className="text-[#6E6E73] text-sm mt-1.5">Descreva sua aula e a IA estrutura tudo. Depois, gere os slides automaticamente.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "inputs" && (
            <motion.div key="inputs" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div className="rounded-3xl p-6 space-y-5" style={{ background: "#FFFFFF", border: "1px solid #DDD9D3", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Disciplina", key: "subject", options: SUBJECTS },
                    { label: "Série / Nível", key: "grade", options: GRADES },
                  ].map(f => (
                    <div key={f.key} className="space-y-2">
                      <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider">{f.label}</label>
                      <Select onValueChange={v => setFormData({ ...formData, [f.key]: v })}>
                        <SelectTrigger className="bg-[#FAFAF8] border-[#DDD9D3] rounded-xl text-[#1F1F1F]">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#DDD9D3] max-h-60">
                          {f.options.map(s => <SelectItem key={s} value={s} className="text-[#1F1F1F]">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider">Tema da Aula</label>
                  <Input className="bg-[#FAFAF8] border-[#DDD9D3] rounded-xl text-[#1F1F1F] placeholder:text-[#A0A0A6]"
                    placeholder="Ex: Equações do 2º Grau, Direitos Fundamentais..."
                    value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider">Duração</label>
                    <Input className="bg-[#FAFAF8] border-[#DDD9D3] rounded-xl text-[#1F1F1F] placeholder:text-[#A0A0A6]"
                      placeholder="Ex: 50 minutos" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider">Metodologia</label>
                    <Select onValueChange={v => setFormData({ ...formData, style: v })}>
                      <SelectTrigger className="bg-[#FAFAF8] border-[#DDD9D3] rounded-xl text-[#1F1F1F]"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent className="bg-white border-[#DDD9D3]">
                        {STYLES.map(s => <SelectItem key={s} value={s} className="text-[#1F1F1F]">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider">Objetivo da Aula</label>
                  <Textarea className="bg-[#FAFAF8] border-[#DDD9D3] rounded-xl text-[#1F1F1F] placeholder:text-[#A0A0A6] resize-none"
                    placeholder="Descreva o que o aluno deve aprender ao final da aula..."
                    value={formData.objective} onChange={e => setFormData({ ...formData, objective: e.target.value })} rows={3} />
                </div>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleGenerate}
                  className="w-full h-12 rounded-2xl text-white font-semibold flex items-center justify-center gap-2"
                  style={{ background: "#4D7CFE" }}>
                  <Sparkles className="w-4 h-4" /> Gerar Plano com IA
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-32">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)", boxShadow: "0 0 40px #3b82f640" }}>
                  <Sparkles className="w-9 h-9 text-white animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-blue-500/20 animate-ping" />
              </div>
              <p className="text-lg font-semibold text-white mt-8">Gerando seu plano...</p>
              <p className="text-sm text-slate-500 mt-1">A IA está estruturando sua aula</p>
              <div className="flex gap-1.5 mt-5">
                {[0,1,2].map(i => <motion.div key={i} className="w-2 h-2 rounded-full bg-blue-500" animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25 }} />)}
              </div>
            </motion.div>
          )}

          {step === "result" && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="rounded-3xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #DDD9D3", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div className="px-5 py-4 border-b border-[#E8E6E1] flex items-center justify-between">
                  <h3 className="font-semibold text-[#1F1F1F] text-sm">Plano de Aula — {formData.subject} · {formData.topic}</h3>
                  <button onClick={handleCopy} className="text-xs text-[#6E6E73] hover:text-[#1F1F1F] flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#F1F1EF] transition-all">
                    <Copy className="w-3 h-3" /> Copiar
                  </button>
                </div>
                <div className="p-5">
                  <pre className="text-sm text-[#1F1F1F] leading-relaxed whitespace-pre-wrap font-sans">{rawText}</pre>
                </div>
              </div>

              <div className="rounded-3xl p-4" style={{ background: "#F3F0FF", border: "1px solid rgba(167,139,250,0.25)" }}>
                <p className="text-xs text-[#6B5BD2] font-medium mb-3 flex items-center gap-1.5">
                  <Presentation className="w-3.5 h-3.5" /> Próximo passo: Gerar Slides
                </p>
                <a href={`https://gamma.app/create?prompt=${encodeURIComponent("Crie uma apresentação de slides para a seguinte aula:\n" + rawText.slice(0, 800))}`}
                  target="_blank" rel="noopener noreferrer">
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                    className="w-full h-11 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                    style={{ background: "#6B5BD2" }}>
                    <Presentation className="w-4 h-4" /> Gerar Slides
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </motion.button>
                </a>
                <p className="text-xs text-[#A0A0A6] mt-2 text-center">O conteúdo do plano será enviado automaticamente para gerar os slides.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => toast.success("Plano salvo!")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[#6E6E73] text-sm font-medium border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF] transition-all">
                  <Save className="w-4 h-4" /> Salvar
                </button>
                <button onClick={() => setStep("inputs")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[#6E6E73] text-sm font-medium border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF] transition-all">
                  <Edit3 className="w-4 h-4" /> Novo Plano
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}