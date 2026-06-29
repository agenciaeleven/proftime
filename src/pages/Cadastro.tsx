import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  BookOpen,
  Award,
  CheckCircle2,
  Shield,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import { createTeacherInternal, hasAdminSecret } from '@/api/admin'
import { isStaticMode } from '@/api/client'
import AuthPageShell, {
  authBtnPrimaryClass,
  authFormClass,
  authInputClass,
  authLabelClass,
} from '@/components/AuthPageShell'

function SectionTitle({ icon: Icon, title }: { icon: typeof User; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 border-t border-border first:border-t-0 first:pt-0">
      <Icon className="w-4 h-4 text-primary" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  )
}

export default function Cadastro() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
    setConfirmPassword('')
    setPhone('')
    setCity('')
    setSubjects('')
    setExperience('')
    setBio('')
    setCreated(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim() || !email.trim() || !password) {
      toast.error('Preencha os campos obrigatórios.')
      return
    }
    if (password.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      const user = await createTeacherInternal({
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
      setConfirmPassword('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha no cadastro')
    } finally {
      setLoading(false)
    }
  }

  if (isStaticMode || !hasAdminSecret()) {
    return (
      <AuthPageShell
        title="Cadastro indisponível"
        subtitle="Configure VITE_API_URL e VITE_ADMIN_SECRET no frontend para habilitar o cadastro."
      >
        <div className="text-center">
          <Link to="/login" className="text-primary text-sm font-medium hover:underline">
            Voltar ao login
          </Link>
        </div>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell
      title="Cadastro de professor"
      subtitle="Área interna para criar contas de professores na plataforma."
      badge={
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 bg-primary/10 border border-primary/20">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-primary font-semibold uppercase tracking-wider">Administração</span>
        </div>
      }
      footer="O professor cadastrado acessa a plataforma em /login com o e-mail e senha definidos aqui."
    >
      {created ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${authFormClass} text-center`}
        >
          <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">Professor cadastrado</h2>
          <p className="text-sm text-muted-foreground mb-1">
            <strong className="text-foreground">{created.full_name}</strong>
          </p>
          <p className="text-sm text-muted-foreground mb-6">{created.email}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border border-border bg-card text-foreground hover:bg-secondary"
            >
              Cadastrar outro
            </button>
            <Link
              to="/login"
              className={`${authBtnPrimaryClass} !w-auto px-5 py-2.5 rounded-xl text-sm`}
            >
              Ir para login
            </Link>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className={authFormClass}>
          <SectionTitle icon={UserPlus} title="Conta de acesso" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={authLabelClass}>Nome completo *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Prof. Ana Oliveira"
                  className={authInputClass}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={authLabelClass}>E-mail *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="professor@escola.com.br"
                  className={authInputClass}
                />
              </div>
            </div>

            <div>
              <label className={authLabelClass}>Senha inicial *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className={`${authInputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className={authLabelClass}>Confirmar senha *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className={authInputClass}
                />
              </div>
            </div>
          </div>

          <SectionTitle icon={BookOpen} title="Perfil do professor" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={authLabelClass}>Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 98765-4321" className={authInputClass} />
              </div>
            </div>

            <div>
              <label className={authLabelClass}>Cidade</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="São Paulo, SP" className={authInputClass} />
              </div>
            </div>

            <div>
              <label className={authLabelClass}>Disciplinas</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="Matemática, Ciências" className={authInputClass} />
              </div>
            </div>

            <div>
              <label className={authLabelClass}>Experiência</label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="12 anos" className={authInputClass} />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={authLabelClass}>Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Breve apresentação do professor..."
                className="w-full rounded-xl border border-input bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className={authBtnPrimaryClass}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Cadastrando…' : 'Cadastrar professor'}
          </motion.button>

          <p className="text-xs text-center text-muted-foreground">
            <Link to="/login" className="text-primary font-medium hover:underline">
              Voltar ao login
            </Link>
          </p>
        </form>
      )}
    </AuthPageShell>
  )
}
