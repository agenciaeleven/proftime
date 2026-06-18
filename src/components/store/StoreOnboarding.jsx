const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Upload, Check, ChevronRight, ChevronLeft, Sparkles, Loader2, Store, Palette, Tag } from "lucide-react";

import { toast } from "sonner";

const { StoreProfile } = db.entities;

const CATEGORIES = ["Educação", "Idiomas", "Concursos", "Matemática", "Ciências", "Humanas", "Tecnologia", "Negócios", "Saúde", "Arte"];
const THEMES = [
  { key: "dark",       label: "Escuro",      desc: "Elegante e moderno",    bg: "#0f172a", accent: "#3b82f6" },
  { key: "light",      label: "Claro",       desc: "Limpo e profissional",  bg: "#f8fafc", accent: "#6366f1" },
  { key: "minimal",    label: "Minimalista", desc: "Simples e direto",      bg: "#fafafa", accent: "#18181b" },
  { key: "modern",     label: "Moderno",     desc: "Vibrante e chamativo",  bg: "#0a0a0a", accent: "#f59e0b" },
];
const COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#ec4899","#06b6d4","#f97316"];
const STEPS = ["Bem-vindo","Nome","Identidade","Aparência","Finalizar"];

export default function StoreOnboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [form, setForm] = useState({
    display_name: "",
    store_name: "",
    bio: "",
    category: "",
    photo_url: "",
    banner_url: "",
    theme: "dark",
    theme_color: "#3b82f6",
    slug: "",
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleUpload = async (key, file) => {
    if (!file) return;
    setUploading(u => ({ ...u, [key]: true }));
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    set(key, file_url);
    setUploading(u => ({ ...u, [key]: false }));
  };

  const canNext = () => {
    if (step === 1) return form.store_name.trim().length > 0 && form.display_name.trim().length > 0;
    if (step === 2) return true;
    if (step === 3) return true;
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    const slug = form.store_name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const profile = await StoreProfile.create({ ...form, slug });
    toast.success("Sua loja foi criada! 🎉");
    onComplete(profile);
  };

  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-full flex items-center justify-center p-4" style={{ background: "#080f1a" }}>
      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: "#3b82f6" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-8" style={{ background: "#8b5cf6" }} />
      </div>

      <div className="relative w-full max-w-xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? "bg-blue-500 text-white" : i === step ? "bg-blue-500 text-white ring-4 ring-blue-500/30" : "bg-white/10 text-slate-500"
                }`}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="h-px w-8 sm:w-16 rounded-full transition-all" style={{ background: i < step ? "#3b82f6" : "#ffffff15" }} />
                )}
              </div>
            ))}
          </div>
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#3b82f6,#8b5cf6)" }}
              animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0 — Welcome */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl border border-white/[0.08] p-8 text-center" style={{ background: "#0f172a" }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", boxShadow: "0 0 40px #3b82f630" }}>
                <ShoppingBag className="w-10 h-10 text-white" />
              </div>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-4">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-300 font-medium">Proftime Creator</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Crie sua loja em minutos</h1>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                Publique seus produtos, alcance seus alunos e comece a faturar com seu conhecimento hoje mesmo.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { emoji: "🚀", text: "Rápido de criar" },
                  { emoji: "💰", text: "Venda direto" },
                  { emoji: "📱", text: "Mobile-first" },
                ].map(f => (
                  <div key={f.text} className="rounded-xl p-3 border border-white/[0.06]" style={{ background: "#0a1628" }}>
                    <p className="text-xl mb-1">{f.emoji}</p>
                    <p className="text-xs text-slate-400 font-medium">{f.text}</p>
                  </div>
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setStep(1)}
                className="w-full h-12 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", boxShadow: "0 0 24px #3b82f640" }}>
                Começar agora <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 1 — Nome */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl border border-white/[0.08] p-8" style={{ background: "#0f172a" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/20">
                  <Store className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Identidade da loja</h2>
                  <p className="text-xs text-slate-500">Como você quer se apresentar?</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Nome da loja *</label>
                  <input value={form.store_name} onChange={e => set("store_name", e.target.value)}
                    placeholder="Ex: Prof. Ana - Matemática ENEM"
                    className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Seu nome ou marca *</label>
                  <input value={form.display_name} onChange={e => set("display_name", e.target.value)}
                    placeholder="Ex: Ana Silva"
                    className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Descrição da loja</label>
                  <textarea rows={3} value={form.bio} onChange={e => set("bio", e.target.value)}
                    placeholder="Apresente-se: o que você ensina, para quem, e qual a transformação que oferece..."
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Categoria principal</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <button key={c} onClick={() => set("category", c)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                        style={form.category === c ? { background: "#3b82f620", borderColor: "#3b82f660", color: "#60a5fa" } : { background: "transparent", borderColor: "#ffffff0d", color: "#64748b" }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2 — Identidade Visual */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl border border-white/[0.08] p-8" style={{ background: "#0f172a" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center border border-violet-500/20">
                  <Upload className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Imagens da loja</h2>
                  <p className="text-xs text-slate-500">Dê personalidade à sua loja</p>
                </div>
              </div>
              <div className="space-y-5">
                {/* Photo */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Foto de perfil</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                      {form.photo_url ? <img src={form.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">👤</span>}
                    </div>
                    <label className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-violet-500/40 cursor-pointer transition-all">
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleUpload("photo_url", e.target.files[0])} />
                      {uploading.photo_url ? <Loader2 className="w-4 h-4 text-violet-400 animate-spin" /> : <Upload className="w-4 h-4 text-slate-600" />}
                      <span className="text-xs text-slate-400">{form.photo_url ? "Trocar foto" : "Enviar foto"}</span>
                    </label>
                  </div>
                </div>
                {/* Banner */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Banner da loja</label>
                  <label className="block cursor-pointer">
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleUpload("banner_url", e.target.files[0])} />
                    {form.banner_url ? (
                      <div className="h-24 rounded-xl overflow-hidden border border-white/10 relative group">
                        <img src={form.banner_url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <span className="text-white text-xs font-medium">Trocar banner</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-violet-500/40 flex flex-col items-center justify-center gap-2 transition-all">
                        {uploading.banner_url ? <Loader2 className="w-5 h-5 text-violet-400 animate-spin" /> : <Upload className="w-5 h-5 text-slate-600" />}
                        <span className="text-xs text-slate-500">Enviar banner (recomendado: 1200×400)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Tema */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl border border-white/[0.08] p-8" style={{ background: "#0f172a" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center border border-amber-500/20">
                  <Palette className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Estilo visual</h2>
                  <p className="text-xs text-slate-500">Escolha a aparência da sua loja</p>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Tema</label>
                  <div className="grid grid-cols-2 gap-3">
                    {THEMES.map(t => (
                      <button key={t.key} onClick={() => set("theme", t.key)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${form.theme === t.key ? "border-blue-500/60" : "border-white/[0.06] hover:border-white/20"}`}>
                        <div className="h-8 rounded-lg mb-2" style={{ background: t.bg, border: `2px solid ${t.accent}40` }}>
                          <div className="h-2 w-12 rounded mt-1 ml-1.5" style={{ background: t.accent + "80" }} />
                        </div>
                        <p className="text-xs font-semibold text-white">{t.label}</p>
                        <p className="text-[10px] text-slate-500">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Cor principal</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => set("theme_color", c)}
                        className="w-8 h-8 rounded-full transition-all"
                        style={{ background: c, outline: form.theme_color === c ? "3px solid white" : "none", outlineOffset: "2px" }} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4 — Finish */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl border border-white/[0.08] p-8 text-center" style={{ background: "#0f172a" }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 0 40px #10b98130" }}>
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Tudo pronto!</h2>
              <p className="text-slate-400 text-sm mb-6">Sua loja está configurada. Agora vamos criá-la.</p>

              {/* Summary */}
              <div className="rounded-2xl border border-white/[0.06] p-4 text-left space-y-2 mb-6" style={{ background: "#0a1628" }}>
                {[
                  { label: "Loja", value: form.store_name },
                  { label: "Professor", value: form.display_name },
                  { label: "Categoria", value: form.category || "Não definida" },
                  { label: "Tema", value: THEMES.find(t => t.key === form.theme)?.label || "Escuro" },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{row.label}</span>
                    <span className="text-xs font-semibold text-white">{row.value}</span>
                  </div>
                ))}
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleFinish} disabled={saving}
                className="w-full h-12 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 0 24px #10b98130" }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {saving ? "Criando sua loja..." : "Criar minha loja agora!"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav Buttons */}
        {step > 0 && step < 4 && (
          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-400 border border-white/[0.07] hover:bg-white/[0.05] transition-all">
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={() => canNext() && setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex-1 h-10 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
              Continuar <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}