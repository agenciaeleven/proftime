import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/AuthContext'
import { db, isStaticMode } from '@/api/client'
import AuthPageShell, { authBtnPrimaryClass, authFormClass, authInputClass, authLabelClass } from '@/components/AuthPageShell'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, isLoadingAuth, checkAppState } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      navigate(params.get('return') || '/', { replace: true })
    }
  }, [isAuthenticated, isLoadingAuth, navigate, params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      toast.error('Informe e-mail e senha.')
      return
    }

    setLoading(true)
    try {
      await db.auth.login(email.trim(), password)
      await checkAppState()
      navigate(params.get('return') || '/', { replace: true })
      toast.success('Login realizado com sucesso!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha no login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageShell
      title="Área do Professor"
      subtitle="Acesse com sua conta verificada para continuar."
      footer="Acesso restrito a professores cadastrados pela administração."
    >
      <form onSubmit={handleSubmit} className={`${authFormClass} max-w-md mx-auto`}>
        <div>
          <label className={authLabelClass}>E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="professor@escola.com.br"
              className={authInputClass}
            />
          </div>
        </div>

        <div>
          <label className={authLabelClass}>Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${authInputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
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
          {loading ? 'Entrando…' : 'Entrar'}
        </motion.button>

        {isStaticMode && (
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            Modo local: use <strong className="text-foreground">professor@proftime.com.br</strong> e senha{' '}
            <strong className="text-foreground">ProfTime@2026</strong>
          </p>
        )}

        {!isStaticMode && (
          <p className="text-xs text-center text-muted-foreground">
            Administração:{' '}
            <Link to="/cadastro" className="text-primary font-medium hover:underline">
              Cadastrar professor
            </Link>
          </p>
        )}
      </form>
    </AuthPageShell>
  )
}
