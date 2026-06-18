import { motion } from "framer-motion";
import { TrendingUp, Users, Package, DollarSign, ArrowUpRight, Star, ExternalLink, Plus, Zap } from "lucide-react";

const TYPE_LABELS = { aula_avulsa:"Aula", curso:"Curso", comunidade:"Comunidade", mentoria:"Mentoria", programa:"Programa", desafio:"Desafio", material:"Material" };

export default function HubDashboard({ products, sales, profile, onCreateProduct, onGoToStore }) {
  const paid = sales.filter(s => s.status === "pago");
  const totalRevenue = paid.reduce((sum, s) => sum + (s.amount || 0), 0);
  const now = new Date();
  const monthSales = paid.filter(s => {
    const d = new Date(s.created_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthRevenue = monthSales.reduce((sum, s) => sum + (s.amount || 0), 0);
  const uniqueStudents = new Set(paid.map(s => s.student_email).filter(Boolean)).size;
  const activeProducts = products.filter(p => p.status === "ativo").length;

  // Top products by revenue
  const topProducts = [...products].sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0)).slice(0, 5);

  const metrics = [
    { label: "Faturamento Total", value: `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "#10b981", bg: "#10b98120", change: "+23%" },
    { label: "Este Mês", value: `R$ ${monthRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "#3b82f6", bg: "#3b82f620", change: "+18%" },
    { label: "Alunos/Clientes", value: uniqueStudents, icon: Users, color: "#a78bfa", bg: "#a78bfa20", change: `+${paid.length}` },
    { label: "Produtos Ativos", value: activeProducts, icon: Package, color: "#f59e0b", bg: "#f59e0b20", change: `${products.length} total` },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-[#DDD9D3] p-6 bg-white shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-32 blur-3xl opacity-[0.07] rounded-full pointer-events-none" style={{ background: "#3b82f6" }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs text-[#4D7CFE] font-semibold mb-1 uppercase tracking-wider">Proftime Hub · Dashboard</p>
            <h2 className="text-2xl font-bold text-[#1F1F1F] mb-2">
              {totalRevenue > 0
                ? `Você já faturou R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} com sua loja! 🎉`
                : "Crie sua loja, publique e comece a faturar."}
            </h2>
            <p className="text-[#6E6E73] text-sm">
              {products.length === 0
                ? "Crie seu primeiro produto e compartilhe com seus alunos."
                : `${products.length} produto${products.length !== 1 ? "s" : ""} cadastrado${products.length !== 1 ? "s" : ""} · ${paid.length} venda${paid.length !== 1 ? "s" : ""} realizadas`}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={onGoToStore}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-[#DDD9D3] bg-white text-[#1F1F1F] hover:bg-[#F1F1EF] transition-all">
              <ExternalLink className="w-4 h-4" /> Ver loja
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={onCreateProduct}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#4D7CFE" }}>
              <Plus className="w-4 h-4" /> Criar produto
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-[#DDD9D3] p-5 relative overflow-hidden bg-white shadow-sm">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: m.bg, border: `1px solid ${m.color}30` }}>
                <m.icon className="w-4 h-4" style={{ color: m.color }} />
              </div>
              <p className="text-xl font-bold text-[#1F1F1F]">{m.value}</p>
              <p className="text-xs text-[#A0A0A6] mt-0.5">{m.label}</p>
              <span className="absolute top-0 right-0 text-xs font-medium" style={{ color: m.color }}>{m.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Products + Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl border border-[#DDD9D3] p-5 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1F1F1F] text-sm">Produtos em Destaque</h3>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          {topProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-10 h-10 text-[#DDD9D3] mx-auto mb-3" />
              <p className="text-sm text-[#A0A0A6] mb-3">Nenhum produto ainda</p>
              <button onClick={onCreateProduct}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold mx-auto"
                style={{ background: "#4D7CFE" }}>
                <Plus className="w-3 h-3" /> Criar produto
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FAFAF8] transition-colors">
                  <span className="text-xs font-bold text-[#A0A0A6] w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1F1F1F] truncate">{p.name}</p>
                    <p className="text-[10px] text-[#A0A0A6]">{TYPE_LABELS[p.type] || p.type} · {p.students_count || 0} alunos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600">R$ {(p.total_revenue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</p>
                    <p className="text-[10px] text-[#A0A0A6]">{p.sales_count || 0} vendas</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Sales */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-[#DDD9D3] p-5 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1F1F1F] text-sm">Últimas Vendas</h3>
            <Zap className="w-4 h-4 text-[#4D7CFE]" />
          </div>
          {sales.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-10 h-10 text-[#DDD9D3] mx-auto mb-3" />
              <p className="text-sm text-[#A0A0A6]">Nenhuma venda ainda.</p>
              <p className="text-xs text-[#C0BDBA] mt-1">Compartilhe sua loja para começar a vender!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sales.slice(0, 6).map(s => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FAFAF8] transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1F1F1F] truncate">{s.student_name || "Aluno"}</p>
                    <p className="text-[10px] text-[#A0A0A6] truncate">{s.product_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600">R$ {(s.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                      s.status === "pago" ? "bg-emerald-100 text-emerald-600" : s.status === "pendente" ? "bg-amber-100 text-amber-600" : "bg-[#F1F1EF] text-[#A0A0A6]"
                    }`}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}