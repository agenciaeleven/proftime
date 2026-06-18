import { db } from '@/api/client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  School, Plus, Search, X, Save, MapPin, Mail, Globe,
  Loader2, Edit2, Trash2, LayoutGrid, List, Send, FileText,
  Briefcase, CheckCircle
} from "lucide-react";

import { toast } from "sonner";

const { School: SchoolEntity, CurriculumApplication } = db.entities;

const SCHOOL_TYPES = {
  publica:      { label: "Pública",       color: "#3b82f6" },
  particular:   { label: "Particular",    color: "#8b5cf6" },
  tecnica:      { label: "Técnica",       color: "#f59e0b" },
  universidade: { label: "Universidade",  color: "#10b981" },
  curso_livre:  { label: "Curso Livre",   color: "#fb923c" },
};

const MODALITY_CONFIG = {
  presencial: { label: "Presencial", color: "#10b981" },
  online:     { label: "Online",     color: "#3b82f6" },
  hibrido:    { label: "Híbrido",    color: "#a78bfa" },
};

const LOGO_COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899","#f97316"];
const SUBJECT_LIST = ["Matemática","Português","Física","Química","Biologia","História","Geografia","Inglês","Filosofia","Sociologia","Artes","Ed. Física","Programação","Música","Redação"];
const LEVEL_LIST = ["Educação Infantil","Fundamental I","Fundamental II","Ensino Médio","Cursinho/ENEM","Graduação","Pós-Graduação","EAD","Curso Livre"];

