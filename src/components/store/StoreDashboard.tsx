// @ts-nocheck
import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, Package, Sparkles, ArrowRight, Plus } from "lucide-react";

export default function StoreDashboard({ products, sales, onCreateProduct }) {
  const totalRevenue = sales.filter(s => s.status === "pago").reduce((acc, s) => acc + (s.amount || 0), 0);
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthSales = sales.filter(s => {
    if (!s.date) return false;
    const d = new Date(s.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear && s.status === "pago";
  });
  const monthRevenue = monthSales.reduce((acc, s) => acc + (s.amount || 0), 0);
  const activeStudents = products.reduce((acc, p) => acc + (p.students_count || 0), 0);
  const activeProducts = products.filter(p => p.status === "ativo").length;

  const stats = [
    { label: "Ganhos Totais", value: `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "#34d399", bg: "#34d39918" },
    { label: "Este Mês", value: `R$ ${monthRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "#60a5fa", bg: "#60a5fa18" },
    { label: "Alunos Ativos", value: activeStudents, icon: Users, color: "#a78bfa", bg: "#a78bfa18" },
    { label: "Produtos Ativos", value: activeProducts, icon: Package, color: "#fb923c", bg: "#fb923c18" },
  ];

  const topProducts = [...products]
    .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
    .slice(0, 5);

  const recentSales = [...sales]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 6);

  const PRODUCT_TYPE_LABELS = {
    aula_avulsa: "Aula Avulsa",
    curso: "Curso",
    comunidade: "Comunidade",
    mentoria: "Mentoria",
    programa: "Programa",
    desafio: "Desafio",
    material: "Material",
  };

  return (
    <div className="space-y-6">
      {/* Motivation Banner */}
      {totalRevenue > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a2744, #1a1a3e)" }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute right-8 top-0 w-48 h-full bg-blue-500/5 blur-3xl rounded-full" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-white font-bold text-lg">Você já faturou R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} com seu conhecimento! 🎉</p>
            <p className="text-slate-400 text-sm">Continue criando e vendendo — cada venda é seu conhecimento transformado em valor.</p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-white/[0.06] p-5 relative overflow-hidden"
            style={{ background: "#0f172a" }}>
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl" style={{ background: s.bg }} />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg, border: `1px solid ${s.color}30` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "#0f172a" }}>
          <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm">Produtos mais vendidos</h3>
          </div>
          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <Package className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm mb-4">Você ainda não criou nenhum produto.</p>
              <button onClick={onCreateProduct}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                <Plus className="w-4 h-4" /> Criar primeiro produto
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm font-bold text-slate-600 w-5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">{PRODUCT_TYPE_LABELS[p.type] || p.type} · {p.students_count || 0} alunos</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-400">R$ {(p.total_revenue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "#0f172a" }}>
          <div className="px-5 py-4 border-b border-white/[0.05]">
            <h3 className="font-semibold text-white text-sm">Últimas vendas</h3>
          </div>
          {recentSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <DollarSign className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm">Nenhuma venda registrada ainda.</p>
              <p className="text-xs text-slate-600 mt-1">Suas vendas aparecerão aqui.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {recentSales.map(sale => (
                <div key={sale.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{sale.student_name || "Aluno"}</p>
                    <p className="text-xs text-slate-500 truncate">{sale.product_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">R$ {(sale.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-slate-600">{sale.date ? new Date(sale.date + "T12:00").toLocaleDateString("pt-BR") : "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}