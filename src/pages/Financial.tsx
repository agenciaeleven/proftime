import { db } from '@/api/client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Plus, Bell, FileText, X, Upload, Check, AlertTriangle, Repeat,
  Trash2, Calendar, ChevronDown, Paperclip, ExternalLink, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

import { toast } from "sonner";

const { FinancialTransaction, FinancialReminder } = db.entities;

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const TABS = [
  { key: "overview", label: "Visão Geral" },
  { key: "transactions", label: "Movimentações" },
  { key: "reminders", label: "Lembretes & Contas" },
];

const STATUS_CONFIG = {
  pendente: { label: "Pendente", color: "#fb923c", bg: "#fb923c15" },
  pago: { label: "Pago", color: "#34d399", bg: "#34d39915" },
  atrasado: { label: "Atrasado", color: "#f87171", bg: "#f8717115" },
};

const TYPE_CONFIG = {
  boleto: { label: "Boleto", icon: FileText },
  conta_fixa: { label: "Conta Fixa", icon: Repeat },
  parcelamento: { label: "Parcelamento", icon: TrendingDown },
  outro: { label: "Outro", icon: DollarSign },
};

const CATEGORIES_IN = ["Aula Particular", "Salário", "Bônus", "Freelance", "Outro"];
const CATEGORIES_OUT = ["Alimentação", "Transporte", "Material Escolar", "Plataformas", "Impostos", "Outro"];

