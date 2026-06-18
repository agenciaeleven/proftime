const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sparkles, Copy, Save, Edit3, RotateCcw, CheckSquare, AlignLeft, ToggleLeft, Lightbulb, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const SUBJECTS = ["Matemática","Português","Ciências","História","Geografia","Física","Química","Biologia","Inglês","Artes","Ed. Física","Direito","Administração","Engenharia","Medicina","Pedagogia","Filosofia","Sociologia","Economia","Contabilidade"];
const LEVELS = ["Fácil","Médio","Difícil","Avançado"];
const TYPES = [
  { key: "multipla_escolha", label: "Múltipla Escolha", icon: CheckSquare },
  { key: "dissertativa", label: "Dissertativa", icon: AlignLeft },
  { key: "verdadeiro_falso", label: "Verdadeiro ou Falso", icon: ToggleLeft },
  { key: "pratica", label: "Atividade Prática", icon: Lightbulb },
];

export default function ActivityGenerator() {
  const [form, setForm] = useState({ subject: "", topic: "", level: "Médio", type: "multipla_escolha", quantity: "5" });
  const [step, setStep] = useState("form");
  const [result, setResult] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");

  const handleGenerate = async () => {
    if (!form.subject || !form.topic) { toast.error("Preencha disciplina e tema."); return; }
    setStep("loading");
    const typeLabel = TYPES.find(t => t.key === form.type)?.label;
    const response = await db.integrations.Core.InvokeLLM({
      prompt: `Crie ${form.quantity} questões de ${typeLabel} sobre "${form.topic}" para a disciplina de ${form.subject}, nível ${form.level}.
Para múltipla escolha: inclua enunciado, 4 alternativas (A-D) e gabarito.
Para V/F: inclua afirmação e gabarito.
Para dissertativa: inclua enunciado e critérios de correção.
Para prática: inclua descrição detalhada da atividade.
Formate de forma clara e organizada. Seja didático e objetivo.`,
      model: "gemini_3_flash"
    });
    setResult(response);
    setEditText(response);
    setStep("result");
  };

  const handleSave = () => { toast.success("Atividade salva!"); };
  const handleCopy = () => { navigator.clipboard.writeText(editing ? editText : result); toast.success("Copiado!"); };

  return (
    <div className="min-h-full" style={{ background: "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)" }}>
      <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-4" style={{ background: "#F1F5FF", border: "1px solid rgba(77,124,254,0.2)" }}>
            <Zap className="w-3.5 h-3.5 text-[#4D7CFE]" />
            <span className="text-xs text-[#4D7CFE] font-medium">Gerador de Atividades</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1F1F1F] tracking-tight">Gerador de Atividades</h1>
          <p className="text-[#6E6E73] text-sm mt-1.5">Crie exercícios personalizados com IA em segundos.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-3xl p-6 space-y-5" style={{ background: "#FFFFFF", border: "1px solid #DDD9D3", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Disciplina</label>
                    <Select onValueChange={v => setForm(f => ({ ...f, subject: v }))}>
                      <SelectTrigger className="bg-[#FAFAF8] border-[#DDD9D3] rounded-xl text-[#1F1F1F]"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent className="bg-white border-[#DDD9D3] max-h-60">
                        {SUBJECTS.map(s => <SelectItem key={s} value={s} className="text-[#1F1F1F]">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Nível</label>
                    <Select defaultValue="Médio" onValueChange={v => setForm(f => ({ ...f, level: v }))}>
                      <SelectTrigger className="bg-[#FAFAF8] border-[#DDD9D3] rounded-xl text-[#1F1F1F]"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white border-[#DDD9D3]">
                        {LEVELS.map(l => <SelectItem key={l} value={l} className="text-[#1F1F1F]">{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Tema / Conteúdo</label>
                  <Input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                    placeholder="Ex: Frações, Segunda Guerra Mundial, Fotossíntese..."
                    className="bg-[#FAFAF8] border-[#DDD9D3] rounded-xl text-[#1F1F1F] placeholder:text-[#A0A0A6]" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-2 block">Tipo de Atividade</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TYPES.map(t => (
                      <button key={t.key} onClick={() => setForm(f => ({ ...f, type: t.key }))}
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                          form.type === t.key
                            ? "border-[#4D7CFE]/40 bg-[#F1F5FF] text-[#4D7CFE]"
                            : "border-[#DDD9D3] bg-[#FAFAF8] text-[#6E6E73] hover:bg-[#F1F1EF]"
                        }`}>
                        <t.icon className="w-4 h-4" />{t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Quantidade de Questões</label>
                  <Input type="number" min="1" max="20" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                    className="bg-[#FAFAF8] border-[#DDD9D3] rounded-xl text-[#1F1F1F] max-w-[120px]" />
                </div>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleGenerate}
                  className="w-full h-12 rounded-2xl text-white font-semibold flex items-center justify-center gap-2"
                  style={{ background: "#4D7CFE" }}>
                  <Sparkles className="w-4 h-4" /> Gerar Atividades com IA
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-32">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "#4D7CFE" }}>
                  <Sparkles className="w-9 h-9 text-white animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-blue-400/20 animate-ping" />
              </div>
              <p className="text-lg font-semibold text-[#1F1F1F] mt-8">Criando atividades...</p>
              <p className="text-sm text-[#A0A0A6] mt-1">A IA está elaborando os exercícios</p>
              <div className="flex gap-1.5 mt-5">
                {[0,1,2].map(i => <motion.div key={i} className="w-2 h-2 rounded-full bg-[#4D7CFE]" animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25 }} />)}
              </div>
            </motion.div>
          )}

          {step === "result" && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="rounded-3xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #DDD9D3", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div className="px-5 py-4 border-b border-[#E8E6E1] flex items-center justify-between">
                  <h3 className="font-semibold text-[#1F1F1F] text-sm">Atividades Geradas</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditing(e => !e)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${editing ? "bg-[#F1F5FF] text-[#4D7CFE]" : "text-[#6E6E73] hover:bg-[#F1F1EF]"}`}>
                      <Edit3 className="w-3 h-3" />{editing ? "Visualizar" : "Editar"}
                    </button>
                    <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#6E6E73] hover:bg-[#F1F1EF] transition-all">
                      <Copy className="w-3 h-3" /> Copiar
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  {editing ? (
                    <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={20}
                      className="w-full bg-transparent text-sm text-[#1F1F1F] leading-relaxed focus:outline-none resize-none" />
                  ) : (
                    <pre className="text-sm text-[#1F1F1F] leading-relaxed whitespace-pre-wrap font-sans">{result}</pre>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-sm font-medium"
                  style={{ background: "#4D7CFE" }}>
                  <Save className="w-4 h-4" /> Salvar Atividade
                </motion.button>
                <button onClick={() => { setStep("form"); setResult(null); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[#6E6E73] text-sm font-medium border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF] transition-all">
                  <RotateCcw className="w-4 h-4" /> Gerar Novamente
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}