import { db } from '@/api/client';

import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Moon, Sun, Bell, Globe, Palette, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function SettingsPanel({ open, onClose, theme, onToggleTheme }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div initial={{ opacity: 0, x: 20, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 20, scale: 0.96 }}
            className="absolute right-0 top-12 w-72 rounded-2xl border border-border bg-popover shadow-2xl z-50 overflow-hidden"
          >
            <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-foreground text-sm">Configurações</span>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
            </div>
            <div className="p-2">
              <Link to="/profile" onClick={onClose}>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-all cursor-pointer">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-medium">Meu Perfil</p>
                    <p className="text-xs text-muted-foreground">Central do Professor</p>
                  </div>
                </div>
              </Link>

              {[
                { icon: Bell, label: "Notificações", sub: "Gerenciar alertas", color: "#fb923c" },
                { icon: Globe, label: "Idioma", sub: "Português (BR)", color: "#34d399" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-all cursor-pointer">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${item.color}15` }}>
                    <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
              ))}

              <div
                onClick={onToggleTheme}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-chart-3/15">
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-violet-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground font-medium">Aparência</p>
                  <p className="text-xs text-muted-foreground">{theme === "dark" ? "Modo escuro ativo" : "Modo claro ativo"}</p>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors relative ${theme === "light" ? "bg-primary" : "bg-secondary"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${theme === "light" ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
              </div>

              <div className="mt-1 pt-1 border-t border-border">
                <button onClick={() => db.auth.logout()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-all text-left">
                  <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <span className="text-sm text-red-400 font-medium">Sair</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}