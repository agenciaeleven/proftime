import { db } from '@/api/client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, TrendingUp, Clock, ArrowDownRight, Plus, X, Loader2, CreditCard, Banknote } from "lucide-react";

import { toast } from "sonner";

const { ProductSale } = db.entities;

const STATUS_CONFIG = {
  pago:        { label:"Pago",       color:"#10b981", bg:"#10b98120" },
  pendente:    { label:"Pendente",   color:"#f59e0b", bg:"#f59e0b20" },
  cancelado:   { label:"Cancelado",  color:"#ef4444", bg:"#ef444420" },
  reembolsado: { label:"Reembolsado",color:"#64748b", bg:"#64748b20" },
};

export default function HubFinancial({ products, sales, onSaleAdded }) {
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ product_id:"", product_name:"", student_name:"", student_email:"", amount:"", status:"pago", payment_method:"pix", date: new Date().toISOString().split("T")[0] });

  const paid = sales.filter(s => s.status === "pago");
  const pending = sales.filter(s => s.status === "pendente");
  const totalRevenue = paid.reduce((sum, s) => sum + (s.amount || 0), 0);
  const pendingRevenue = pending.reduce((sum, s) => sum + (s.amount || 0), 0);
  const now = new Date();
  const monthPaid = paid.filter(s => {
    const d = new Date(s.created_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthRevenue = monthPaid.reduce((sum, s) => sum + (s.amount || 0), 0);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleProductChange = (id) => {
    const p = products.find(p => p.id === id);
    set("product_id", id);
    if (p) { set("product_name", p.name); set("amount", String(p.price || "")); }
  };

  const handleSave = async () => {
    if (!form.amount || isNaN(Number(form.amount))) { toast.error("Informe um valor válido."); return; }
    setSaving(true);
    const created = await ProductSale.create({ ...form, amount: Number(form.amount) });
    onSaleAdded(created);
    setAddOpen(false);
    setForm({ product_id:"", product_name:"", student_name:"", student_email:"", amount:"", status:"pago", payment_method:"pix", date: new Date().toISOString().split("T")[0] });
    toast.success("Venda registrada!");
    setSaving(false);
  };

  const metrics = [
    { label:"Saldo Total", value:`R$ ${totalRevenue.toLocaleString("pt-BR",{minimumFractionDigits:2})}`, icon:DollarSign, color:"#10b981" },
    { label:"Este Mês", value:`R$ ${monthRevenue.toLocaleString("pt-BR",{minimumFractionDigits:2})}`, icon:TrendingUp, color:"#3b82f6" },
    { label:"A Receber", value:`R$ ${pendingRevenue.toLocaleString("pt-BR",{minimumFractionDigits:2})}`, icon:Clock, color:"#f59e0b" },
    { label:"Total de Vendas", value:paid.length, icon:CreditCard, color:"#a78bfa" },
  ];

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">Financeiro</h2>
          <p className="text-xs text-slate-500">Acompanhe seus ganhos e transações</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm"
          style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
          <Plus className="w-4 h-4" /> Registrar venda
        </motion.button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-white/[0.06] p-4 relative overflow-hidden" style={{ background: "#0f172a" }}>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl opacity-25" style={{ background: m.color }} />
            <div className="relative">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${m.color}20` }}>
                <m.icon className="w-4 h-4" style={{ color: m.color }} />
              </div>
              <p className="text-lg font-bold text-white">{m.value}</p>
              <p className="text-[10px] text-slate-500">{m.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Saque Banner */}
      <div className="rounded-2xl border border-emerald-500/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
        style={{ background: "linear-gradient(135deg,#059669080,#10b981060,#0f172a)" }}>
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
          <Banknote className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Saldo disponível para saque</p>
          <p className="text-xs text-slate-400">R$ {totalRevenue.toLocaleString("pt-BR",{minimumFractionDigits:2})} · Saque mínimo: R$ 50,00</p>
        </div>
        <button className="px-4 py-2 rounded-xl text-white text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 transition-colors">
          Solicitar saque
        </button>
      </div>

      {/* Sales Table */}
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "#0f172a" }}>
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">Histórico de Vendas</h3>
          <span className="text-xs text-slate-500">{sales.length} transaçã{sales.length !== 1 ? "ões" : "o"}</span>
        </div>
        {sales.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Nenhuma venda ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["Aluno","Produto","Valor","Status","Data"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.map((s, i) => {
                  const sc = STATUS_CONFIG[s.status] || STATUS_CONFIG.pago;
                  return (
                    <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01] transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-xs font-semibold text-white">{s.student_name || "—"}</p>
                        <p className="text-[10px] text-slate-600">{s.student_email || ""}</p>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400 max-w-[160px] truncate">{s.product_name}</td>
                      <td className="px-5 py-3 text-xs font-bold text-emerald-400">R$ {(s.amount||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}</td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: sc.bg, color: sc.color }}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-600">
                        {s.created_date ? new Date(s.created_date).toLocaleDateString("pt-BR") : s.date || "—"}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {addOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl border border-white/[0.08] p-6 z-10 shadow-2xl" style={{ background: "#0f172a" }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-white">Registrar Venda</h3>
                <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10"><X className="w-4 h-4 text-slate-500" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Produto</label>
                  <select value={form.product_id} onChange={e => handleProductChange(e.target.value)}
                    className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-200 focus:outline-none">
                    <option value="">Selecione</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Nome do aluno</label>
                    <input value={form.student_name} onChange={e => set("student_name", e.target.value)} placeholder="Nome completo"
                      className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Valor (R$)</label>
                    <input type="number" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="0,00"
                      className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">E-mail do aluno</label>
                  <input value={form.student_email} onChange={e => set("student_email", e.target.value)} placeholder="aluno@email.com"
                    className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Status</label>
                    <select value={form.status} onChange={e => set("status", e.target.value)}
                      className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-200 focus:outline-none">
                      {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Pagamento</label>
                    <select value={form.payment_method} onChange={e => set("payment_method", e.target.value)}
                      className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-200 focus:outline-none">
                      <option value="pix">PIX</option>
                      <option value="cartao">Cartão</option>
                      <option value="boleto">Boleto</option>
                      <option value="transferencia">Transferência</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    onClick={handleSave} disabled={saving}
                    className="flex-1 h-10 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Registrar
                  </motion.button>
                  <button onClick={() => setAddOpen(false)}
                    className="px-4 h-10 rounded-xl text-sm text-slate-400 border border-white/[0.07] hover:bg-white/[0.05]">Cancelar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}