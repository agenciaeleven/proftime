const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, ChevronLeft, ChevronRight, Paperclip, X, Loader2,
  Save, FileText, Trash2, Plus, Clock, MapPin, Users, BookOpen,
  Coffee, Star, MoreVertical, Edit2
} from "lucide-react";
import { cn } from "@/lib/utils";

import { toast } from "sonner";

const { AgendaNote, AgendaEvent } = db.entities;

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEKDAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

const EVENT_TYPES = {
  aula:     { label: "Aula",       color: "#3b82f6", bg: "#3b82f615", icon: BookOpen },
  reuniao:  { label: "Reunião",    color: "#a78bfa", bg: "#a78bfa15", icon: Users },
  plantao:  { label: "Plantão",    color: "#34d399", bg: "#34d39915", icon: Coffee },
  evento:   { label: "Evento",     color: "#fb923c", bg: "#fb923c15", icon: Star },
  outro:    { label: "Outro",      color: "#94a3b8", bg: "#94a3b815", icon: Calendar },
};

// ── Event Form Modal ──────────────────────────────────────────────────────────
function EventModal({ open, onClose, onSave, onDelete, event, date }) {
  const blank = { title: "", type: "aula", class_name: "", start_time: "", end_time: "", location: "", notes: "" };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(event ? { ...blank, ...event } : blank);
  }, [event, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Informe um título."); return; }
    setSaving(true);
    await onSave({ ...form, date });
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl p-6 z-10 shadow-xl max-h-[90vh] overflow-y-auto"
        style={{ background: "#FFFFFF", border: "1px solid #DDD9D3" }}>

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-[#1F1F1F]">{event ? "Editar Evento" : "Novo Evento"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5"><X className="w-4 h-4 text-[#A0A0A6]" /></button>
        </div>

        <div className="space-y-3">
          {/* Type selector */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(EVENT_TYPES).map(([key, cfg]) => (
                <button key={key} onClick={() => set("type", key)}
                  className={cn("flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium border transition-all",
                    form.type === key
                      ? "border-transparent"
                      : "border-[#DDD9D3] text-[#6E6E73] hover:text-[#1F1F1F] bg-white"
                  )}
                  style={form.type === key ? { background: cfg.bg, borderColor: cfg.color + "50", color: cfg.color } : {}}>
                  <cfg.icon className="w-3 h-3" />{cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Título *</label>
            <input placeholder="Ex: Matemática — Equações, Reunião de pais..." value={form.title} onChange={e => set("title", e.target.value)}
              className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Início</label>
              <input type="time" value={form.start_time} onChange={e => set("start_time", e.target.value)}
                className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Fim</label>
              <input type="time" value={form.end_time} onChange={e => set("end_time", e.target.value)}
                className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Turma</label>
            <input placeholder="Ex: 9º Ano A, 3º EM B..." value={form.class_name} onChange={e => set("class_name", e.target.value)}
              className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Local / Sala</label>
            <input placeholder="Ex: Sala 12, Lab de Informática..." value={form.location} onChange={e => set("location", e.target.value)}
              className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Observações</label>
            <textarea rows={3} placeholder="Anotações extras..." value={form.notes} onChange={e => set("notes", e.target.value)}
              className="w-full bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 py-2.5 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20 resize-none" />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          {event && (
            <button onClick={() => { onDelete(event); onClose(); }}
              className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
            className="flex-1 h-10 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "#4D7CFE" }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {event ? "Atualizar" : "Salvar Evento"}
          </motion.button>
          <button onClick={onClose} className="px-4 h-10 rounded-2xl text-sm text-[#6E6E73] border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF] transition-all">Cancelar</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Agenda() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  // Notes (one per day)
  const [notes, setNotes] = useState({});
  const [noteText, setNoteText] = useState("");
  const [fileUploading, setFileUploading] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [savingNote, setSavingNote] = useState(false);

  // Events (many per day)
  const [events, setEvents] = useState([]); // all events
  const [eventModal, setEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([AgendaNote.list(), AgendaEvent.list()]).then(([noteList, eventList]) => {
      const map = {};
      noteList.forEach(n => { if (n.date) map[n.date] = n; });
      setNotes(map);
      setEvents(eventList);
      setLoading(false);
    });
  }, []);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfWeek = (y, m) => new Date(y, m, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const dateKey = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const openDay = (d) => {
    const key = dateKey(d);
    setSelectedDay({ d, key });
    const existing = notes[key];
    setNoteText(existing?.notes || "");
    setFileData(existing?.file_url ? { url: existing.file_url, name: existing.file_name } : null);
  };

  const dayEvents = (key) => events.filter(e => e.date === key).sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));

  const hasDayData = (d) => {
    const key = dateKey(d);
    return !!notes[key] || events.some(e => e.date === key);
  };

  // Note handlers
  const handleFileUpload = async (file) => {
    if (!file) return;
    setFileUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setFileData({ url: file_url, name: file.name });
    setFileUploading(false);
    toast.success("Arquivo anexado!");
  };

  const handleSaveNote = async () => {
    if (!selectedDay) return;
    setSavingNote(true);
    const existing = notes[selectedDay.key];
    const data = { date: selectedDay.key, notes: noteText, file_url: fileData?.url || "", file_name: fileData?.name || "" };
    const saved = existing ? await AgendaNote.update(existing.id, data) : await AgendaNote.create(data);
    setNotes(prev => ({ ...prev, [selectedDay.key]: saved }));
    setSavingNote(false);
    toast.success("Anotação salva!");
  };

  const handleDeleteNote = async () => {
    if (!selectedDay) return;
    const existing = notes[selectedDay.key];
    if (!existing) return;
    await AgendaNote.delete(existing.id);
    setNotes(prev => { const n = { ...prev }; delete n[selectedDay.key]; return n; });
    setNoteText(""); setFileData(null);
    toast.success("Anotação removida!");
  };

  // Event handlers
  const handleSaveEvent = async (data) => {
    if (editingEvent) {
      const updated = await AgendaEvent.update(editingEvent.id, data);
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? updated : e));
      toast.success("Evento atualizado!");
    } else {
      const created = await AgendaEvent.create(data);
      setEvents(prev => [...prev, created]);
      toast.success("Evento criado!");
    }
    setEditingEvent(null);
  };

  const handleDeleteEvent = async (event) => {
    await AgendaEvent.delete(event.id);
    setEvents(prev => prev.filter(e => e.id !== event.id));
    toast.success("Evento removido!");
  };

  const openNewEvent = () => { setEditingEvent(null); setEventModal(true); };
  const openEditEvent = (ev) => { setEditingEvent(ev); setEventModal(true); };

  return (
    <div className="min-h-full" style={{ background: "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)" }}>
      <AnimatePresence>
        {eventModal && (
          <EventModal
            open
            onClose={() => { setEventModal(false); setEditingEvent(null); }}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
            event={editingEvent}
            date={selectedDay?.key}
          />
        )}
      </AnimatePresence>

      <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-4" style={{ background: "#F1F5FF", border: "1px solid rgba(77,124,254,0.2)" }}>
            <Calendar className="w-3.5 h-3.5 text-[#4D7CFE]" />
            <span className="text-xs text-[#4D7CFE] font-medium">Agenda</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1F1F1F] tracking-tight">Calendário Completo</h1>
          <p className="text-[#6E6E73] text-sm mt-1.5">Gerencie seus eventos, aulas e anotações por dia.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-6" style={{ background: "#FFFFFF", border: "1px solid #DDD9D3", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-[#F1F1EF] transition-all text-[#6E6E73] hover:text-[#1F1F1F]">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                  <h2 className="text-lg font-bold text-[#1F1F1F]">{MONTHS[month]}</h2>
                  <p className="text-xs text-[#A0A0A6]">{year}</p>
                </div>
                <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-[#F1F1EF] transition-all text-[#6E6E73] hover:text-[#1F1F1F]">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-[#A0A0A6] py-2">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
                {Array(daysInMonth).fill(null).map((_, i) => {
                  const d = i + 1;
                  const key = dateKey(d);
                  const isToday = key === todayKey;
                  const isSelected = selectedDay?.key === key;
                  const hasData = hasDayData(d);
                  const evCount = events.filter(e => e.date === key).length;

                  return (
                    <button key={d} onClick={() => openDay(d)}
                      className={cn(
                        "relative h-11 w-full rounded-xl text-sm font-medium transition-all flex flex-col items-center justify-center gap-0.5",
                        isSelected ? "text-white" : "",
                        isToday && !isSelected ? "text-[#4D7CFE] font-bold" : "",
                        !isToday && !isSelected ? "text-[#6E6E73] hover:bg-[#F1F1EF] hover:text-[#1F1F1F]" : ""
                      )}
                      style={isSelected ? { background: "#4D7CFE" } : isToday ? { background: "#EEF3FF" } : {}}>
                      {d}
                      {hasData && !isSelected && (
                        <div className="flex gap-0.5">
                          {evCount > 0 && <span className="w-1 h-1 rounded-full bg-[#4D7CFE]" />}
                          {notes[key] && <span className="w-1 h-1 rounded-full bg-[#A78BFA]" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#E8E6E1]">
                <div className="flex items-center gap-1.5 text-xs text-[#A0A0A6]">
                  <span className="w-2 h-2 rounded-full bg-[#4D7CFE]" /> Eventos
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#A0A0A6]">
                  <span className="w-2 h-2 rounded-full bg-[#A78BFA]" /> Anotação
                </div>
              </div>
            </motion.div>
          </div>

          {/* Day Panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selectedDay ? (
                <motion.div key={selectedDay.key} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                  className="space-y-4">
                  {/* Day header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#4D7CFE" }}>
                        <span className="text-white font-bold">{selectedDay.d}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#1F1F1F]">{String(selectedDay.d).padStart(2,"0")}/{String(month+1).padStart(2,"0")}/{year}</p>
                        <p className="text-xs text-[#A0A0A6]">{MONTHS[month]} {year}</p>
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openNewEvent}
                      className="flex items-center gap-2 px-4 py-2 rounded-2xl text-white text-sm font-medium"
                      style={{ background: "#4D7CFE" }}>
                      <Plus className="w-4 h-4" /> Novo Evento
                    </motion.button>
                  </div>

                  {/* Events list */}
                  <div className="rounded-3xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #DDD9D3", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                    <div className="px-5 py-3.5 border-b border-[#E8E6E1] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#4D7CFE]" />
                      <h3 className="text-sm font-semibold text-[#1F1F1F]">Eventos do Dia</h3>
                      <span className="ml-auto text-xs text-[#A0A0A6]">{dayEvents(selectedDay.key).length} evento(s)</span>
                    </div>

                    {dayEvents(selectedDay.key).length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-[#A0A0A6] text-sm">Nenhum evento neste dia.</p>
                        <button onClick={openNewEvent} className="mt-3 text-xs text-[#4D7CFE] hover:underline flex items-center gap-1 mx-auto">
                          <Plus className="w-3.5 h-3.5" /> Adicionar evento
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#F0EDE8]">
                        {dayEvents(selectedDay.key).map((ev, i) => {
                          const cfg = EVENT_TYPES[ev.type] || EVENT_TYPES.outro;
                          return (
                            <motion.div key={ev.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                              className="flex items-start gap-3 px-5 py-4 hover:bg-[#FAFAF8] group transition-colors">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                style={{ background: cfg.bg }}>
                                <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-semibold text-[#1F1F1F]">{ev.title}</p>
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                  {(ev.start_time || ev.end_time) && (
                                    <span className="text-xs text-[#A0A0A6] flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {ev.start_time}{ev.end_time ? ` — ${ev.end_time}` : ""}
                                    </span>
                                  )}
                                  {ev.class_name && (
                                    <span className="text-xs text-[#A0A0A6] flex items-center gap-1">
                                      <Users className="w-3 h-3" />{ev.class_name}
                                    </span>
                                  )}
                                  {ev.location && (
                                    <span className="text-xs text-[#A0A0A6] flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />{ev.location}
                                    </span>
                                  )}
                                </div>
                                {ev.notes && <p className="text-xs text-[#A0A0A6] mt-1">{ev.notes}</p>}
                              </div>
                              <button onClick={() => openEditEvent(ev)}
                                className="p-1.5 rounded-lg hover:bg-[#F1F1EF] text-[#A0A0A6] hover:text-[#1F1F1F] transition-all opacity-0 group-hover:opacity-100 shrink-0">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Notes section */}
                  <div className="rounded-3xl p-5" style={{ background: "#FFFFFF", border: "1px solid #DDD9D3", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-[#1F1F1F] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#A78BFA]" /> Anotações do Dia
                      </h3>
                      {notes[selectedDay.key] && (
                        <button onClick={handleDeleteNote} className="p-1.5 rounded-lg hover:bg-red-50 text-[#A0A0A6] hover:text-red-400 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <textarea rows={4} value={noteText} onChange={e => setNoteText(e.target.value)}
                        placeholder="Adicione observações livres para este dia..."
                        className="w-full bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 py-2.5 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20 resize-none" />

                      {!fileData ? (
                        <label className="flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-[#DDD9D3] hover:border-[#4D7CFE]/40 cursor-pointer transition-all">
                          <input type="file" className="hidden" onChange={e => handleFileUpload(e.target.files[0])} />
                          {fileUploading ? <Loader2 className="w-4 h-4 text-[#A0A0A6] animate-spin" /> : <Paperclip className="w-4 h-4 text-[#A0A0A6]" />}
                          <span className="text-xs text-[#A0A0A6]">{fileUploading ? "Enviando..." : "Anexar arquivo"}</span>
                        </label>
                      ) : (
                        <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}>
                          <FileText className="w-4 h-4 text-[#A78BFA] shrink-0" />
                          <a href={fileData.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#A78BFA] flex-1 truncate hover:underline">{fileData.name}</a>
                          <button onClick={() => setFileData(null)} className="p-0.5 hover:bg-black/5 rounded"><X className="w-3 h-3 text-[#A0A0A6]" /></button>
                        </div>
                      )}

                      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleSaveNote} disabled={savingNote}
                        className="w-full h-10 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                        style={{ background: "#4D7CFE" }}>
                        {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Salvar Anotação
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-3xl border-2 border-dashed border-[#DDD9D3] p-12 text-center flex flex-col items-center bg-white/60">
                  <Calendar className="w-12 h-12 text-[#DDD9D3] mb-4" />
                  <p className="text-[#6E6E73] text-sm font-medium">Selecione um dia no calendário</p>
                  <p className="text-[#A0A0A6] text-xs mt-1">Adicione eventos, aulas e anotações por dia</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}