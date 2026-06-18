import { db } from '@/api/client'
import type { User } from '@/types'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User as UserIcon, Camera, Save, Loader2, Mail, Phone, MapPin, BookOpen, Award, Edit3, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [form, setForm] = useState({ full_name: '', phone: '', city: '', bio: '', subjects: '', experience: '' })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    db.auth.me().then((u) => {
      if (!u) return
      setUser(u)
      setAvatarUrl(String(u.avatar_url || ''))
      setForm({
        full_name: String(u.full_name || ''),
        phone: String(u.phone || ''),
        city: String(u.city || ''),
        bio: String(u.bio || ''),
        subjects: String(u.subjects || ''),
        experience: String(u.experience || ''),
      })
    })
  }, []);

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
    toast.success("Perfil salvo com sucesso!");
  };

  if (!user) return (
    <div className="flex items-center justify-center h-full" style={{ background: "#080f1a" }}>
      <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-full" style={{ background: "#080f1a" }}>
      <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3.5 py-1.5 mb-4">
            <UserIcon className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-blue-300 font-medium">Central do Professor</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Meu Perfil</h1>
          <p className="text-slate-500 text-sm mt-1.5">Gerencie suas informações pessoais e profissionais.</p>
        </motion.div>

        <div className="space-y-5">
          {/* Avatar */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-2xl border border-white/[0.06] p-6 flex items-center gap-6" style={{ background: "#0f172a" }}>
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-10 h-10 text-white/60" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                <input type="file" className="hidden" accept="image/*" onChange={e => handlePhotoUpload(e.target.files[0])} />
                {uploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
              </label>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.full_name || "Professor"}</h2>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5" />{user.email}</p>
              <p className="text-xs text-slate-600 mt-2">Clique na foto para alterar</p>
            </div>
          </motion.div>

          {/* Personal info */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/[0.06] p-6 space-y-4" style={{ background: "#0f172a" }}>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-blue-400" /> Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'full_name', label: 'Nome Completo', placeholder: 'Seu nome completo', icon: UserIcon },
                { key: "phone", label: "Telefone / WhatsApp", placeholder: "(00) 00000-0000", icon: Phone },
                { key: "city", label: "Cidade / Estado", placeholder: "São Paulo, SP", icon: MapPin },
                { key: "experience", label: "Anos de Experiência", placeholder: "Ex: 10 anos", icon: Award },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">{f.label}</label>
                  <div className="relative">
                    <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                    <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40" />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Disciplinas que leciona</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                <input value={form.subjects} onChange={e => setForm(p => ({ ...p, subjects: e.target.value }))}
                  placeholder="Ex: Matemática, Física, Cálculo..."
                  className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Bio / Apresentação</label>
              <textarea rows={4} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="Conte um pouco sobre você, sua trajetória e metodologia de ensino..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40 resize-none" />
            </div>
          </motion.div>

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
            className="w-full h-12 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)", boxShadow: "0 0 24px #3b82f625" }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Perfil
          </motion.button>
        </div>
      </div>
    </div>
  );
}