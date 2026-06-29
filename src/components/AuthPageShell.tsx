import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import ThemeToggle from '@/components/ThemeToggle'

interface AuthPageShellProps {
  title: string
  subtitle: string
  badge?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export default function AuthPageShell({
  title,
  subtitle,
  badge,
  children,
  footer,
}: AuthPageShellProps) {
  return (
    <div className="auth-page-bg min-h-screen flex items-center justify-center px-4 py-10 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 bg-primary/30" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-15 bg-chart-3/30" />
      </div>

      <ThemeToggle className="absolute top-4 right-4 z-20" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl z-10"
      >
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            srcSet="/logo.png 1x, /logo@2x.png 2x"
            alt="ProfTime"
            className="h-16 w-auto mx-auto mb-6"
          />
          {badge}
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
        </div>

        {children}

        {footer ? <div className="text-center text-xs text-muted-foreground mt-6">{footer}</div> : null}
      </motion.div>
    </div>
  )
}

export const authFormClass = 'rounded-3xl p-6 sm:p-8 space-y-5 bg-card border border-border shadow-xl'
export const authLabelClass = 'text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block'
export const authInputClass =
  'w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25'
export const authBtnPrimaryClass =
  'w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60'
