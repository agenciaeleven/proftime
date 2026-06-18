import { useState } from "react";
import { motion } from "framer-motion";
import { Presentation, Download, Edit3, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockSlides } from "../lib/mockData";
import { toast } from "sonner";

export default function Slides() {
  const [active, setActive] = useState(0);
  const slide = mockSlides[active];

  return (
    <div className="min-h-full" style={{ background: "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)" }}>
      <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-4" style={{ background: "#F3F0FF", border: "1px solid rgba(167,139,250,0.25)" }}>
            <Presentation className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-xs text-violet-600 font-medium">Gerador de Slides</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1F1F1F] tracking-tight">Visualizador de Slides</h1>
          <p className="text-[#6E6E73] text-sm mt-1.5">Navegue, edite e exporte sua apresentação.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Thumbnails */}
          <div className="lg:col-span-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto pb-1 lg:pb-0 lg:max-h-[500px]">
            {mockSlides.map((s, i) => (
              <motion.button
                key={s.id}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActive(i)}
                className={cn(
                  "shrink-0 w-36 lg:w-full rounded-xl border p-3.5 text-left transition-all",
                  i === active
                    ? "border-violet-400/50 bg-violet-50"
                    : "border-[#DDD9D3] bg-white hover:border-[#C8C4BE] hover:bg-[#FAFAF8]"
                )}
              >
                <p className="text-[10px] text-[#A0A0A6] mb-1 font-mono">SLIDE {i + 1}</p>
                <p className="text-xs font-medium text-[#1F1F1F] truncate">{s.title}</p>
              </motion.button>
            ))}
          </div>

          {/* Preview */}
          <div className="lg:col-span-3">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="relative rounded-2xl overflow-hidden min-h-[420px] flex flex-col justify-center p-8 lg:p-14"
              style={{
                background: "linear-gradient(135deg, #1a1f3c 0%, #0f172a 40%, #1a0d2e 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 4px 32px rgba(79,70,229,0.15)"
              }}
            >
              {/* Orbs */}
              <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-[0.12]" style={{ background: "#6366f1" }} />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-[0.08]" style={{ background: "#3b82f6" }} />

              <div className="relative z-10">
                <span className="text-xs uppercase tracking-widest text-slate-500 mb-4 block font-mono">{active + 1} / {mockSlides.length}</span>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">{slide.title}</h2>
                <p className="text-base text-slate-300 mb-8">{slide.subtitle}</p>
                <ul className="space-y-3.5">
                  {slide.content.map((item, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#a78bfa" }} />
                      <span className="text-base text-slate-200">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-4 gap-3">
              <button
                disabled={active === 0}
                onClick={() => setActive(p => p - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-[#6E6E73] border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>

              <div className="flex gap-2">
                <button onClick={() => toast.success("PDF gerado!")}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-[#6E6E73] border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF] transition-all">
                  <Download className="w-4 h-4" /> PDF
                </button>
                <button onClick={() => toast("Modo edição ativado")}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 transition-all">
                  <Edit3 className="w-4 h-4" /> Editar
                </button>
              </div>

              <button
                disabled={active === mockSlides.length - 1}
                onClick={() => setActive(p => p + 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-[#6E6E73] border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Próximo <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}