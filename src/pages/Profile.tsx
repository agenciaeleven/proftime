import { db } from '@/api/client'
import type { User } from '@/types'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User as UserIcon,
  Camera,
  Save,
  Loader2,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Award,
  Edit3,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/AuthContext'
import { PAGE_BG, TEXT } from '@/lib/pageStyles'

const inputClass =
  'w-full h-11 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl pl-10 pr-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/25'

export default function Profile() {
  const { checkAppState } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    city: '',
    bio: '',
    subjects: '',
    experience: '',
  })
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
  }, [])

  const handlePhotoUpload = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file })
      setAvatarUrl(file_url)
      await db.auth.updateMe({ avatar_url: file_url })
      await checkAppState()
      toast.success('Foto atualizada!')
    } catch {
      toast.error('Não foi possível enviar a foto.')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await db.auth.updateMe(form)
      setUser(updated)
      await checkAppState()
      toast.success('Perfil salvo com sucesso!')
    } catch {
      toast.error('Não foi possível salvar o perfil.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-full" style={{ background: PAGE_BG }}>
        <Loader2 className="w-6 h-6 text-[#A0A0A6] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-full" style={{ background: PAGE_BG }}>
      <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-4"
            style={{ background: '#F1F5FF', border: '1px solid rgba(77,124,254,0.2)' }}
          >
            <UserIcon className="w-3.5 h-3.5 text-[#4D7CFE]" />
            <span className="text-xs text-[#4D7CFE] font-medium">Central do Professor</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: TEXT.heading }}>
            Meu Perfil
          </h1>
          <p className="text-sm mt-1.5" style={{ color: TEXT.body }}>
            Gerencie suas informações pessoais e profissionais.
          </p>
        </motion.div>

        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-[#DDD9D3] p-6 flex items-center gap-6 bg-white shadow-sm"
          >
            <div className="relative group shrink-0">
              <div
                className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#DDD9D3] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #4D7CFE, #a78bfa)' }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-10 h-10 text-white/80" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => void handlePhotoUpload(e.target.files?.[0])}
                />
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </label>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1F1F1F]">{user.full_name || 'Professor'}</h2>
              <p className="text-sm text-[#6E6E73] flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>
              <p className="text-xs text-[#A0A0A6] mt-2">Clique na foto para alterar</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-[#DDD9D3] p-6 space-y-4 bg-white shadow-sm"
          >
            <h3 className="text-sm font-semibold text-[#1F1F1F] flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#4D7CFE]" />
              Informações pessoais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'full_name' as const, label: 'Nome completo', placeholder: 'Seu nome completo', icon: UserIcon },
                { key: 'phone' as const, label: 'Telefone / WhatsApp', placeholder: '(00) 00000-0000', icon: Phone },
                { key: 'city' as const, label: 'Cidade / Estado', placeholder: 'São Paulo, SP', icon: MapPin },
                { key: 'experience' as const, label: 'Anos de experiência', placeholder: 'Ex: 10 anos', icon: Award },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">
                    {f.label}
                  </label>
                  <div className="relative">
                    <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A0A0A6]" />
                    <input
                      value={form[f.key]}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">
                Disciplinas que leciona
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A0A0A6]" />
                <input
                  value={form.subjects}
                  onChange={(e) => setForm((p) => ({ ...p, subjects: e.target.value }))}
                  placeholder="Ex: Matemática, Física, Cálculo..."
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">
                Bio / Apresentação
              </label>
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Conte um pouco sobre você, sua trajetória e metodologia de ensino..."
                className="w-full bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 py-2.5 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/25 resize-none"
              />
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => void handleSave()}
            disabled={saving}
            className="w-full h-12 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: '#4D7CFE' }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar perfil
          </motion.button>
        </div>
      </div>
    </div>
  )
}
