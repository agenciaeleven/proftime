// @ts-nocheck
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import {
  BookOpen, FileCheck, Bot, ArrowUpRight, ArrowRight,
  Zap, CheckCircle2, Clock, ChevronRight, Flame,
  Users, Star, TrendingUp, Calendar, BarChart2
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────
const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const chartData = WEEK_DAYS.map((day) => ({ day, aulas: 0, provas: 0 }));

const recentActivity = [];
const agenda = [];
const goals = [
  { label: "Aulas planejadas", done: 0, total: 0, color: "#3b82f6", bg: "from-blue-500/20 to-blue-500/5" },
  { label: "Provas corrigidas", done: 0, total: 0, color: "#a78bfa", bg: "from-violet-500/20 to-violet-500/5" },
  { label: "Slides gerados", done: 0, total: 0, color: "#34d399", bg: "from-emerald-500/20 to-emerald-500/5" },
];

const miniCalDots = [];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#DDD9D3] rounded-xl px-4 py-3 text-xs shadow-lg">
      <p className="text-[#A0A0A6] mb-1.5 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name === "aulas" ? "Aulas" : "Questões"}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, change, accent, wide, chart }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: `0 20px 40px -10px ${accent}18` }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-2xl border border-[#DDD9D3] bg-white p-5 shadow-sm ${wide ? "col-span-2" : ""}`}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}>
            <Icon className="w-4 h-4" style={{ color: accent }} />
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1" style={{ background: `${accent}10`, color: accent }}>
            <TrendingUp className="w-3 h-3" />{change}
          </span>
        </div>
        <p className="text-3xl font-bold text-[#1F1F1F] tracking-tight mb-1">{value}</p>
        <p className="text-xs text-[#A0A0A6] font-medium">{label}</p>
        {chart && (
          <div className="mt-4 h-14 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="aulas" stroke={accent} strokeWidth={2} fill={`url(#g-${label})`} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [tick, setTick] = useState(0);
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = user?.full_name ? user.full_name.split(" ")[0] : null;
  const now = new Date();
  const today = now.getDate();
  const monthLabel = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const weekdayLabel = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstWeekday = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-full" style={{ background: "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)" }}>
      <div className="px-6 lg:px-10 py-7 max-w-[1400px] mx-auto space-y-6">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-[#DDD9D3]"
          style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #F8F7F5 100%)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
        >
          {/* Soft orbs */}
          <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-[0.08]" style={{ background: "#4D7CFE" }} />
          <div className="absolute -bottom-10 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-[0.06]" style={{ background: "#a78bfa" }} />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-7 lg:p-10">
            <div>
              {/* Status pill */}
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-5" style={{ background: "#F1F5FF", border: "1px solid rgba(77,124,254,0.2)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-[#4D7CFE] font-medium">IA Ativa · Pronto para começar</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-[#1F1F1F] mb-3 tracking-tight">
                {greeting}, Prof. {firstName || "Professor"}
              </h1>
              <p className="text-[#6E6E73] text-sm max-w-lg leading-relaxed">
                Seu painel está zerado. Crie planos de aula, corrija provas e use a IA para ganhar tempo no dia a dia.
              </p>

              <div className="flex flex-wrap gap-3 mt-7">
                <Link to="/lesson-creator">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                    style={{ background: "#4D7CFE" }}>
                    <BookOpen className="w-4 h-4" /> Criar Plano de Aula
                  </motion.div>
                </Link>
                <Link to="/grading">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-[#1F1F1F] border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF] transition-all">
                    <FileCheck className="w-4 h-4" /> Corrigir Prova
                  </motion.div>
                </Link>
                <Link to="/ai-assistant">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-[#6B5BD2] border border-[#6B5BD2]/20 bg-[#6B5BD2]/5 hover:bg-[#6B5BD2]/10 transition-all">
                    <Bot className="w-4 h-4" /> IA Assistente
                  </motion.div>
                </Link>
              </div>
            </div>

            {/* Stats strip */}
            <div className="flex flex-row lg:flex-col gap-3 shrink-0">
              {[
                { label: "Aulas hoje", value: "0", icon: Flame, color: "#fb923c" },
                { label: "Horas salvas", value: "0h", icon: Zap, color: "#059669" },
                { label: "Tarefas abertas", value: "0", icon: CheckCircle2, color: "#4D7CFE" },
              ].map((s) => (
                <div key={s.label}
                  className="flex items-center gap-3 bg-white border border-[#DDD9D3] rounded-2xl px-4 py-3 min-w-[160px] shadow-sm">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}12` }}>
                    <s.icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#1F1F1F] leading-none">{s.value}</p>
                    <p className="text-xs text-[#A0A0A6] mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── ROW 1: Metrics ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, label: "Aulas Criadas", value: "0", change: "—", accent: "#4D7CFE", chart: true },
            { icon: FileCheck, label: "Provas Corrigidas", value: "0", change: "—", accent: "#a78bfa" },
            { icon: Zap, label: "Horas Salvas", value: "0h", change: "—", accent: "#059669" },
            { icon: BarChart2, label: "Slides Gerados", value: "0", change: "—", accent: "#fb923c" },
          ].map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }}>
              <MetricCard {...m} />
            </motion.div>
          ))}
        </div>

        {/* ── ROW 2: Chart + Activity ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-3 rounded-2xl border border-[#DDD9D3] p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-[#1F1F1F] text-sm">Atividade Semanal</h3>
                <p className="text-xs text-[#A0A0A6] mt-0.5">Aulas criadas vs questões corrigidas</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#A0A0A6]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#4D7CFE] inline-block" />Aulas</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-400 inline-block" />Questões</span>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gAulas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4D7CFE" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#4D7CFE" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gProvas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#A0A0A6" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#A0A0A6" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="aulas" stroke="#4D7CFE" strokeWidth={2.5} fill="url(#gAulas)" dot={false} activeDot={{ r: 4, fill: "#4D7CFE" }} />
                  <Area type="monotone" dataKey="provas" stroke="#a78bfa" strokeWidth={2.5} fill="url(#gProvas)" dot={false} activeDot={{ r: 4, fill: "#a78bfa" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
            className="lg:col-span-2 rounded-2xl border border-[#DDD9D3] p-5 flex flex-col bg-white shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#1F1F1F] text-sm">Atividade Recente</h3>
              <button className="text-xs text-[#A0A0A6] hover:text-[#4D7CFE] transition-colors flex items-center gap-1">
                Ver tudo <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1 flex-1">
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Clock className="w-8 h-8 text-[#DDD9D3] mb-3" />
                  <p className="text-xs text-[#A0A0A6]">Nenhuma atividade recente ainda.</p>
                </div>
              ) : recentActivity.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.06 }}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-[#FAFAF8] transition-colors group cursor-pointer">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${item.color}15` }}>
                    <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#1F1F1F] truncate">{item.text}</p>
                    <p className="text-xs text-[#A0A0A6] mt-0.5">{item.sub}</p>
                  </div>
                  <span className="text-xs text-[#A0A0A6] shrink-0">{item.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── ROW 3: Goals + Agenda + Calendar ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Goals */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}
            className="rounded-2xl border border-[#DDD9D3] p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-[#1F1F1F] text-sm">Metas do Mês</h3>
                <p className="text-xs text-[#A0A0A6] mt-0.5">Progresso geral</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-5">
              {goals.map((g) => {
                const pct = g.total ? Math.round((g.done / g.total) * 100) : 0;
                return (
                  <div key={g.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#6E6E73]">{g.label}</span>
                      <span className="text-xs font-semibold" style={{ color: g.color }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-[#F0EDE8]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: g.color }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-[#A0A0A6]">{g.done} feito</span>
                      <span className="text-xs text-[#A0A0A6]">{g.total} total</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Agenda Timeline */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}
            className="rounded-2xl border border-[#DDD9D3] p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-[#1F1F1F] text-sm">Agenda de Hoje</h3>
                <p className="text-xs text-[#A0A0A6] mt-0.5 capitalize">{weekdayLabel}</p>
              </div>
              <Link to="/agenda">
                <button className="text-xs text-[#A0A0A6] hover:text-[#4D7CFE] transition-colors flex items-center gap-1">
                  Agenda <ChevronRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
            <div className="relative pl-4">
              <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-[#4D7CFE]/40 via-violet-400/20 to-transparent" />
              <div className="space-y-4">
                {agenda.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-8 h-8 text-[#DDD9D3] mx-auto mb-3" />
                    <p className="text-xs text-[#A0A0A6]">Nenhum compromisso para hoje.</p>
                    <Link to="/agenda" className="text-xs text-[#4D7CFE] hover:underline mt-2 inline-block">Adicionar na agenda</Link>
                  </div>
                ) : agenda.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.07 }} className="relative group">
                    <div className="absolute -left-[18px] top-2 w-2 h-2 rounded-full border-2 border-current transition-all group-hover:scale-125"
                      style={{ color: item.color, background: item.color + "30" }} />
                    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#FAFAF8] transition-colors cursor-pointer">
                      <span className="text-xs font-mono text-[#A0A0A6] shrink-0 mt-0.5 w-11">{item.time}</span>
                      <div>
                        <p className="text-sm font-medium text-[#1F1F1F]">{item.subject}</p>
                        <p className="text-xs text-[#A0A0A6] mt-0.5">{item.class} · {item.school}</p>
                      </div>
                      <div className="ml-auto w-1.5 h-full min-h-[36px] rounded-full" style={{ background: item.color + "40" }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Calendar + Quick links */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }}
            className="flex flex-col gap-4">
            {/* Mini Calendar */}
            <div className="rounded-2xl border border-[#DDD9D3] p-5 flex-1 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1F1F1F] text-sm capitalize">{monthLabel}</h3>
                <Calendar className="w-4 h-4 text-[#A0A0A6]" />
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                  <span key={i} className="text-[10px] text-[#A0A0A6] font-medium py-1">{d}</span>
                ))}
                {[...Array(firstWeekday)].map((_, i) => <div key={`e${i}`} />)}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const isToday = day === today;
                  const hasDot = miniCalDots.includes(day);
                  return (
                    <button key={day} className={`w-7 h-7 rounded-lg text-[11px] font-medium transition-all mx-auto flex items-center justify-center relative
                      ${isToday ? "text-white" : hasDot ? "text-[#1F1F1F] hover:bg-[#F1F1EF]" : "text-[#A0A0A6] hover:bg-[#F1F1EF]"}`}
                      style={isToday ? { background: "#4D7CFE" } : {}}>
                      {day}
                      {hasDot && !isToday && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#4D7CFE]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { to: "/slides", icon: BarChart2, label: "Slides", color: "#fb923c" },
                { to: "/trends", icon: TrendingUp, label: "Tendências", color: "#059669" },
                { to: "/financial", icon: ArrowUpRight, label: "Financeiro", color: "#4D7CFE" },
                { to: "/organization", icon: CheckCircle2, label: "Tarefas", color: "#a78bfa" },
              ].map((q) => (
                <Link key={q.to} to={q.to}>
                  <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-[#DDD9D3] hover:border-[#C8C4BE] bg-white hover:bg-[#FAFAF8] transition-all cursor-pointer shadow-sm">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${q.color}12` }}>
                      <q.icon className="w-3.5 h-3.5" style={{ color: q.color }} />
                    </div>
                    <span className="text-xs font-medium text-[#6E6E73]">{q.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}