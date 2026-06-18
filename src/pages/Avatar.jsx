import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Sparkles, Check, Mic, Video, Play } from "lucide-react";

export default function Avatar() {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setGenerated(true); }, 3000);
  };

  return (
    <div className="min-h-full" style={{ background: "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)" }}>
      <div className="px-6 lg:px-10 py-8 max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-4" style={{ background: "#FFF0F6", border: "1px solid rgba(236,72,153,0.2)" }}>
            <User className="w-3.5 h-3.5 text-pink-500" />
            <span className="text-xs text-pink-600 font-medium">Professor Virtual</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1F1F1F] tracking-tight">Avatar IA</h1>
          <p className="text-[#6E6E73] text-sm mt-1.5">Crie um avatar inteligente que apresenta suas aulas.</p>
        </motion.div>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-[#DDD9D3] overflow-hidden mb-6 bg-white shadow-sm"
          style={{  }}
        >
          {/* Orbs */}
          <div className="absolute w-72 h-72 rounded-full blur-3xl opacity-[0.06]" style={{ background: "#8b5cf6", top: "-4rem", right: "10%" }} />
          <div className="absolute w-48 h-48 rounded-full blur-3xl opacity-[0.05]" style={{ background: "#3b82f6", bottom: "-2rem", left: "10%" }} />

          <div className="relative p-8 lg:p-14 flex flex-col items-center text-center">
            {/* Avatar animation */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative mb-8 z-10"
            >
              <div className="w-28 h-28 lg:w-36 lg:h-36 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", boxShadow: "0 0 60px #4f46e540" }}>
                <User className="w-14 h-14 text-white/80" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full flex items-center justify-center shadow-lg border-2"
                style={{ background: "linear-gradient(135deg, #059669, #10b981)", borderColor: "#080f1a" }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <motion.div className="absolute inset-0 rounded-full border border-blue-500/20" animate={{ scale: [1,1.4,1], opacity: [0.6,0,0.6] }} transition={{ duration: 2.5, repeat: Infinity }} />
              <motion.div className="absolute inset-0 rounded-full border border-violet-500/15" animate={{ scale: [1,1.65,1], opacity: [0.4,0,0.4] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />
            </motion.div>

            <h2 className="text-2xl lg:text-3xl font-bold text-[#1F1F1F] mb-3 tracking-tight">
              Seu avatar pode dar aula por você
            </h2>
            <p className="text-[#6E6E73] text-sm max-w-md leading-relaxed">
              Crie um avatar com inteligência artificial que apresenta suas aulas com voz e movimentos naturais.
            </p>

            <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-sm">
              {[
                { icon: Mic, label: "Voz Natural", color: "#3b82f6" },
                { icon: Video, label: "Vídeo HD", color: "#a78bfa" },
                { icon: Play, label: "Ao Vivo", color: "#34d399" },
              ].map(f => (
                <div key={f.label} className="rounded-xl p-3 border border-[#DDD9D3] bg-[#FAFAF8]">
                  <f.icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: f.color }} />
                  <p className="text-xs text-[#6E6E73] font-medium">{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <AnimatePresence mode="wait">
          {!generated && !loading && (
            <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleGenerate}
                className="w-full h-12 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", boxShadow: "0 0 30px #4f46e530" }}>
                <Sparkles className="w-5 h-5" /> Gerar aula com avatar
              </motion.button>
            </motion.div>
          )}
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-10">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", boxShadow: "0 0 30px #4f46e530" }}>
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-violet-500/20 animate-ping" />
              </div>
              <p className="text-white font-semibold mt-5">Gerando seu avatar...</p>
              <p className="text-sm text-slate-500 mt-1">Isso pode levar alguns instantes</p>
            </motion.div>
          )}
          {generated && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-emerald-200 p-8 text-center bg-white shadow-sm">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
                <Check className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1F1F1F]">Aula gerada com sucesso! 🎉</h3>
              <p className="text-sm text-[#6E6E73] mt-2">Seu avatar está pronto para apresentar.</p>
              <button onClick={() => setGenerated(false)}
                className="mt-5 px-5 py-2.5 rounded-xl text-sm text-[#6E6E73] border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF] transition-all">
                Gerar nova aula
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}