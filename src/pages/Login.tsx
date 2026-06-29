import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/AuthContext'
import { db, isStaticMode } from '@/api/client'

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
      const returnTo = params.get('return') || '/'
      navigate(returnTo, { replace: true })
      toast.success('Login realizado com sucesso!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha no login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #4D7CFE, transparent)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            srcSet="/logo.png 1x, /logo@2x.png 2x"
            alt="ProfTime"
            className="h-16 w-auto mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">Área do Professor</h1>
          <p className="text-sm text-[#6E6E73] mt-2">
            Acesse com sua conta verificada para continuar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl p-6 sm:p-8 space-y-5 bg-white border border-[#DDD9D3] shadow-xl"
        >
          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A6]" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="professor@escola.com.br"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#DDD9D3] bg-[#FAFAF8] text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/25"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A6]" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-11 rounded-xl border border-[#DDD9D3] bg-[#FAFAF8] text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A6] hover:text-[#6E6E73]"
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
            className="w-full h-12 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: '#4D7CFE' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Entrando…' : 'Entrar'}
          </motion.button>

          {isStaticMode && (
            <p className="text-xs text-center text-[#A0A0A6] leading-relaxed">
              Modo local: use <strong className="text-[#6E6E73]">professor@proftime.com.br</strong> e senha{' '}
              <strong className="text-[#6E6E73]">ProfTime@2026</strong>
            </p>
          )}
        </form>

        <p className="text-center text-xs text-[#A0A0A6] mt-6">
          Acesso restrito a professores cadastrados pela administração.
        </p>
      </motion.div>
    </div>
  )
}
