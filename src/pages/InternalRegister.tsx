import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  BookOpen,
  Award,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { createTeacherInternal } from '@/api/admin'
import { isStaticMode } from '@/api/client'

const inputClass =
  'w-full h-11 pl-10 pr-4 rounded-xl border border-[#DDD9D3] bg-[#FAFAF8] text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/25'

export default function InternalRegister() {
  const [adminSecret, setAdminSecret] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [subjects, setSubjects] = useState('')
  const [experience, setExperience] = useState('')
  const [bio, setBio] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<{ email: string; full_name: string } | null>(null)

  const resetForm = () => {
    setFullName('')
    setEmail('')
    setPassword('')
    setPhone('')
    setCity('')
    setSubjects('')
    setExperience('')
    setBio('')
    setCreated(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!adminSecret || !fullName.trim() || !email.trim() || !password) {
      toast.error('Preencha os campos obrigatórios.')
      return
    }
    if (password.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    setLoading(true)
    try {
      const user = await createTeacherInternal({
        admin_secret: adminSecret,
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        subjects: subjects.trim() || undefined,
        experience: experience.trim() || undefined,
        bio: bio.trim() || undefined,
      })
      setCreated({ email: user.email, full_name: String(user.full_name || fullName) })
      toast.success('Professor cadastrado com sucesso!')
      setPassword('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha no cadastro')
    } finally {
      setLoading(false)
    }
  }

  if (isStaticMode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)' }}>
        <div className="text-center max-w-md">
          <h1 className="text-xl font-bold text-[#1F1F1F] mb-2">Cadastro interno indisponível</h1>
          <p className="text-sm text-[#6E6E73] mb-6">Configure a API remota para usar o cadastro administrativo.</p>
          <Link to="/login" className="text-[#4D7CFE] text-sm font-medium hover:underline">Voltar ao login</Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen px-4 py-10"
      style={{ background: 'linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)' }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="ProfTime" className="h-14 w-auto mx-auto mb-5" />
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3" style={{ background: '#F1F5FF', border: '1px solid rgba(77,124,254,0.2)' }}>
            <KeyRound className="w-3.5 h-3.5 text-[#4D7CFE]" />
            <span className="text-xs text-[#4D7CFE] font-semibold uppercase tracking-wider">Área interna</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1F1F1F]">Cadastro de professor</h1>
          <p className="text-sm text-[#6E6E73] mt-2">Uso exclusivo da administração. O professor acessa depois pelo login.</p>
        </div>

        {created ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-8 bg-white border border-[#DDD9D3] shadow-xl text-center"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[#1F1F1F] mb-2">Professor cadastrado</h2>
            <p className="text-sm text-[#6E6E73] mb-1"><strong>{created.full_name}</strong></p>
            <p className="text-sm text-[#6E6E73] mb-6">{created.email}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-[#DDD9D3] bg-white text-[#1F1F1F] hover:bg-[#F1F1EF]"
              >
                Cadastrar outro
              </button>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white text-center"
                style={{ background: '#4D7CFE' }}
              >
                Ir para login
              </Link>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-3xl p-6 sm:p-8 space-y-5 bg-white border border-[#DDD9D3] shadow-xl">
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">
                Chave de administrador *
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A6]" />
                <input
                  type="password"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  placeholder="ADMIN_SECRET do servidor"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Nome completo *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A6]" />
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Prof. Ana Oliveira" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">E-mail *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A6]" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="professor@escola.com.br" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Senha inicial *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A6]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full h-11 pl-10 pr-11 rounded-xl border border-[#DDD9D3] bg-[#FAFAF8] text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/25"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A6]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A6]" />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 98765-4321" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Cidade</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A6]" />
                  <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="São Paulo, SP" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Disciplinas</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A6]" />
                  <input value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="Matemática, Ciências" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Experiência</label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A6]" />
                  <input value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="12 anos" className={inputClass} />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Breve apresentação do professor..."
                  className="w-full rounded-xl border border-[#DDD9D3] bg-[#FAFAF8] px-3 py-2.5 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/25 resize-none"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full h-12 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: '#4D7CFE' }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Cadastrando…' : 'Cadastrar professor'}
            </motion.button>

            <p className="text-xs text-center text-[#A0A0A6]">
              <Link to="/login" className="text-[#4D7CFE] font-medium hover:underline">Voltar ao login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
