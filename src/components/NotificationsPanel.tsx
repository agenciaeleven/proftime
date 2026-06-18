import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle, Calendar, FileText, AlertCircle } from "lucide-react";
import { useState } from "react";

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: "info", icon: Calendar, text: "Aula de Matemática às 07:30 hoje", time: "Agora", read: false },
  { id: 2, type: "success", icon: CheckCircle, text: "Plano de aula salvo com sucesso", time: "5 min atrás", read: false },
  { id: 3, type: "warning", icon: AlertCircle, text: "Conta de luz vence em 2 dias", time: "1h atrás", read: true },
  { id: 4, type: "info", icon: FileText, text: "Nova anotação adicionada na agenda", time: "3h atrás", read: true },
];

const TYPE_COLORS = {
  info: "#60a5fa",
  success: "#34d399",
  warning: "#fb923c",
  error: "#f87171",
};

export default function NotificationsPanel({ open, onClose }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
  const dismiss = (id) => setNotifications(n => n.filter(x => x.id !== id));

  const unread = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div initial={{ opacity: 0, x: 20, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 20, scale: 0.96 }}
            className="absolute right-0 top-12 w-80 rounded-2xl border border-white/[0.08] shadow-2xl z-50 overflow-hidden"
            style={{ background: "#0f172a" }}>
            <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-white text-sm">Notificações</span>
                {unread > 0 && <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">{unread}</span>}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Ler todas</button>}
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10"><X className="w-3.5 h-3.5 text-slate-500" /></button>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-600 text-sm">Sem notificações.</div>
              ) : (
                notifications.map(n => {
                  const color = TYPE_COLORS[n.type] || "#60a5fa";
                  return (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02] ${!n.read ? "bg-blue-500/5" : ""}`}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}15` }}>
                        <n.icon className="w-3.5 h-3.5" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${!n.read ? "text-slate-200" : "text-slate-400"}`}>{n.text}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{n.time}</p>
                      </div>
                      <button onClick={() => dismiss(n.id)} className="p-0.5 rounded hover:bg-white/10 shrink-0">
                        <X className="w-3 h-3 text-slate-600" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}