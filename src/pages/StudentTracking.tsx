// @ts-nocheck
import { db } from '@/api/client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Search, X, Save, Trash2, ChevronRight,
  TrendingUp, FileText, Star, Activity, MessageSquare, Award,
  Loader2, Edit2, ArrowLeft, BarChart2, Clock
} from "lucide-react";

import { toast } from "sonner";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from "recharts";

const { Student, StudentRecord } = db.entities;

const RECORD_TYPES = {
  prova:        { label: "Prova",         color: "#3b82f6", icon: Award },
  atividade:    { label: "Atividade",     color: "#10b981", icon: FileText },
  comportamento:{ label: "Comportamento", color: "#f59e0b", icon: Star },
  participacao: { label: "Participação",  color: "#a78bfa", icon: Activity },
  observacao:   { label: "Observação",    color: "#94a3b8", icon: MessageSquare },
};

const AVATAR_COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899","#f97316"];

// ── Student Form Modal ─────────────────────────────────────────────────────
function StudentModal({ open, onClose, onSave, student }) {
  const blank = { name: "", class_name: "", subject: "", email: "", notes: "", avatar_color: "#3b82f6" };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(student ? { ...blank, ...student } : blank); }, [student, open]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Informe o nome."); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-3xl p-6 z-10 shadow-xl"
        style={{ background: "#FFFFFF", border: "1px solid #DDD9D3" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-[#1F1F1F]">{student ? "Editar Aluno" : "Novo Aluno"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F1EF]"><X className="w-4 h-4 text-[#A0A0A6]" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Nome *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome completo do aluno"
              className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Turma</label>
              <input value={form.class_name} onChange={e => setForm(f => ({ ...f, class_name: e.target.value }))} placeholder="Ex: 9º A"
                className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Disciplina</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Ex: Matemática"
                className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">E-mail</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@escola.com"
              className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Cor do Avatar</label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, avatar_color: c }))}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{ background: c, outline: form.avatar_color === c ? `2px solid white` : "none", outlineOffset: "2px" }} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Observações</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Anotações gerais sobre o aluno..."
              className="w-full bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 py-2.5 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
            className="flex-1 h-10 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "#4D7CFE" }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {student ? "Atualizar" : "Criar Aluno"}
          </motion.button>
          <button onClick={onClose} className="px-4 h-10 rounded-2xl text-sm text-[#6E6E73] border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF]">Cancelar</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Record Form Modal ──────────────────────────────────────────────────────