// ── School Form Modal ──────────────────────────────────────────────────────
function SchoolModal({ open, onClose, onSave, school }) {
  const blank = { name: "", type: "particular", city: "", description: "", subjects_needed: [], levels: [], modality: "presencial", contact_email: "", contact_phone: "", website: "", logo_color: "#3b82f6", hiring: true, notes: "" };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(school ? { ...blank, ...school } : blank); }, [school, open]);

  const toggleArr = (key, val) => setForm(f => ({
    ...f, [key]: (f[key] || []).includes(val) ? (f[key] || []).filter(x => x !== val) : [...(f[key] || []), val]
  }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.city.trim()) { toast.error("Nome e cidade são obrigatórios."); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl rounded-2xl border border-[#DDD9D3] z-10 shadow-xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-[#E8E6E1] bg-white">
          <h2 className="font-semibold text-[#1F1F1F]">{school ? "Editar Escola" : "Cadastrar Escola"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F1EF]"><X className="w-4 h-4 text-[#A0A0A6]" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Nome da Escola *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome completo"
                className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Cidade / Estado *</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Ex: São Paulo, SP"
                className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Tipo de Instituição</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SCHOOL_TYPES).map(([k, v]) => (
                <button key={k} onClick={() => setForm(f => ({ ...f, type: k }))}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
                  style={form.type === k ? { background: v.color + "15", borderColor: v.color + "50", color: v.color } : { background: "#FAFAF8", borderColor: "#DDD9D3", color: "#6E6E73" }}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Descrição</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Sobre a escola, valores, diferenciais..."
              className="w-full bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 py-2.5 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none resize-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Disciplinas Buscadas</label>
            <div className="flex flex-wrap gap-1.5">
              {SUBJECT_LIST.map(s => (
                <button key={s} onClick={() => toggleArr("subjects_needed", s)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                  style={(form.subjects_needed || []).includes(s) ? { background: "#10b98115", borderColor: "#10b98150", color: "#059669" } : { background: "#FAFAF8", borderColor: "#DDD9D3", color: "#6E6E73" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Níveis de Ensino</label>
            <div className="flex flex-wrap gap-1.5">
              {LEVEL_LIST.map(l => (
                <button key={l} onClick={() => toggleArr("levels", l)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                  style={(form.levels || []).includes(l) ? { background: "#a78bfa15", borderColor: "#a78bfa50", color: "#7c3aed" } : { background: "#FAFAF8", borderColor: "#DDD9D3", color: "#6E6E73" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Modalidade</label>
              <div className="flex flex-col gap-1.5">
                {Object.entries(MODALITY_CONFIG).map(([k, v]) => (
                  <button key={k} onClick={() => setForm(f => ({ ...f, modality: k }))}
                    className="px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all"
                    style={form.modality === k ? { background: v.color + "15", borderColor: v.color + "50", color: v.color } : { background: "#FAFAF8", borderColor: "#DDD9D3", color: "#6E6E73" }}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Status</label>
              <button onClick={() => setForm(f => ({ ...f, hiring: !f.hiring }))}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left"
                style={form.hiring ? { background: "#10b98115", borderColor: "#10b98150", color: "#059669" } : { background: "#ef444415", borderColor: "#ef444450", color: "#ef4444" }}>
                {form.hiring ? "✅ Contratando agora" : "⏸ Não contratando"}
              </button>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block mt-4">Cor do Logo</label>
              <div className="flex flex-wrap gap-1.5">
                {LOGO_COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, logo_color: c }))}
                    className="w-6 h-6 rounded-full transition-all"
                    style={{ background: c, outline: form.logo_color === c ? "2px solid #1F1F1F" : "none", outlineOffset: "2px" }} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">E-mail</label>
              <input value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="rh@escola.com"
                className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Telefone</label>
              <input value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} placeholder="(11) 99999-9999"
                className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Site</label>
              <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="www.escola.com.br"
                className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Informações Adicionais</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Benefícios, processo seletivo, requisitos especiais..."
              className="w-full bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 py-2.5 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none resize-none" />
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-3 px-6 py-4 border-t border-[#E8E6E1] bg-white">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
            className="flex-1 h-10 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "#4D7CFE" }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {school ? "Atualizar" : "Cadastrar Escola"}
          </motion.button>
          <button onClick={onClose} className="px-5 h-10 rounded-xl text-sm text-[#6E6E73] border border-[#DDD9D3] hover:bg-[#F1F1EF]">Cancelar</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Apply Modal ────────────────────────────────────────────────────────────
function ApplyModal({ open, onClose, school }) {
  const blank = { teacher_name: "", teacher_email: "", teacher_phone: "", subjects: "", message: "", cv_url: "" };
  const [form, setForm] = useState(blank);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => { if (open) { setForm(blank); setSent(false); } }, [open]);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, cv_url: file_url }));
    setUploading(false);
    toast.success("Currículo anexado!");
  };

  const handleSend = async () => {
    if (!form.teacher_name.trim() || !form.teacher_email.trim()) { toast.error("Nome e e-mail são obrigatórios."); return; }
    setSaving(true);
    await CurriculumApplication.create({ ...form, school_id: school.id, school_name: school.name, status: "enviado" });
    setSaving(false);
    setSent(true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-2xl border border-[#DDD9D3] p-6 z-10 shadow-xl bg-white">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-[#1F1F1F]">Enviar Currículo</h2>
            <p className="text-xs text-[#A0A0A6] mt-0.5">{school.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F1EF]"><X className="w-4 h-4 text-[#A0A0A6]" /></button>
        </div>

        {sent ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-emerald-50 border border-emerald-200">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-2">Currículo Enviado!</h3>
            <p className="text-sm text-[#6E6E73] mb-6">Sua candidatura foi registrada e a escola pode visualizá-la a qualquer momento.</p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-white font-medium" style={{ background: "#4D7CFE" }}>Fechar</button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Seu Nome *</label>
                <input value={form.teacher_name} onChange={e => setForm(f => ({ ...f, teacher_name: e.target.value }))} placeholder="Nome completo"
                  className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">E-mail *</label>
                <input value={form.teacher_email} onChange={e => setForm(f => ({ ...f, teacher_email: e.target.value }))} placeholder="seu@email.com"
                  className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">WhatsApp</label>
                <input value={form.teacher_phone} onChange={e => setForm(f => ({ ...f, teacher_phone: e.target.value }))} placeholder="(11) 99999-9999"
                  className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Disciplinas</label>
                <input value={form.subjects} onChange={e => setForm(f => ({ ...f, subjects: e.target.value }))} placeholder="Ex: Matemática, Física"
                  className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Mensagem de Apresentação</label>
              <textarea rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Apresente-se: experiência, metodologia e por que tem interesse nesta escola..."
                className="w-full bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 py-2.5 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none resize-none" />
            </div>

            {!form.cv_url ? (
              <label className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-dashed border-[#DDD9D3] hover:border-[#4D7CFE]/40 cursor-pointer transition-all">
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={e => handleUpload(e.target.files[0])} />
                {uploading ? <Loader2 className="w-4 h-4 text-[#A0A0A6] animate-spin" /> : <FileText className="w-4 h-4 text-[#A0A0A6]" />}
                <div>
                  <p className="text-xs text-[#1F1F1F] font-medium">{uploading ? "Enviando..." : "Anexar Currículo"}</p>
                  <p className="text-xs text-[#A0A0A6]">PDF, DOC ou DOCX</p>
                </div>
              </label>
            ) : (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs text-emerald-700 flex-1">Currículo anexado ✓</span>
                <button onClick={() => setForm(f => ({ ...f, cv_url: "" }))} className="text-[#A0A0A6] hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleSend} disabled={saving}
                className="flex-1 h-10 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "#4D7CFE" }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Enviar Candidatura
              </motion.button>
              <button onClick={onClose} className="px-4 h-10 rounded-xl text-sm text-[#6E6E73] border border-[#DDD9D3] hover:bg-[#F1F1EF]">Cancelar</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── School Card ─────────────────────────────────────────────────────────────
function SchoolCard({ school, view, onApply, onEdit, onDelete, applicationsCount }) {
  const type = SCHOOL_TYPES[school.type] || SCHOOL_TYPES.particular;
  const mod = MODALITY_CONFIG[school.modality] || MODALITY_CONFIG.presencial;

  if (view === "list") {
    return (
      <motion.div whileHover={{ x: 2 }}
        className="flex items-center gap-4 p-4 rounded-2xl border border-[#DDD9D3] hover:border-[#4D7CFE]/30 transition-all group bg-white shadow-sm">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0"
          style={{ background: school.logo_color || "#3b82f6" }}>
          {school.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[#1F1F1F]">{school.name}</p>
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: type.color + "15", color: type.color }}>{type.label}</span>
            {school.hiring && <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Contratando</span>}
          </div>
          <p className="text-xs text-[#A0A0A6] flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{school.city}</p>
        </div>
        <div className="hidden md:flex items-center gap-1.5 flex-wrap">
          {(school.subjects_needed || []).slice(0, 3).map(s => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5FF] text-[#4D7CFE] border border-[#4D7CFE]/20">{s}</span>
          ))}
          {(school.subjects_needed || []).length > 3 && <span className="text-xs text-[#A0A0A6]">+{school.subjects_needed.length - 3}</span>}
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-[#F1F1EF] text-[#A0A0A6] hover:text-[#1F1F1F] transition-all opacity-0 group-hover:opacity-100"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-[#A0A0A6] hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onApply}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold"
            style={{ background: "#4D7CFE" }}>
            <Send className="w-3 h-3" /> Candidatar
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -3 }} className="rounded-2xl border border-[#DDD9D3] overflow-hidden group transition-all bg-white shadow-sm">
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${school.logo_color || "#3b82f6"}, ${school.logo_color || "#3b82f6"}60)` }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0"
              style={{ background: school.logo_color || "#3b82f6" }}>
              {school.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1F1F1F] leading-tight">{school.name}</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: type.color + "15", color: type.color }}>{type.label}</span>
                {school.hiring
                  ? <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">● Contratando</span>
                  : <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#F1F1EF] text-[#A0A0A6]">Não contratando</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-[#F1F1EF] text-[#A0A0A6] hover:text-[#1F1F1F] transition-all"><Edit2 className="w-3 h-3" /></button>
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-[#A0A0A6] hover:text-red-500 transition-all"><Trash2 className="w-3 h-3" /></button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3 text-xs text-[#A0A0A6] flex-wrap">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{school.city}</span>
          <span style={{ color: mod.color }}>{mod.label}</span>
          {applicationsCount > 0 && <span>{applicationsCount} candidatura{applicationsCount !== 1 ? "s" : ""}</span>}
        </div>

        {school.description && <p className="text-xs text-[#6E6E73] leading-relaxed mb-3 line-clamp-2">{school.description}</p>}

        {(school.subjects_needed || []).length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-[#A0A0A6] mb-1.5">Buscando:</p>
            <div className="flex flex-wrap gap-1">
              {(school.subjects_needed || []).slice(0, 5).map(s => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{s}</span>
              ))}
              {(school.subjects_needed || []).length > 5 && <span className="text-xs text-[#A0A0A6]">+{school.subjects_needed.length - 5}</span>}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 flex gap-2">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onApply}
          disabled={!school.hiring}
          className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{ background: school.hiring ? "#4D7CFE" : "#DDD9D3", color: school.hiring ? "white" : "#A0A0A6" }}>
          <Send className="w-3.5 h-3.5" />
          {school.hiring ? "Enviar Currículo" : "Sem Vagas"}
        </motion.button>
        {school.contact_email && (
          <a href={`mailto:${school.contact_email}`}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-[#DDD9D3] text-[#A0A0A6] hover:text-[#1F1F1F] hover:bg-[#F1F1EF] transition-all">
            <Mail className="w-3.5 h-3.5" />
          </a>
        )}
        {school.website && (
          <a href={school.website.startsWith("http") ? school.website : `https://${school.website}`} target="_blank" rel="noopener noreferrer"
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-[#DDD9D3] text-[#A0A0A6] hover:text-[#1F1F1F] hover:bg-[#F1F1EF] transition-all">
            <Globe className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function TeacherCatalog() {
  const [schools, setSchools] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterHiring, setFilterHiring] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [view, setView] = useState("grid");
  const [schoolModal, setSchoolModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [applySchool, setApplySchool] = useState(null);
  const [tab, setTab] = useState("catalog");

  useEffect(() => {
    Promise.all([SchoolEntity.list("-created_date"), CurriculumApplication.list("-created_date")]).then(([s, a]) => {
      setSchools(s); setApplications(a); setLoading(false);
    });
  }, []);

  const handleSaveSchool = async (form) => {
    if (editingSchool) {
      const updated = await SchoolEntity.update(editingSchool.id, form);
      setSchools(prev => prev.map(s => s.id === editingSchool.id ? updated : s));
      toast.success("Escola atualizada!");
    } else {
      const created = await SchoolEntity.create(form);
      setSchools(prev => [created, ...prev]);
      toast.success("Escola cadastrada!");
    }
    setEditingSchool(null);
  };

  const handleDeleteSchool = async (school) => {
    await SchoolEntity.delete(school.id);
    setSchools(prev => prev.filter(s => s.id !== school.id));
    toast.success("Escola removida.");
  };

  const filtered = schools.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.city || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.subjects_needed || []).some(sub => sub.toLowerCase().includes(search.toLowerCase()));
    const matchHiring = filterHiring === "all" || (filterHiring === "hiring" ? s.hiring : !s.hiring);
    const matchType = filterType === "all" || s.type === filterType;
    return matchSearch && matchHiring && matchType;
  });

  const hiringCount = schools.filter(s => s.hiring).length;

  return (
    <div className="min-h-full" style={{ background: "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)" }}>
      <AnimatePresence>
        {schoolModal && (
          <SchoolModal open onClose={() => { setSchoolModal(false); setEditingSchool(null); }}
            onSave={handleSaveSchool} school={editingSchool} />
        )}
        {applySchool && (
          <ApplyModal open onClose={() => setApplySchool(null)} school={applySchool} />
        )}
      </AnimatePresence>

      <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-4" style={{ background: "#F1F5FF", border: "1px solid rgba(77,124,254,0.2)" }}>
            <Briefcase className="w-3.5 h-3.5 text-[#4D7CFE]" />
            <span className="text-xs text-[#4D7CFE] font-medium">Catálogo de Escolas</span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-[#1F1F1F] tracking-tight">Escolas Cadastradas</h1>
              <p className="text-[#6E6E73] text-sm mt-1.5">
                {schools.length} escola{schools.length !== 1 ? "s" : ""} · <span className="text-emerald-600 font-medium">{hiringCount} contratando agora</span>
              </p>
            </div>
            <button onClick={() => { setEditingSchool(null); setSchoolModal(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm"
              style={{ background: "#4D7CFE" }}>
              <Plus className="w-4 h-4" /> Cadastrar Escola
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl border border-[#DDD9D3] bg-white/60 w-fit">
          <button onClick={() => setTab("catalog")} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === "catalog" ? "bg-white shadow-sm text-[#1F1F1F]" : "text-[#A0A0A6] hover:text-[#1F1F1F]"}`}>
            🏫 Escolas ({schools.length})
          </button>
          <button onClick={() => setTab("applications")} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === "applications" ? "bg-white shadow-sm text-[#1F1F1F]" : "text-[#A0A0A6] hover:text-[#1F1F1F]"}`}>
            📨 Candidaturas ({applications.length})
          </button>
        </div>

        {tab === "catalog" ? (
          <>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A6]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar escola, cidade ou disciplina..."
                  className="w-full h-10 bg-white border border-[#DDD9D3] rounded-xl pl-9 pr-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
              </div>
              <select value={filterHiring} onChange={e => setFilterHiring(e.target.value)}
                className="h-10 bg-white border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] focus:outline-none">
                <option value="all">Todas</option>
                <option value="hiring">Contratando</option>
                <option value="not">Sem vagas</option>
              </select>
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="h-10 bg-white border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] focus:outline-none">
                <option value="all">Todos os tipos</option>
                {Object.entries(SCHOOL_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <div className="flex gap-1 p-1 rounded-xl border border-[#DDD9D3] bg-white">
                <button onClick={() => setView("grid")} className={`p-1.5 rounded-lg transition-all ${view === "grid" ? "bg-[#F1F1EF] text-[#1F1F1F]" : "text-[#A0A0A6] hover:text-[#1F1F1F]"}`}><LayoutGrid className="w-4 h-4" /></button>
                <button onClick={() => setView("list")} className={`p-1.5 rounded-lg transition-all ${view === "list" ? "bg-[#F1F1EF] text-[#1F1F1F]" : "text-[#A0A0A6] hover:text-[#1F1F1F]"}`}><List className="w-4 h-4" /></button>
              </div>
            </motion.div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-[#4D7CFE] animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <School className="w-14 h-14 text-[#DDD9D3] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#1F1F1F] mb-2">{search || filterHiring !== "all" || filterType !== "all" ? "Nenhuma escola encontrada." : "Nenhuma escola cadastrada ainda."}</h3>
                <p className="text-[#A0A0A6] text-sm mb-6">Cadastre a primeira escola no catálogo!</p>
                <button onClick={() => { setEditingSchool(null); setSchoolModal(true); }}
                  className="px-5 py-2.5 rounded-xl text-white font-medium text-sm" style={{ background: "#4D7CFE" }}>
                  <Plus className="w-4 h-4 inline mr-1.5" /> Cadastrar Escola
                </button>
              </div>
            ) : (
              <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
                {filtered.map((school, i) => (
                  <motion.div key={school.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <SchoolCard school={school} view={view}
                      applicationsCount={applications.filter(a => a.school_id === school.id).length}
                      onApply={() => setApplySchool(school)}
                      onEdit={() => { setEditingSchool(school); setSchoolModal(true); }}
                      onDelete={() => handleDeleteSchool(school)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            {applications.length === 0 ? (
              <div className="text-center py-20">
                <Send className="w-12 h-12 text-[#DDD9D3] mx-auto mb-4" />
                <p className="text-[#A0A0A6]">Nenhuma candidatura enviada ainda.</p>
              </div>
            ) : applications.map((app, i) => (
              <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-start gap-4 p-4 rounded-2xl border border-[#DDD9D3] bg-white shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#F1F5FF] border border-[#4D7CFE]/20">
                  <Send className="w-4 h-4 text-[#4D7CFE]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-[#1F1F1F]">{app.teacher_name}</p>
                    <span className="text-xs text-[#A0A0A6]">→</span>
                    <p className="text-sm text-[#6E6E73]">{app.school_name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{app.status}</span>
                  </div>
                  {app.subjects && <p className="text-xs text-[#4D7CFE] mb-1">{app.subjects}</p>}
                  {app.message && <p className="text-xs text-[#A0A0A6] line-clamp-2">{app.message}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    {app.teacher_email && <a href={`mailto:${app.teacher_email}`} className="text-xs text-[#A0A0A6] hover:text-[#4D7CFE] flex items-center gap-1 transition-colors"><Mail className="w-3 h-3" />{app.teacher_email}</a>}
                    {app.cv_url && <a href={app.cv_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#A0A0A6] hover:text-emerald-600 flex items-center gap-1 transition-colors"><FileText className="w-3 h-3" /> Ver Currículo</a>}
                  </div>
                </div>
                <p className="text-xs text-[#A0A0A6] shrink-0">{new Date(app.created_date).toLocaleDateString("pt-BR")}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}