const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Link2, Copy, CheckCircle, DollarSign,
  Zap, BarChart2, ShoppingBag, Sparkles,
  BookOpen, Monitor, CreditCard, GraduationCap, ChevronRight,
  Clock, Star, Loader2
} from "lucide-react";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

const { AffiliateProduct, Affiliation } = db.entities;

const CATEGORY_ICONS = {
  "Gestão Escolar": ShoppingBag,
  "Educação": BookOpen,
  "Financeiro": CreditCard,
  "Tecnologia": Monitor,
  "Formação": GraduationCap,
};

const CATEGORY_COLORS = {
  "Gestão Escolar": "#3b82f6",
  "Educação": "#8b5cf6",
  "Financeiro": "#10b981",
  "Tecnologia": "#f59e0b",
  "Formação": "#ec4899",
};

const INITIAL_PRODUCTS = [
  { name: "ERP Escolar Completo", category: "Gestão Escolar", description: "Sistema completo para gestão de alunos, financeiro, matrícula e comunicação escolar.", type: "ERP Escolar", commission_type: "percent", commission_value: 15, active: true, color: "#3b82f6" },
  { name: "Plataforma de Ensino Digital", category: "Educação", description: "Plataforma para aplicação de atividades, provas online e acompanhamento de desempenho.", type: "Plataforma Educacional", commission_type: "percent", commission_value: 20, active: true, color: "#8b5cf6" },
  { name: "Sistema de Cobrança Escolar", category: "Financeiro", description: "Automatize mensalidades, boletos e inadimplência da escola com inteligência.", type: "Financeiro", commission_type: "percent", commission_value: 10, active: true, color: "#10b981" },
  { name: "Lousa Digital Interativa", category: "Tecnologia", description: "Equipamento tecnológico para modernizar salas de aula e engajar alunos.", type: "Tecnologia", commission_type: "variable", commission_value: null, active: true, color: "#f59e0b" },
  { name: "Treinamento para Professores", category: "Formação", description: "Capacitação para melhorar performance pedagógica da equipe escolar.", type: "Formação", commission_type: "percent", commission_value: 25, active: true, color: "#ec4899" },
];

function CommissionBadge({ product }) {
  if (product.commission_type === "variable") {
    return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Variável</span>;
  }
  return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">{product.commission_value}% comissão</span>;
}

