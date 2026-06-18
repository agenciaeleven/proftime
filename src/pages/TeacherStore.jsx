const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, TrendingUp, Package, FileText, CreditCard, Store, Plus, Loader2 } from "lucide-react";

import StoreOnboarding from "../components/store/StoreOnboarding";
import HubDashboard from "../components/store/HubDashboard";
import HubProducts from "../components/store/HubProducts";
import HubContents from "../components/store/HubContents";
import HubFinancial from "../components/store/HubFinancial";
import HubMyStore from "../components/store/HubMyStore";
import CreateProductModal from "../components/store/CreateProductModal";

const { InfoProduct, ProductSale, StoreProfile } = db.entities;

const TABS = [
  { key: "dashboard", label: "Visão Geral", icon: TrendingUp },
  { key: "store",     label: "Minha Loja",  icon: Store },
  { key: "products",  label: "Produtos",    icon: Package },
  { key: "contents",  label: "Conteúdos",   icon: FileText },
  { key: "financial", label: "Financeiro",  icon: CreditCard },
];

export default function TeacherStore() {
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [p, s, pr] = await Promise.all([
      InfoProduct.list("-created_date"),
      ProductSale.list("-created_date"),
      StoreProfile.list(),
    ]);
    setProducts(p);
    setSales(s);
    const foundProfile = pr[0] || null;
    setProfile(foundProfile);
    if (!foundProfile) setShowOnboarding(true);
    setLoading(false);
  };

  const handleOnboardingComplete = (newProfile) => {
    setProfile(newProfile);
    setShowOnboarding(false);
    setTab("store");
  };

  const handleProductCreated = (product) => {
    setProducts((prev) => [product, ...prev]);
    setCreateOpen(false);
    setTab("products");
  };

  const handleProductUpdate = (updated) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleProductDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleProfileSave = (p) => { setProfile(p); };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)" }}>
        <div className="space-y-3 text-center">
          <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <Loader2 className="w-6 h-6 text-[#4D7CFE] animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <StoreOnboarding onComplete={handleOnboardingComplete} />;
  }

  const totalRevenue = sales.filter(s => s.status === "pago").reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div className="min-h-full flex flex-col" style={{ background: "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)" }}>
      {/* Top Header */}
      <div className="relative overflow-hidden border-b border-[#DDD9D3] bg-white shadow-sm">
        <div className="relative px-6 lg:px-10 pt-6 pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            {profile?.photo_url ? (
              <img src={profile.photo_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-[#DDD9D3]" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#1F1F1F]">{profile?.display_name || "Proftime Hub"}</h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold">● ATIVO</span>
              </div>
              <p className="text-xs text-[#A0A0A6]">
                Você já faturou <span className="text-emerald-600 font-semibold">R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span> com sua loja
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm"
              style={{ background: "#4D7CFE" }}>
              <Plus className="w-4 h-4" /> Criar Produto
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-6 lg:px-10 mt-3 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  active ? "border-[#4D7CFE] text-[#4D7CFE]" : "border-transparent text-[#A0A0A6] hover:text-[#1F1F1F]"
                }`}>
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 lg:px-10 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {tab === "dashboard" && (
              <HubDashboard products={products} sales={sales} profile={profile} onCreateProduct={() => setCreateOpen(true)} onGoToStore={() => setTab("store")} />
            )}
            {tab === "store" && (
              <HubMyStore profile={profile} products={products} onSave={handleProfileSave} />
            )}
            {tab === "products" && (
              <HubProducts products={products} onAdd={() => setCreateOpen(true)} onUpdate={handleProductUpdate} onDelete={handleProductDelete} />
            )}
            {tab === "contents" && (
              <HubContents products={products} />
            )}
            {tab === "financial" && (
              <HubFinancial products={products} sales={sales} onSaleAdded={(s) => setSales(prev => [s, ...prev])} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <CreateProductModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleProductCreated} />
    </div>
  );
}