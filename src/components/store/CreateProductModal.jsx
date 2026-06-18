const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, BookOpen, Users, Zap, Brain, Target, FileText, CheckCircle } from "lucide-react";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

const { InfoProduct } = db.entities;

const PRODUCT_TYPES = [
  { value: "aula_avulsa", label: "Aula Avulsa", desc: "Uma aula específica sobre um tema", icon: BookOpen, color: "#38bdf8" },
  { value: "curso", label: "Curso Completo", desc: "Conteúdo estruturado em módulos", icon: Brain, color: "#818cf8" },
  { value: "comunidade", label: "Comunidade", desc: "Grupo com acesso recorrente", icon: Users, color: "#a78bfa" },
  { value: "mentoria", label: "Mentoria", desc: "Acompanhamento individualizado", icon: Target, color: "#34d399" },
  { value: "programa", label: "Programa", desc: "Trilha completa com acompanhamento", icon: Zap, color: "#fb923c" },
  { value: "desafio", label: "Desafio / Rotina", desc: "Sequência de dias com tarefas", icon: CheckCircle, color: "#f472b6" },
  { value: "material", label: "Material Digital", desc: "PDFs, planilhas, exercícios", icon: FileText, color: "#94a3b8" },
];

const STEPS = ["Tipo", "Informações", "Preço", "Publicar"];

const defaultForm = {
  name: "", type: "", description: "", what_student_receives: "",
  price: "", billing: "unico", status: "ativo",
};

export default function CreateProductModal({ open, onClose, onCreated }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const reset = () => { setStep(0); setForm(defaultForm); };
  const handleClose = () => { reset(); onClose(); };

  const canNext = () => {
    if (step === 0) return !!form.type;
    if (step === 1) return !!form.name.trim() && !!form.description.trim();
    if (step === 2) return !!form.price && !isNaN(Number(form.price)) && Number(form.price) > 0;
    return true;
  };

  const handleCreate = async () => {
    setSaving(true);
    const created = await InfoProduct.create({
      ...form,
      price: Number(form.price),
      students_count: 0,
      sales_count: 0,
      total_revenue: 0,
    });
    setSaving(false);
    reset();
    toast.success("Produto criado com sucesso! 🎉");
    onCreated(created);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] shadow-2xl z-10 overflow-hidden"
        style={{ background: "#0d1728" }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Criar novo produto</h2>
            <button onClick={handleClose} className="p-1.5 rounded-xl hover:bg-white/10 text-slate-500 hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  i < step ? "bg-blue-500 text-white" : i === step ? "bg-blue-500/20 text-blue-400 border border-blue-500/40" : "bg-white/[0.05] text-slate-600")}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={cn("text-xs", i === step ? "text-white font-medium" : "text-slate-600")}>{s}</span>
                {i < STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-700 mx-0.5" />}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 min-h-64">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>

              {/* Step 0: Type */}
              {step === 0 && (
                <div>
                  <p className="text-sm text-slate-400 mb-4">Que tipo de produto você vai criar?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PRODUCT_TYPES.map(t => {
                      const Icon = t.icon;
                      const selected = form.type === t.value;
                      return (
                        <button key={t.value} onClick={() => setForm(f => ({ ...f, type: t.value }))}
                          className={cn("flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all",
                            selected ? "border-blue-500/40 bg-blue-500/10" : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]")}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: `${t.color}20`, border: `1px solid ${t.color}40` }}>
                            <Icon className="w-4 h-4" style={{ color: t.color }} />
                          </div>
                          <div>
                            <p className={cn("text-sm font-semibold", selected ? "text-white" : "text-slate-300")}>{t.label}</p>
                            <p className="text-xs text-slate-600 leading-tight mt-0.5">{t.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 1: Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Nome do produto *</label>
                    <input
                      autoFocus
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Ex: Curso de Matemática do Zero"
                      className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Descrição *</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Conte para o aluno sobre o que é este produto..."
                      rows={3}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">O que o aluno vai receber?</label>
                    <textarea
                      value={form.what_student_receives}
                      onChange={e => setForm(f => ({ ...f, what_student_receives: e.target.value }))}
                      placeholder="Ex: 20 aulas em vídeo, materiais em PDF, exercícios..."
                      rows={2}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Price */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Preço (R$) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                      <input
                        autoFocus
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="0,00"
                        className="w-full h-14 bg-white/[0.04] border border-white/[0.08] rounded-xl pl-12 pr-4 text-2xl font-bold text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Forma de cobrança</label>
                    <div className="flex gap-3">
                      {[{ value: "unico", label: "Pagamento único" }, { value: "mensal", label: "Assinatura mensal" }].map(b => (
                        <button key={b.value} onClick={() => setForm(f => ({ ...f, billing: b.value }))}
                          className={cn("flex-1 py-3 rounded-xl text-sm font-medium border transition-all",
                            form.billing === b.value ? "bg-blue-500/15 border-blue-500/40 text-white" : "border-white/[0.07] text-slate-500 hover:border-white/[0.14] hover:text-slate-300")}>
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Publish */}
              {step === 3 && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #3b82f620, #8b5cf620)", border: "1px solid #3b82f640" }}>
                    <CheckCircle className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Tudo pronto!</h3>
                  <p className="text-slate-400 text-sm mb-6">Revise e publique seu produto:</p>
                  <div className="rounded-xl border border-white/[0.06] p-4 text-left space-y-2 mb-2" style={{ background: "#080f1a" }}>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Produto</span>
                      <span className="text-white font-medium">{form.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Tipo</span>
                      <span className="text-white">{PRODUCT_TYPES.find(t => t.value === form.type)?.label}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Preço</span>
                      <span className="text-emerald-400 font-bold">R$ {Number(form.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}{form.billing === "mensal" ? "/mês" : ""}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-slate-400 border border-white/[0.07] hover:bg-white/[0.05] transition-all">
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              disabled={!canNext()}
              onClick={() => setStep(s => s + 1)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled={saving}
              onClick={handleCreate}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60 transition-all"
              style={{ background: "linear-gradient(135deg, #059669, #10b981)", boxShadow: "0 0 24px #10b98130" }}>
              {saving ? "Criando..." : "🚀 Publicar Produto"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}