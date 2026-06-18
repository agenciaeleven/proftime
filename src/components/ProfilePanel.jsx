const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Camera, Save, Loader2, Mail, Phone, MapPin, BookOpen, Award, Edit3, X } from "lucide-react";

import { toast } from "sonner";

export default function ProfilePanel({ open, onClose }) {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ full_name: "", phone: "", city: "", bio: "", subjects: "", experience: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    db.auth.me().then(u => {
      setUser(u);
      setAvatarUrl(u.avatar_url || "");
      setForm({
        full_name: u.full_name || "",
        phone: u.phone || "",
        city: u.city || "",
        bio: u.bio || "",
        subjects: u.subjects || "",
        experience: u.experience || "",
      });
    });
  }, [open]);

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setAvatarUrl(file_url);
    await db.auth.updateMe({ avatar_url: file_url });
    setUploading(false);
    toast.success("Foto atualizada!");
  };

  const handleSave = async () => {
    setSaving(true);
    await db.auth.updateMe(form);
    setSaving(false);
    toast.success("Perfil salvo!");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute top-14 right-0 w-80 rounded-2xl border border-white/[0.08] shadow-2xl z-50 overflow-hidden"
            style={{ background: "#0d1728" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <span className="text-sm font-semibold text-white">Meu Perfil</span>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
              {/* Avatar */}
              <div className="flex items-center gap-3">
                <div className="relative group shrink-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/10 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-white/60" />
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <input type="file" className="hidden" accept="image/*" onChange={e => handlePhotoUpload(e.target.files[0])} />
                    {uploading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
                  </label>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user?.full_name || "Professor"}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate"><Mail className="w-3 h-3 shrink-0" />{user?.email}</p>
                  <p className="text-xs text-slate-700 mt-0.5">Clique na foto para alterar</p>
                </div>
              </div>

              {/* Fields */}
              {[
                { key: "full_name", label: "Nome", placeholder: "Seu nome completo", icon: User },
                { key: "phone", label: "Telefone / WhatsApp", placeholder: "(00) 00000-0000", icon: Phone },
                { key: "city", label: "Cidade / Estado", placeholder: "São Paulo, SP", icon: MapPin },
                { key: "experience", label: "Experiência", placeholder: "Ex: 10 anos", icon: Award },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 block">{f.label}</label>
                  <div className="relative">
                    <f.icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
                    <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full h-9 bg-white/[0.04] border border-white/[0.07] rounded-xl pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40" />
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 block">Disciplinas</label>
                <div className="relative">
                  <BookOpen className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
                  <input value={form.subjects} onChange={e => setForm(p => ({ ...p, subjects: e.target.value }))}
                    placeholder="Matemática, Física..."
                    className="w-full h-9 bg-white/[0.04] border border-white/[0.07] rounded-xl pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 block">Bio</label>
                <textarea rows={3} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Sua trajetória e metodologia..."
                  className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40 resize-none" />
              </div>

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
                className="w-full h-9 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)" }}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Salvar
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}