function RecordModal({ open, onClose, onSave, studentId }) {
  const blank = { type: "observacao", title: "", date: new Date().toISOString().split("T")[0], score: "", notes: "" };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) setForm(blank); }, [open]);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Informe um título."); return; }
    setSaving(true);
    await onSave({ ...form, student_id: studentId, score: form.score !== "" ? Number(form.score) : null });
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-3xl p-6 z-10 shadow-xl"
        style={{ background: "#FFFFFF", border: "1px solid #DDD9D3" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-[#1F1F1F]">Novo Registro</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F1EF]"><X className="w-4 h-4 text-[#A0A0A6]" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Tipo</label>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(RECORD_TYPES).map(([k, v]) => (
                <button key={k} onClick={() => setForm(f => ({ ...f, type: k }))}
                  className="py-1.5 px-2 rounded-xl text-xs font-medium border transition-all"
                  style={form.type === k
                    ? { background: v.color + "15", borderColor: v.color + "50", color: v.color }
                    : { background: "#FAFAF8", borderColor: "#DDD9D3", color: "#6E6E73" }}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Título *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Prova de Álgebra"
              className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Data</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Nota (0–10)</label>
              <input type="number" min="0" max="10" step="0.1" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} placeholder="Opcional"
                className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Anotação</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Detalhes sobre este registro..."
              className="w-full bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 py-2.5 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
            className="flex-1 h-10 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "#4D7CFE" }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Salvar Registro
          </motion.button>
          <button onClick={onClose} className="px-4 h-10 rounded-2xl text-sm text-[#6E6E73] border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF]">Cancelar</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Student Detail ──────────────────────────────────────────────────────────
function StudentDetail({ student, records, onAddRecord, onDeleteRecord, onEditStudent }) {
  const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
  const scored = records.filter(r => r.score !== null && r.score !== undefined).sort((a, b) => new Date(a.date) - new Date(b.date));
  const avg = scored.length ? (scored.reduce((s, r) => s + r.score, 0) / scored.length).toFixed(1) : null;
  const chartData = scored.map(r => ({ date: r.date.slice(5), nota: r.score }));
  const cfg = RECORD_TYPES;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
            style={{ background: student.avatar_color || "#3b82f6" }}>
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1F1F1F]">{student.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {student.class_name && <span className="text-xs text-[#6E6E73] bg-[#F1F1EF] px-2 py-0.5 rounded-full">{student.class_name}</span>}
              {student.subject && <span className="text-xs text-[#6E6E73] bg-[#F1F1EF] px-2 py-0.5 rounded-full">{student.subject}</span>}
              {student.email && <span className="text-xs text-[#A0A0A6]">{student.email}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onEditStudent} className="p-2 rounded-xl border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF] text-[#A0A0A6] hover:text-[#1F1F1F] transition-all">
            <Edit2 className="w-4 h-4" />
          </button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onAddRecord}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
            style={{ background: "#4D7CFE" }}>
            <Plus className="w-4 h-4" /> Novo Registro
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Registros", value: records.length, color: "#4D7CFE", icon: FileText },
          { label: "Média", value: avg ? `${avg}` : "—", color: avg >= 7 ? "#059669" : avg >= 5 ? "#f59e0b" : avg ? "#ef4444" : "#A0A0A6", icon: TrendingUp },
          { label: "Última nota", value: scored.length ? scored[scored.length - 1].score : "—", color: "#a78bfa", icon: BarChart2 },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-[#DDD9D3] p-4 flex flex-col gap-2 bg-white shadow-sm">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.color + "15" }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold text-[#1F1F1F]">{s.value}</p>
            <p className="text-xs text-[#A0A0A6]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="rounded-2xl border border-[#DDD9D3] p-5 bg-white shadow-sm">
          <h3 className="text-sm font-semibold text-[#1F1F1F] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#4D7CFE]" /> Evolução de Notas
          </h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0A0A6" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "#A0A0A6" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #DDD9D3", borderRadius: "12px", fontSize: "12px" }}
                  labelStyle={{ color: "#6E6E73" }} itemStyle={{ color: "#4D7CFE" }} />
                <Line type="monotone" dataKey="nota" stroke="#4D7CFE" strokeWidth={2.5} dot={{ fill: "#4D7CFE", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Observations */}
      {student.notes && (
        <div className="rounded-2xl border border-amber-200 p-4 bg-amber-50">
          <h3 className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Observações Gerais
          </h3>
          <p className="text-sm text-[#1F1F1F] leading-relaxed">{student.notes}</p>
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-2xl border border-[#DDD9D3] overflow-hidden bg-white shadow-sm">
        <div className="px-5 py-3.5 border-b border-[#E8E6E1] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#A0A0A6]" />
          <h3 className="text-sm font-semibold text-[#1F1F1F]">Histórico</h3>
          <span className="ml-auto text-xs text-[#A0A0A6]">{sorted.length} registro(s)</span>
        </div>
        {sorted.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[#A0A0A6] text-sm">Nenhum registro ainda.</p>
            <button onClick={onAddRecord} className="mt-2 text-xs text-[#4D7CFE] hover:underline">+ Adicionar registro</button>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[28px] top-0 bottom-0 w-px bg-[#E8E6E1]" />
            <div className="divide-y divide-[#F0EDE8]">
              {sorted.map((rec, i) => {
                const type = cfg[rec.type] || cfg.observacao;
                const Icon = type.icon;
                return (
                  <motion.div key={rec.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-[#FAFAF8] group transition-colors">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative z-10"
                      style={{ background: type.color + "15", border: `1px solid ${type.color}30` }}>
                      <Icon className="w-4 h-4" style={{ color: type.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#1F1F1F]">{rec.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: type.color + "15", color: type.color }}>{type.label}</span>
                        {rec.score !== null && rec.score !== undefined && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: rec.score >= 7 ? "#05996920" : rec.score >= 5 ? "#f59e0b20" : "#ef444420", color: rec.score >= 7 ? "#059669" : rec.score >= 5 ? "#f59e0b" : "#ef4444" }}>
                            {rec.score}
                          </span>
                        )}
                      </div>
                      {rec.notes && <p className="text-xs text-[#A0A0A6] mt-1">{rec.notes}</p>}
                      <p className="text-xs text-[#C0BDBA] mt-1">{new Date(rec.date + "T00:00:00").toLocaleDateString("pt-BR")}</p>
                    </div>
                    <button onClick={() => onDeleteRecord(rec)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[#C0BDBA] hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function StudentTracking() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentModal, setStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [recordModal, setRecordModal] = useState(false);

  useEffect(() => {
    Promise.all([Student.list(), StudentRecord.list()]).then(([s, r]) => {
      setStudents(s); setRecords(r); setLoading(false);
    });
  }, []);

  const studentRecords = (sid) => records.filter(r => r.student_id === sid);

  const handleSaveStudent = async (form) => {
    if (editingStudent) {
      const updated = await Student.update(editingStudent.id, form);
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? updated : s));
      if (selectedStudent?.id === editingStudent.id) setSelectedStudent(updated);
      toast.success("Aluno atualizado!");
    } else {
      const created = await Student.create(form);
      setStudents(prev => [...prev, created]);
      toast.success("Aluno criado!");
    }
    setEditingStudent(null);
  };

  const handleDeleteStudent = async (student) => {
    await Student.delete(student.id);
    setStudents(prev => prev.filter(s => s.id !== student.id));
    if (selectedStudent?.id === student.id) setSelectedStudent(null);
    toast.success("Aluno removido.");
  };

  const handleSaveRecord = async (form) => {
    const created = await StudentRecord.create(form);
    setRecords(prev => [...prev, created]);
    toast.success("Registro salvo!");
  };

  const handleDeleteRecord = async (rec) => {
    await StudentRecord.delete(rec.id);
    setRecords(prev => prev.filter(r => r.id !== rec.id));
    toast.success("Registro removido.");
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.class_name || "").toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="flex items-center justify-center h-full" style={{ background: "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)" }}>
      <Loader2 className="w-6 h-6 text-[#4D7CFE] animate-spin" />
    </div>
  );

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)" }}>
      <AnimatePresence>
        {studentModal && (
          <StudentModal open onClose={() => { setStudentModal(false); setEditingStudent(null); }}
            onSave={handleSaveStudent} student={editingStudent} />
        )}
        {recordModal && selectedStudent && (
          <RecordModal open onClose={() => setRecordModal(false)}
            onSave={handleSaveRecord} studentId={selectedStudent.id} />
        )}
      </AnimatePresence>

      {/* Sidebar — Student List */}
      <div className="w-72 shrink-0 border-r border-[#DDD9D3] flex flex-col bg-white/60">
        <div className="px-4 py-4 border-b border-[#DDD9D3] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#4D7CFE]" />
              <h1 className="text-sm font-bold text-[#1F1F1F]">Alunos</h1>
              <span className="text-xs text-[#A0A0A6]">({students.length})</span>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setEditingStudent(null); setStudentModal(true); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-medium"
              style={{ background: "#4D7CFE" }}>
              <Plus className="w-3.5 h-3.5" /> Novo
            </motion.button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A0A0A6]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar aluno ou turma..."
              className="w-full h-8 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl pl-8 pr-3 text-xs text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-[#DDD9D3] mx-auto mb-3" />
              <p className="text-xs text-[#A0A0A6]">{search ? "Nenhum resultado." : "Nenhum aluno cadastrado."}</p>
              {!search && (
                <button onClick={() => { setEditingStudent(null); setStudentModal(true); }}
                  className="mt-3 text-xs text-[#4D7CFE] hover:underline">+ Adicionar aluno</button>
              )}
            </div>
          ) : filtered.map(student => {
            const recs = studentRecords(student.id);
            const scored = recs.filter(r => r.score !== null && r.score !== undefined);
            const avg = scored.length ? (scored.reduce((s, r) => s + r.score, 0) / scored.length).toFixed(1) : null;
            const isSelected = selectedStudent?.id === student.id;
            return (
              <div key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group ${isSelected ? "bg-[#F1F5FF] border border-[#4D7CFE]/30" : "hover:bg-white/80 border border-transparent"}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: student.avatar_color || "#3b82f6" }}>
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1F1F1F] truncate">{student.name}</p>
                  <p className="text-xs text-[#A0A0A6] truncate">{[student.class_name, student.subject].filter(Boolean).join(" · ") || "Sem turma"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: avg >= 7 ? "#059669" : avg >= 5 ? "#f59e0b" : avg ? "#ef4444" : "#A0A0A6" }}>{avg || "—"}</p>
                  <p className="text-xs text-[#A0A0A6]">{recs.length} reg.</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main — Student Detail */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {selectedStudent ? (
          <StudentDetail
            student={selectedStudent}
            records={studentRecords(selectedStudent.id)}
            onAddRecord={() => setRecordModal(true)}
            onDeleteRecord={handleDeleteRecord}
            onEditStudent={() => { setEditingStudent(selectedStudent); setStudentModal(true); }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-10">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{ background: "#F1F5FF", border: "1px solid rgba(77,124,254,0.2)" }}>
              <Users className="w-10 h-10 text-[#4D7CFE] opacity-60" />
            </div>
            <h2 className="text-lg font-bold text-[#1F1F1F] mb-2">Acompanhamento de Alunos</h2>
            <p className="text-sm text-[#A0A0A6] max-w-sm">Selecione um aluno na lista ou cadastre um novo para visualizar seu desempenho e evolução.</p>
          </div>
        )}
      </div>
    </div>
  );
}