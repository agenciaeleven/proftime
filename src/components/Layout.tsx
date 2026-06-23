import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import TermsOfUseModal from "./TermsOfUseModal";
import { useTheme } from "@/hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Presentation, FileCheck, Calendar,
  Bot, FolderKanban, DollarSign, User,
  ChevronLeft, ChevronRight, Search, Bell, Settings, Menu,
  Zap, PenLine, Brain, GraduationCap, Briefcase, ShoppingBag, TrendingUp
} from "lucide-react";
import NotificationsPanel from "./NotificationsPanel";
import ProfilePanel from "./ProfilePanel";
import SettingsPanel from "./SettingsPanel";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navGroups = [
  {
    label: "Produtividade",
    items: [
      { path: "/", icon: LayoutDashboard, label: "Início" },
      { path: "/lesson-creator", icon: BookOpen, label: "Plano de Aula" },
      { path: "/grading", icon: FileCheck, label: "Correção de Prova" },
      { path: "/activities", icon: Zap, label: "Atividades" },
      { path: "/avatar", icon: User, label: "Avatar" },
      { path: "/slides", icon: Presentation, label: "Slides" },
      { path: "/whiteboard", icon: PenLine, label: "Lousa Digital" },
      { path: "/ai-assistant", icon: Bot, label: "IA Assistente" },
    ]
  },
  {
    label: "Organização",
    items: [
      { path: "/agenda", icon: Calendar, label: "Agenda" },
      { path: "/students", icon: GraduationCap, label: "Alunos" },
      { path: "/organization", icon: FolderKanban, label: "Tarefas" },
      { path: "/financial", icon: DollarSign, label: "Financeiro" },
      { path: "/neural-map", icon: Brain, label: "Rede Neural" },
    ]
  },
  {
    label: "Monetização",
    items: [
      { path: "/store", icon: ShoppingBag, label: "Loja do Professor" },
      { path: "/catalog", icon: Briefcase, label: "Escolas" },
      { path: "/commissions", icon: TrendingUp, label: "Comissões" },
    ]
  },
];

const navItems = navGroups.flatMap(g => g.items);

const LOGO_SRC = "/logo.png";
const LOGO_SRC_2X = "/logo@2x.png";

function AppLogo({ collapsed = false, compact = false }: { collapsed?: boolean; compact?: boolean }) {
  return (
    <img
      src={LOGO_SRC}
      srcSet={`${LOGO_SRC} 1x, ${LOGO_SRC_2X} 2x`}
      alt="ProfTime"
      width={157}
      height={76}
      decoding="async"
      className={cn(
        "object-contain select-none",
        collapsed && "h-11 w-11 object-left object-cover",
        !collapsed && compact && "h-10 w-auto max-w-[140px]",
        !collapsed && !compact && "h-14 w-auto max-w-[200px]"
      )}
      style={{ imageRendering: "auto" }}
    />
  );
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(() => !!localStorage.getItem("proftime_terms_accepted"));
  const { theme, toggle: toggleTheme } = useTheme();
  const location = useLocation();

  const handleAcceptTerms = () => {
    localStorage.setItem("proftime_terms_accepted", "true");
    setTermsAccepted(true);
  };

  const currentPage = navItems.find((n) => n.path === location.pathname)?.label || "Dashboard";

  return (
    <TooltipProvider delayDuration={0}>
      <TermsOfUseModal open={!termsAccepted} onAccept={handleAcceptTerms} />
      <div className="flex h-screen overflow-hidden bg-background">

        {/* Mobile overlay */}
        <AnimatePresence>
          {mobileOpen &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 md:hidden" />

          }
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          animate={{ width: collapsed ? 72 : 240 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            "relative flex flex-col border-r border-sidebar-border shrink-0 h-full z-40",
            "hidden md:flex",
            mobileOpen && "flex fixed left-0 top-0 bottom-0"
          )}
          style={{ background: "hsl(var(--sidebar-background))" }}>
          
          {/* Logo */}
          <div className="px-4 flex items-center justify-center min-h-[5.5rem] border-b border-sidebar-border shrink-0">
            {collapsed ? (
              <AppLogo collapsed />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <AppLogo />
              </motion.div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
            {/* Groups */}
            {navGroups.map((group) => (
              <div key={group.label} className="mt-3">
                {!collapsed && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40 px-3 mb-1.5">{group.label}</p>
                )}
                {collapsed && <div className="border-t border-sidebar-border my-2 mx-1" />}
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  const link = (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group",
                        isActive ? "bg-[#4D7CFE]/10 text-sidebar-foreground font-medium" : "text-sidebar-foreground hover:text-foreground hover:bg-black/5"
                      )}>
                      {isActive && <motion.div layoutId="sidebarActive" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-r-full" transition={{ duration: 0.3 }} />}
                      <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-blue-400" : "text-sidebar-foreground group-hover:text-white")} />
                      <AnimatePresence>
                        {!collapsed && <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }} className="text-sm whitespace-nowrap">{item.label}</motion.span>}
                      </AnimatePresence>
                    </Link>
                  );
                  if (collapsed) return <Tooltip key={item.path}><TooltipTrigger asChild>{link}</TooltipTrigger><TooltipContent side="right" sideOffset={8} className="bg-card border-border text-foreground">{item.label}</TooltipContent></Tooltip>;
                  return <div key={item.path}>{link}</div>;
                })}
              </div>
            ))}
          </nav>

          {/* Collapse */}
          <div className="p-3 border-t border-sidebar-border">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center w-full py-2 rounded-xl hover:bg-white/5 transition-colors text-sidebar-foreground hover:text-white">
              
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </motion.aside>

        {/* Right Column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Topbar */}
          <header className="h-16 shrink-0 flex items-center px-6 gap-4 border-b border-border bg-card/40 backdrop-blur-sm relative z-50">
            <button
              className="md:hidden text-muted-foreground hover:text-foreground shrink-0"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="md:hidden shrink-0">
              <AppLogo compact />
            </Link>

            <div className="hidden md:block">
              <h2 className="text-sm font-semibold text-foreground">{currentPage}</h2>
              <p className="text-xs text-muted-foreground capitalize">
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>

            <div className="flex-1 max-w-md mx-auto md:mx-0 md:ml-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar aulas, planos, alunos..."
                  className="w-full h-9 bg-secondary border border-border rounded-xl pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto relative">
              <div className="relative">
                <button onClick={() => { setNotifOpen(o => !o); setSettingsOpen(false); }} className="relative w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-400" />
                </button>
                <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
              </div>
              <div className="relative">
                <button onClick={() => { setSettingsOpen(o => !o); setNotifOpen(false); }} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
                <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} theme={theme} onToggleTheme={toggleTheme} />
              </div>
              <div className="relative flex items-center gap-2.5 ml-1 pl-3 border-l border-border">
                <button onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); setSettingsOpen(false); }} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                  P
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-medium text-foreground">Prof. Ana</p>
                  <p className="text-xs text-muted-foreground">Demo</p>
                </div>
                </button>
                <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }} className="bg-[hsl(var(--background))] h-full">
              
              
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </TooltipProvider>);

}