function ProductCard({ product, affiliation, onAffiliate, affiliating }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const Icon = CATEGORY_ICONS[product.category] || Zap;
  const color = CATEGORY_COLORS[product.category] || "#3b82f6";
  const isAffiliated = !!affiliation;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#DDD9D3] overflow-hidden flex flex-col bg-white shadow-sm">
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}50)` }} />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h3 className="font-semibold text-[#1F1F1F] text-sm leading-tight">{product.name}</h3>
              <span className="text-xs text-[#A0A0A6]">{product.category}</span>
            </div>
          </div>
          <CommissionBadge product={product} />
        </div>

        <p className="text-xs text-[#6E6E73] leading-relaxed flex-1 mb-4">{product.description}</p>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs px-2 py-0.5 rounded-md text-[#A0A0A6] border border-[#DDD9D3] bg-[#FAFAF8]">{product.type}</span>
        </div>

        <div className="flex gap-2 mt-auto">
          {isAffiliated ? (
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-emerald-700 text-sm font-semibold border border-emerald-200 bg-emerald-50">
              <CheckCircle className="w-4 h-4" /> Afiliado
            </div>
          ) : (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              disabled={affiliating === product.id}
              onClick={() => onAffiliate(product)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-all"
              style={{ background: color }}>
              <Zap className="w-4 h-4" />
              {affiliating === product.id ? "Afiliando..." : "Se afiliar"}
            </motion.button>
          )}
          <button onClick={() => setDetailsOpen(d => !d)}
            className="px-3 py-2.5 rounded-xl text-[#6E6E73] text-sm border border-[#DDD9D3] hover:bg-[#F1F1EF] transition-all">
            {detailsOpen ? "Fechar" : "Detalhes"}
          </button>
        </div>

        <AnimatePresence>
          {detailsOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-3 pt-3 border-t border-[#E8E6E1]">
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Ao se afiliar, você recebe um link único de indicação. Quando uma escola fechar negócio através do seu link, você ganha a comissão automaticamente.
                {product.commission_type === "percent" ? ` A comissão é de ${product.commission_value}% sobre o valor da venda.` : " A comissão é variável de acordo com o contrato fechado."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function AffiliationCard({ affiliation, onCopy }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#DDD9D3] p-5 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="font-semibold text-[#1F1F1F] text-sm">{affiliation.product_name}</h4>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block",
            affiliation.status === "ativo" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
            {affiliation.status}
          </span>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-emerald-600">R$ {(affiliation.commission_earned || 0).toFixed(2)}</p>
          <p className="text-xs text-[#A0A0A6]">comissão gerada</p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl mb-3 bg-[#FAFAF8] border border-[#DDD9D3]">
        <Link2 className="w-3.5 h-3.5 text-[#A0A0A6] shrink-0" />
        <span className="text-xs text-[#A0A0A6] truncate flex-1">{affiliation.affiliate_link}</span>
        <button onClick={() => onCopy(affiliation.affiliate_link)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F1F5FF] text-[#4D7CFE] hover:bg-[#4D7CFE]/10 transition-all shrink-0">
          <Copy className="w-3 h-3" /> Copiar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Cliques", value: affiliation.clicks || 0, color: "#4D7CFE" },
          { label: "Conversões", value: affiliation.conversions || 0, color: "#059669" },
          { label: "Pago", value: `R$ ${(affiliation.commission_paid || 0).toFixed(0)}`, color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} className="text-center p-2 rounded-xl bg-[#FAFAF8] border border-[#DDD9D3]">
            <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-[#A0A0A6] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Commissions() {
  const [products, setProducts] = useState([]);
  const [affiliations, setAffiliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [affiliating, setAffiliating] = useState(null);
  const [activeTab, setActiveTab] = useState("catalog");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    let [prods, affs] = await Promise.all([AffiliateProduct.list(), Affiliation.list()]);
    if (prods.length === 0) {
      await AffiliateProduct.bulkCreate(INITIAL_PRODUCTS);
      prods = await AffiliateProduct.list();
    }
    setProducts(prods);
    setAffiliations(affs);
    setLoading(false);
  };

  const handleAffiliate = async (product) => {
    setAffiliating(product.id);
    const link = `https://proftime.app/ref/${product.id.slice(0, 8)}-${Math.random().toString(36).slice(2, 6)}`;
    const created = await Affiliation.create({ product_id: product.id, product_name: product.name, affiliate_link: link, status: "ativo", clicks: 0, conversions: 0, commission_earned: 0, commission_paid: 0 });
    setAffiliations(a => [...a, created]);
    setAffiliating(null);
    toast.success(`Afiliação criada! Seu link está pronto. 🎉`);
    setActiveTab("affiliations");
  };

  const handleCopy = (link) => { navigator.clipboard.writeText(link); toast.success("Link copiado!"); };

  const totalEarned = affiliations.reduce((s, a) => s + (a.commission_earned || 0), 0);
  const totalPaid = affiliations.reduce((s, a) => s + (a.commission_paid || 0), 0);
  const totalPending = totalEarned - totalPaid;
  const totalConversions = affiliations.reduce((s, a) => s + (a.conversions || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen" style={{ background: "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)" }}>
        <Loader2 className="w-8 h-8 text-[#4D7CFE] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full" style={{ background: "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)" }}>
      <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto space-y-6">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-[#DDD9D3] p-8 lg:p-10 bg-white shadow-sm">
          <div className="absolute top-0 left-1/3 w-96 h-40 rounded-full blur-3xl opacity-[0.06]" style={{ background: "#3b82f6" }} />
          <div className="absolute -bottom-10 right-1/4 w-64 h-40 rounded-full blur-3xl opacity-[0.05]" style={{ background: "#8b5cf6" }} />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-4" style={{ background: "#ECFDF5", border: "1px solid rgba(16,185,129,0.25)" }}>
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs text-emerald-700 font-medium">Programa de Afiliados</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#1F1F1F] tracking-tight mb-3">
                Indique e ganhe <span className="text-emerald-600">comissões</span>
              </h1>
              <p className="text-[#6E6E73] text-sm max-w-lg leading-relaxed">
                Indique soluções para escolas e ganhe comissão por cada venda. Transforme sua experiência como professor em uma nova fonte de renda.
              </p>
              <div className="mt-5 inline-flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                <Star className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-xs text-[#6E6E73]">
                  <span className="text-[#1F1F1F] font-medium">Professores da sua área</span> estão indicando ERP Escolar. Ganhe até{" "}
                  <span className="text-emerald-600 font-bold">15%</span> por venda.
                </p>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setActiveTab("catalog")}
              className="shrink-0 flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-semibold text-sm"
              style={{ background: "#059669" }}>
              <Sparkles className="w-4 h-4" /> Começar a Ganhar Comissão
            </motion.button>
          </div>
        </motion.div>

        {/* Earnings Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Ganho", value: `R$ ${totalEarned.toFixed(2)}`, icon: TrendingUp, color: "#059669" },
            { label: "Vendas Realizadas", value: totalConversions, icon: BarChart2, color: "#4D7CFE" },
            { label: "Pendente", value: `R$ ${totalPending.toFixed(2)}`, icon: Clock, color: "#f59e0b" },
            { label: "Já Pago", value: `R$ ${totalPaid.toFixed(2)}`, icon: CheckCircle, color: "#a78bfa" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-[#DDD9D3] p-5 bg-white shadow-sm">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-xl font-bold text-[#1F1F1F]">{s.value}</p>
              <p className="text-xs text-[#A0A0A6] mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl border border-[#DDD9D3] bg-white/60">
          {[
            { key: "catalog", label: "Catálogo de Produtos", icon: ShoppingBag },
            { key: "affiliations", label: `Minhas Afiliações (${affiliations.length})`, icon: Link2 },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                  activeTab === tab.key ? "bg-white shadow-sm text-[#1F1F1F]" : "text-[#A0A0A6] hover:text-[#1F1F1F]")}>
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Catalog */}
        {activeTab === "catalog" && (
          <motion.div key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product}
                  affiliation={affiliations.find(a => a.product_id === product.id)}
                  onAffiliate={handleAffiliate} affiliating={affiliating} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Affiliations */}
        {activeTab === "affiliations" && (
          <motion.div key="affiliations" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {affiliations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#F1F5FF] border border-[#4D7CFE]/20 flex items-center justify-center mb-4">
                  <Link2 className="w-8 h-8 text-[#4D7CFE]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1F1F1F] mb-2">Nenhuma afiliação ainda</h3>
                <p className="text-[#6E6E73] text-sm max-w-sm mb-6">Acesse o catálogo e se afilie aos produtos para começar a gerar seu link de indicação.</p>
                <button onClick={() => setActiveTab("catalog")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: "#4D7CFE" }}>
                  Ver Catálogo <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {affiliations.map(aff => <AffiliationCard key={aff.id} affiliation={aff} onCopy={handleCopy} />)}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}