// @ts-nocheck
import { db } from '@/api/client';

import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Clock, ArrowDownToLine, Plus } from "lucide-react";

import { toast } from "sonner";

const { ProductSale } = db.entities;

const STATUS_CONFIG = {
  pago: { label: "Pago", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  pendente: { label: "Pendente", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  cancelado: { label: "Cancelado", color: "bg-red-500/15 text-red-400 border-red-500/30" },
  reembolsado: { label: "Reembolsado", color: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
};

export default function StoreFinancial({ products, sales }) {
  const [addSaleOpen, setAddSaleOpen] = useState(false);
  const [form, setForm] = useState({ product_id: products[0]?.id || "", student_name: "", student_email: "", amount: "", payment_method: "pix", status: "pago", date: new Date().toISOString().split("T")[0] });
  const [saving, setSaving] = useState(false);

  const paid = sales.filter(s => s.status === "pago");
  const pending = sales.filter(s => s.status === "pendente");

  const totalRevenue = paid.reduce((a, s) => a + (s.amount || 0), 0);
  const pendingRevenue = pending.reduce((a, s) => a + (s.amount || 0), 0);

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthRevenue = paid.filter(s => {
    if (!s.date) return false;
    const d = new Date(s.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).reduce((a, s) => a + (s.amount || 0), 0);

  const handleAddSale = async () => {
    if (!form.product_id || !form.amount) { toast.error("Preencha os campos obrigatórios."); return; }
    setSaving(true);
    const product = products.find(p => p.id === form.product_id);
    await ProductSale.create({ ...form, product_name: product?.name || "", amount: Number(form.amount) });
    setSaving(false);
    setAddSaleOpen(false);
    setForm({ product_id: products[0]?.id || "", student_name: "", student_email: "", amount: "", payment_method: "pix", status: "pago", date: new Date().toISOString().split("T")[0] });
    toast.success("Venda registrada!");
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Financeiro</h2>
          <p className="text-sm text-slate-500">Acompanhe suas receitas e vendas</p>
        </div>
        <button onClick={() => setAddSaleOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
          <Plus className="w-4 h-4" /> Registrar Venda
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Saldo Disponível", value: `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "#34d399", desc: "Total recebido" },
          { label: "Receita do Mês", value: `R$ ${monthRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "#60a5fa", desc: `${paid.filter(s => { const d = new Date(s.date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; }).length} vendas este mês` },
          { label: "A Receber", value: `R$ ${pendingRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: Clock, color: "#fb923c", desc: `${pending.length} venda${pending.length !== 1 ? "s" : ""} pendente${pending.length !== 1 ? "s" : ""}` },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-white/[0.06] p-5 relative overflow-hidden"
            style={{ background: "#0f172a" }}>
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl" style={{ background: `${s.color}18` }} />
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-slate-500">{s.label}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-600 mt-1">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Saque CTA */}
      <div className="rounded-2xl border border-white/[0.06] p-5 flex flex-col sm:flex-row items-center gap-4" style={{ background: "#0f172a" }}>
        <div className="flex-1">
          <p className="text-white font-semibold mb-1">Solicitar Saque</p>
          <p className="text-slate-500 text-sm">Saldo disponível: <span className="text-emerald-400 font-bold">R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></p>
          <p className="text-xs text-slate-600 mt-1">⚠️ Integração com gateway de pagamento em breve.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white/50 border border-white/[0.07] cursor-not-allowed" disabled>
          <ArrowDownToLine className="w-4 h-4" /> Sacar (em breve)
        </button>
      </div>

      {/* Sales Table */}
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "#0f172a" }}>
        <div className="px-5 py-4 border-b border-white/[0.05]">
          <h3 className="font-semibold text-white text-sm">Histórico de Vendas ({sales.length})</h3>
        </div>
        {sales.length === 0 ? (
          <div className="text-center py-14">
            <DollarSign className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Nenhuma venda registrada ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Produto", "Aluno", "Valor", "Método", "Data", "Status"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {[...sales].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map(sale => (
                  <tr key={sale.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-sm text-white font-medium truncate max-w-40">{sale.product_name}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{sale.student_name || "—"}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-emerald-400">R$ {(sale.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 capitalize">{sale.payment_method || "—"}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{sale.date ? new Date(sale.date + "T12:00").toLocaleDateString("pt-BR") : "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_CONFIG[sale.status]?.color || STATUS_CONFIG.pago.color}`}>
                        {STATUS_CONFIG[sale.status]?.label || sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Sale Modal */}
      {addSaleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAddSaleOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md rounded-2xl border border-white/[0.08] p-6 z-10"
            style={{ background: "#0d1728" }}>
            <h3 className="font-bold text-white mb-4">Registrar Venda Manual</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Produto *</label>
                <select value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
                  className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-300 focus:outline-none">
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Nome do Aluno</label>
                  <input value={form.student_name} onChange={e => setForm(f => ({ ...f, student_name: e.target.value }))}
                    placeholder="Nome" className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Valor (R$) *</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0,00" className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Pagamento</label>
                  <select value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                    className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-300 focus:outline-none">
                    {["pix", "cartao", "boleto", "transferencia"].map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Data</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-white focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleAddSale} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
                {saving ? "Salvando..." : "Registrar"}
              </button>
              <button onClick={() => setAddSaleOpen(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-400 border border-white/[0.07] hover:bg-white/[0.05]">Cancelar</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}