// ─── Transaction Modal ────────────────────────────────────────────────────────
function TransactionModal({ open, onClose, onSave, type }) {
  const [form, setForm] = useState({ name: "", value: "", date: "", category: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const categories = type === "entrada" ? CATEGORIES_IN : CATEGORIES_OUT;

  const handleSave = async () => {
    if (!form.name || !form.value || !form.date) { toast.error("Preencha os campos obrigatórios."); return; }
    setSaving(true);
    await onSave({ ...form, type, value: parseFloat(form.value) });
    setForm({ name: "", value: "", date: "", category: "", notes: "" });
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-3xl p-6 z-10 shadow-xl"
        style={{ background: "#FFFFFF", border: "1px solid #DDD9D3" }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: type === "entrada" ? "#d1fae5" : "#fee2e2" }}>
              {type === "entrada" ? <ArrowUpRight className="w-4 h-4 text-emerald-600" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
            </div>
            <h2 className="font-semibold text-[#1F1F1F]">
              {type === "entrada" ? "Registrar Entrada" : "Registrar Saída"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F1EF] transition-colors"><X className="w-4 h-4 text-[#A0A0A6]" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Descrição *</label>
            <input placeholder="Ex: Aula particular João" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Valor (R$) *</label>
              <input type="number" min="0" step="0.01" placeholder="0,00" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Data *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Categoria</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20">
              <option value="">Selecione...</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Observações</label>
            <textarea rows={2} placeholder="Notas opcionais..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 py-2 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20 resize-none" />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
            className="flex-1 h-10 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: type === "entrada" ? "#059669" : "#ef4444" }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Salvar
          </motion.button>
          <button onClick={onClose} className="px-4 h-10 rounded-2xl text-sm text-[#6E6E73] border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF] transition-all">Cancelar</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Reminder Modal ───────────────────────────────────────────────────────────
function ReminderModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", value: "", due_date: "", type: "boleto", recurrent: false, notes: "" });
  const [fileUploading, setFileUploading] = useState(false);
  const [boletoFile, setBoletoFile] = useState(null);
  const [boletoUrl, setBoletoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setFileUploading(true);
    setBoletoFile(file);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setBoletoUrl(file_url);
    setFileUploading(false);
    toast.success("Arquivo anexado!");
  };

  const handleSave = async () => {
    if (!form.name || !form.value || !form.due_date) { toast.error("Preencha os campos obrigatórios."); return; }
    setSaving(true);
    await onSave({ ...form, value: parseFloat(form.value), boleto_url: boletoUrl });
    setForm({ name: "", value: "", due_date: "", type: "boleto", recurrent: false, notes: "" });
    setBoletoFile(null); setBoletoUrl("");
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md rounded-3xl p-6 z-10 shadow-xl max-h-[90vh] overflow-y-auto"
        style={{ background: "#FFFFFF", border: "1px solid #DDD9D3" }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
              <Bell className="w-4 h-4 text-orange-500" />
            </div>
            <h2 className="font-semibold text-[#1F1F1F]">Novo Lembrete / Conta</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F1EF]"><X className="w-4 h-4 text-[#A0A0A6]" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Descrição *</label>
            <input placeholder="Ex: Conta de luz, Boleto FIES..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Valor *</label>
              <input type="number" min="0" step="0.01" placeholder="0,00" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Vencimento *</label>
              <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setForm(f => ({ ...f, type: key }))}
                  className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all",
                    form.type === key ? "border-[#4D7CFE]/40 bg-[#F1F5FF] text-[#4D7CFE]" : "border-[#DDD9D3] bg-white text-[#6E6E73] hover:bg-[#F1F1EF]"
                  )}>
                  <cfg.icon className="w-3.5 h-3.5" />{cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-[#DDD9D3] bg-[#FAFAF8]">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-[#A0A0A6]" />
              <span className="text-sm text-[#1F1F1F]">Recorrente (mensal)</span>
            </div>
            <button onClick={() => setForm(f => ({ ...f, recurrent: !f.recurrent }))}
              className={cn("w-10 h-5 rounded-full transition-all relative", form.recurrent ? "bg-[#4D7CFE]" : "bg-[#DDD9D3]")}>
              <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm", form.recurrent ? "left-5" : "left-0.5")} />
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Anexar Boleto / Comprovante</label>
            {!boletoFile ? (
              <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-[#DDD9D3] hover:border-[#4D7CFE]/40 cursor-pointer transition-all">
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFile(e.target.files[0])} />
                {fileUploading ? <Loader2 className="w-5 h-5 text-[#A0A0A6] animate-spin" /> : <Paperclip className="w-5 h-5 text-[#A0A0A6]" />}
                <span className="text-sm text-[#A0A0A6]">{fileUploading ? "Enviando..." : "Clique para anexar (PDF, imagem)"}</span>
              </label>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-[#1F1F1F] flex-1 truncate">{boletoFile.name}</span>
                <button onClick={() => { setBoletoFile(null); setBoletoUrl(""); }} className="p-1 hover:bg-black/5 rounded"><X className="w-3.5 h-3.5 text-[#A0A0A6]" /></button>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Observações</label>
            <textarea rows={2} placeholder="Notas..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 py-2 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none resize-none" />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
            className="flex-1 h-10 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "#f59e0b" }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
            Salvar Lembrete
          </motion.button>
          <button onClick={onClose} className="px-4 h-10 rounded-2xl text-sm text-[#6E6E73] border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF] transition-all">Cancelar</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Financial() {
  const [tab, setTab] = useState("overview");
  const [transactions, setTransactions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txModal, setTxModal] = useState(null); // "entrada" | "saida"
  const [remModal, setRemModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [tx, rm] = await Promise.all([
      FinancialTransaction.list("-date"),
      FinancialReminder.list("due_date")
    ]);
    setTransactions(tx);
    setReminders(rm);
    setLoading(false);
  };

  const handleSaveTransaction = async (data) => {
    const created = await FinancialTransaction.create(data);
    setTransactions(prev => [created, ...prev]);
    toast.success(data.type === "entrada" ? "Entrada registrada!" : "Saída registrada!");
  };

  const handleSaveReminder = async (data) => {
    const created = await FinancialReminder.create(data);
    setReminders(prev => [...prev, created].sort((a, b) => a.due_date?.localeCompare(b.due_date)));
    toast.success("Lembrete criado!");
  };

  const handleDeleteTransaction = async (id) => {
    await FinancialTransaction.delete(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success("Removido.");
  };

  const handleUpdateReminderStatus = async (id, status) => {
    const updated = await FinancialReminder.update(id, { status });
    setReminders(prev => prev.map(r => r.id === id ? updated : r));
  };

  const handleDeleteReminder = async (id) => {
    await FinancialReminder.delete(id);
    setReminders(prev => prev.filter(r => r.id !== id));
    toast.success("Lembrete removido.");
  };

  const totalIn = transactions.filter(t => t.type === "entrada").reduce((a, t) => a + (t.value || 0), 0);
  const totalOut = transactions.filter(t => t.type === "saida").reduce((a, t) => a + (t.value || 0), 0);
  const balance = totalIn - totalOut;

  const overdueCount = reminders.filter(r => {
    if (r.status === "pago") return false;
    return r.due_date && r.due_date < new Date().toISOString().slice(0, 10);
  }).length;

  const pendingReminders = reminders.filter(r => r.status !== "pago");

  return (
    <div className="min-h-full" style={{ background: "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)" }}>
      {/* Modals */}
      <AnimatePresence>
        {txModal && <TransactionModal open type={txModal} onClose={() => setTxModal(null)} onSave={handleSaveTransaction} />}
        {remModal && <ReminderModal open onClose={() => setRemModal(false)} onSave={handleSaveReminder} />}
      </AnimatePresence>

      <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-4" style={{ background: "#F1F5FF", border: "1px solid rgba(77,124,254,0.2)" }}>
                <DollarSign className="w-3.5 h-3.5 text-[#4D7CFE]" />
                <span className="text-xs text-[#4D7CFE] font-medium">Controle Financeiro</span>
              </div>
              <h1 className="text-3xl font-bold text-[#1F1F1F] tracking-tight">Financeiro</h1>
              <p className="text-[#6E6E73] text-sm mt-1.5">
                Acompanhe entradas, saídas e seus compromissos financeiros.
                {overdueCount > 0 && <span className="ml-2 text-red-500 font-medium">⚠ {overdueCount} conta{overdueCount > 1 ? "s" : ""} atrasada{overdueCount > 1 ? "s" : ""}!</span>}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setTxModal("entrada")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-sm font-medium"
                style={{ background: "#059669" }}>
                <ArrowUpRight className="w-4 h-4" /> Entrada
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setTxModal("saida")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-sm font-medium"
                style={{ background: "#ef4444" }}>
                <ArrowDownRight className="w-4 h-4" /> Saída
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setRemModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium text-[#1F1F1F] border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF] transition-all">
                <Bell className="w-4 h-4" /> Lembrete
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Recebido", value: totalIn, accent: "#34d399", icon: TrendingUp, sub: `${transactions.filter(t => t.type === "entrada").length} entradas` },
            { label: "Total de Saídas", value: totalOut, accent: "#f87171", icon: TrendingDown, sub: `${transactions.filter(t => t.type === "saida").length} saídas` },
            { label: "Saldo Atual", value: balance, accent: balance >= 0 ? "#60a5fa" : "#f87171", icon: DollarSign, sub: "Líquido", highlight: true },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3, boxShadow: `0 20px 60px ${card.accent}18` }}
              className="rounded-2xl border border-[#DDD9D3] p-6 relative overflow-hidden transition-all bg-white shadow-sm"
              style={{ background: "#FFFFFF" }}>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-[#A0A0A6]">{card.label}</span>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${card.accent}18`, border: `1px solid ${card.accent}28` }}>
                    <card.icon className="w-4 h-4" style={{ color: card.accent }} />
                  </div>
                </div>
                <p className="text-3xl font-bold tracking-tight" style={{ color: card.accent }}>{fmt(card.value)}</p>
                <p className="text-xs text-[#A0A0A6] mt-1">{card.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl border border-[#DDD9D3] bg-white mb-6 w-fit shadow-sm">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-all relative",
                tab === t.key ? "text-[#1F1F1F]" : "text-[#A0A0A6] hover:text-[#6E6E73]"
              )}>
              {tab === t.key && <motion.div layoutId="tabBg" className="absolute inset-0 rounded-xl bg-[#F1F1EF]" />}
              <span className="relative z-10 flex items-center gap-2">
                {t.label}
                {t.key === "reminders" && pendingReminders.length > 0 && (
                  <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                    style={{ background: overdueCount > 0 ? "#ef4444" : "#fb923c", color: "white" }}>
                    {pendingReminders.length}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* OVERVIEW */}
            {tab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Recent transactions */}
                <div className="rounded-3xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #DDD9D3", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                  <div className="px-5 py-4 border-b border-[#E8E6E1] flex items-center justify-between">
                    <h3 className="font-semibold text-[#1F1F1F] text-sm">Movimentações Recentes</h3>
                    <button onClick={() => setTab("transactions")} className="text-xs text-[#A0A0A6] hover:text-[#4D7CFE] transition-colors">Ver todas</button>
                  </div>
                  {transactions.slice(0, 5).length === 0 ? (
                    <div className="py-10 text-center text-[#A0A0A6] text-sm">Nenhuma movimentação ainda.</div>
                  ) : (
                    transactions.slice(0, 5).map((t, i) => (
                      <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center justify-between px-5 py-3.5 border-b border-[#F0EDE8] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                         <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: t.type === "entrada" ? "#d1fae5" : "#fee2e2" }}>
                            {t.type === "entrada" ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#1F1F1F]">{t.name}</p>
                            <p className="text-xs text-[#A0A0A6]">{t.category || "Sem categoria"} · {t.date ? new Date(t.date + "T12:00:00").toLocaleDateString("pt-BR") : "-"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold" style={{ color: t.type === "entrada" ? "#059669" : "#ef4444" }}>
                            {t.type === "entrada" ? "+" : "-"}{fmt(t.value)}
                          </span>
                          <button onClick={() => handleDeleteTransaction(t.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[#A0A0A6] hover:text-red-500 transition-all" title="Remover">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        </motion.div>
                    ))
                  )}
                </div>

                {/* Upcoming reminders */}
                {pendingReminders.length > 0 && (
                  <div className="rounded-3xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(249,115,22,0.25)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                    <div className="px-5 py-4 border-b border-orange-100 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-500" />
                      <h3 className="font-semibold text-[#1F1F1F] text-sm">Próximos Vencimentos</h3>
                    </div>
                    {pendingReminders.slice(0, 4).map((r, i) => {
                      const isOverdue = r.due_date < new Date().toISOString().slice(0, 10);
                      const cfg = STATUS_CONFIG[isOverdue ? "atrasado" : r.status] || STATUS_CONFIG.pendente;
                      const TypeIcon = TYPE_CONFIG[r.type]?.icon || FileText;
                      return (
                       <div key={r.id} className="flex items-center justify-between px-5 py-3.5 border-b border-[#F0EDE8] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: cfg.bg }}>
                             <TypeIcon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                           </div>
                           <div>
                             <p className="text-sm font-medium text-[#1F1F1F]">{r.name}</p>
                             <p className="text-xs text-[#A0A0A6]">Vence: {r.due_date ? new Date(r.due_date + "T12:00:00").toLocaleDateString("pt-BR") : "-"}</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-3">
                           <span className="text-sm font-bold text-[#1F1F1F]">{fmt(r.value)}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                              {isOverdue ? "Atrasado" : cfg.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* TRANSACTIONS */}
            {tab === "transactions" && (
              <motion.div key="transactions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="rounded-3xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #DDD9D3", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                  <div className="px-5 py-4 border-b border-[#E8E6E1]">
                    <h3 className="font-semibold text-[#1F1F1F] text-sm">Todas as Movimentações</h3>
                  </div>
                  {transactions.length === 0 ? (
                    <div className="py-14 text-center">
                      <DollarSign className="w-10 h-10 text-[#DDD9D3] mx-auto mb-3" />
                      <p className="text-[#A0A0A6] text-sm">Nenhuma movimentação ainda.</p>
                      <p className="text-[#A0A0A6] text-xs mt-1">Use os botões acima para registrar entradas e saídas.</p>
                    </div>
                  ) : (
                    transactions.map((t, i) => (
                      <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between px-5 py-3.5 border-b border-[#F0EDE8] last:border-0 hover:bg-[#FAFAF8] group transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: t.type === "entrada" ? "#d1fae5" : "#fee2e2" }}>
                            {t.type === "entrada" ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#1F1F1F]">{t.name}</p>
                            <p className="text-xs text-[#A0A0A6]">{t.category || "Sem categoria"} · {t.date ? new Date(t.date + "T12:00:00").toLocaleDateString("pt-BR") : "-"}</p>
                            {t.notes && <p className="text-xs text-[#A0A0A6] mt-0.5">{t.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold" style={{ color: t.type === "entrada" ? "#059669" : "#ef4444" }}>
                            {t.type === "entrada" ? "+" : "-"}{fmt(t.value)}
                          </span>
                          <button onClick={() => handleDeleteTransaction(t.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[#A0A0A6] hover:text-red-500 transition-all" title="Remover">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* REMINDERS */}
            {tab === "reminders" && (
              <motion.div key="reminders" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {reminders.length === 0 ? (
                  <div className="rounded-3xl py-14 text-center" style={{ background: "#FFFFFF", border: "1px solid #DDD9D3" }}>
                    <Bell className="w-10 h-10 text-[#DDD9D3] mx-auto mb-3" />
                    <p className="text-[#A0A0A6] text-sm">Nenhum lembrete criado ainda.</p>
                    <button onClick={() => setRemModal(true)}
                      className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 rounded-2xl text-sm text-[#1F1F1F] border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF] transition-all">
                      <Plus className="w-4 h-4" /> Criar primeiro lembrete
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reminders.map((r, i) => {
                      const isOverdue = r.status !== "pago" && r.due_date < new Date().toISOString().slice(0, 10);
                      const effectiveStatus = isOverdue ? "atrasado" : r.status;
                      const cfg = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.pendente;
                      const TypeIcon = TYPE_CONFIG[r.type]?.icon || FileText;

                      return (
                        <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="rounded-3xl p-5 transition-all group"
                          style={{ background: "#FFFFFF", border: `1px solid #DDD9D3`, borderLeft: `4px solid ${cfg.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                style={{ background: cfg.bg }}>
                                <TypeIcon className="w-4 h-4" style={{ color: cfg.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-semibold text-[#1F1F1F]">{r.name}</p>
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                                    {isOverdue ? "Atrasado" : cfg.label}
                                  </span>
                                  {r.recurrent && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5FF] text-[#4D7CFE] flex items-center gap-1">
                                      <Repeat className="w-2.5 h-2.5" /> Mensal
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <span className="text-xs text-[#A0A0A6] flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Vence: {r.due_date ? new Date(r.due_date + "T12:00:00").toLocaleDateString("pt-BR") : "-"}
                                  </span>
                                  <span className="text-xs font-semibold text-[#1F1F1F]">{fmt(r.value)}</span>
                                  <span className="text-xs text-[#A0A0A6]">{TYPE_CONFIG[r.type]?.label}</span>
                                </div>
                                {r.notes && <p className="text-xs text-[#A0A0A6] mt-1">{r.notes}</p>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {r.boleto_url && (
                                <a href={r.boleto_url} target="_blank" rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg hover:bg-[#F1F1EF] transition-all" title="Ver boleto">
                                  <ExternalLink className="w-3.5 h-3.5 text-[#4D7CFE]" />
                                </a>
                              )}
                              {r.status !== "pago" && (
                                <button onClick={() => handleUpdateReminderStatus(r.id, "pago")}
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all border border-emerald-200">
                                  <Check className="w-3 h-3" /> Pago
                                </button>
                              )}
                              <button onClick={() => handleDeleteReminder(r.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-[#A0A0A6] hover:text-red-500 transition-all" title="Remover">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}