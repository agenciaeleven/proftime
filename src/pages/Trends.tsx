import { db } from '@/api/client'
import { asObject } from '@/lib/ai'
import type { TrendItem } from '@/types'

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, TrendingUp, RefreshCw, Sparkles, Zap, Globe, Music, BookOpen, Hash, Loader2 } from "lucide-react";

const CATEGORIES = [
  { key: "all", label: "Tudo" },
  { key: "viral", label: "Viral" },
  { key: "educacao", label: "Educação" },
  { key: "tech", label: "Tecnologia" },
  { key: "cultura", label: "Cultura" },
];

const CATEGORY_ICONS = { viral: Flame, educacao: BookOpen, tech: Zap, cultura: Music, meme: Hash };
const ACCENT_COLORS = ["#3b82f6","#a78bfa","#34d399","#fb923c","#06b6d4","#f472b6","#facc15","#f87171"];

export default function Trends() {
  const [trends, setTrends] = useState<TrendItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => { fetchTrends(); }, []);

  const fetchTrends = async () => {
    setLoading(true);
    const today = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
    const result = asObject<{ trends?: TrendItem[] }>(await db.integrations.Core.InvokeLLM({
      prompt: `Hoje é ${today}. Você é um especialista em tendências para professores brasileiros.
Retorne as 10 principais tendências atuais que um professor brasileiro deveria conhecer para se conectar com seus alunos.
Inclua: assuntos virais, memes em alta, termos da geração Z, tendências tecnológicas e culturais, músicas/artistas populares, debates atuais.
Para cada tendência, forneça: título chamativo, categoria (viral/educacao/tech/cultura/meme), descrição curta e uma dica de como usar em sala de aula.
Seja atual, relevante e autêntico - como se fosse um professor jovem e antenado falando com colegas.`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          trends: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                category: { type: "string" },
                description: { type: "string" },
                tip: { type: "string" },
                heat: { type: "number" }
              }
            }
          }
        }
      }
    }))
    setTrends(result.trends || [])
    setLastUpdated(new Date());
    setLoading(false);
  };

  const filtered = activeCategory === "all" ? trends : trends.filter(t => t.category === activeCategory);

  return (
    <div className="min-h-full" style={{ background: "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)" }}>
      <div className="px-6 lg:px-10 py-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-4" style={{ background: "#FFF3E8", border: "1px solid rgba(249,115,22,0.2)" }}>
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs text-orange-600 font-medium">Tendências em Tempo Real</span>
              </div>
              <h1 className="text-3xl font-bold text-[#1F1F1F] tracking-tight">O que está em alta</h1>
              <p className="text-[#6E6E73] text-sm mt-1.5">
                Fique por dentro do que seus alunos estão falando.
                {lastUpdated && <span className="ml-2 text-[#A0A0A6]">Atualizado às {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>}
              </p>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={fetchTrends} disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-all disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
            </motion.button>
          </div>
        </motion.div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setActiveCategory(c.key)}
              className={cn_local(`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border`,
                activeCategory === c.key
                  ? "bg-orange-100 border-orange-200 text-orange-600"
                  : "bg-white border-[#DDD9D3] text-[#6E6E73] hover:bg-[#F1F1EF]"
              )}>
              {c.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center py-24">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}>
                  <Globe className="w-7 h-7 text-white animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-orange-400/20 animate-ping" />
              </div>
              <p className="text-[#1F1F1F] font-semibold mt-6">Buscando tendências atuais...</p>
              <p className="text-sm text-[#A0A0A6] mt-1">Conectando com a internet</p>
              <div className="flex gap-1.5 mt-4">
                {[0,1,2].map(i => <motion.div key={i} className="w-2 h-2 rounded-full bg-orange-400" animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25 }} />)}
              </div>
            </motion.div>
          ) : (
            <motion.div key="trends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {filtered.map((trend, i) => {
                const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
                const Icon = CATEGORY_ICONS[trend.category] || TrendingUp;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -2, boxShadow: `0 12px 32px ${accent}14` }}
                    className="group rounded-2xl border border-[#DDD9D3] overflow-hidden cursor-pointer transition-all bg-white shadow-sm"
                    >
                    <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${accent}12`, border: `1px solid ${accent}20` }}>
                              <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>{trend.category}</span>
                            {trend.heat >= 8 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium flex items-center gap-1 border border-red-100">
                                <Flame className="w-2.5 h-2.5" /> Viral
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-[#1F1F1F] mb-1.5">{trend.title}</h3>
                          <p className="text-sm text-[#6E6E73] leading-relaxed">{trend.description}</p>
                          {trend.tip && (
                            <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-[#6E6E73] leading-relaxed"><span className="text-amber-600 font-medium">Dica: </span>{trend.tip}</p>
                            </div>
                          )}
                        </div>
                        {trend.heat && (
                          <div className="shrink-0 flex flex-col items-center">
                            <div className="text-lg font-bold" style={{ color: accent }}>{trend.heat}</div>
                            <div className="text-xs text-[#A0A0A6]">/ 10</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-10 text-[#A0A0A6] text-sm">Nenhuma tendência nessa categoria.</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function cn_local(...args) {
  return args.filter(Boolean).join(" ");
}