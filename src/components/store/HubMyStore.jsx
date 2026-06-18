const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Edit3, Share2, ExternalLink, Save, Upload, Loader2, Star, ShoppingCart, CheckCircle, X, Plus, Trash2 } from "lucide-react";

import { toast } from "sonner";

const { StoreProfile } = db.entities;
const COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#ec4899","#06b6d4","#f97316"];
const TYPE_LABELS = { aula_avulsa:"Aula", curso:"Curso", comunidade:"Comunidade", mentoria:"Mentoria", programa:"Programa", desafio:"Desafio", material:"Material" };

const DEMO_REVIEWS = [
  { name: "Maria Clara", rating: 5, comment: "Aulas incríveis! Aprendi muito e passei no ENEM.", avatar: "MC" },
  { name: "João Pedro", rating: 5, comment: "Material muito bem organizado. Recomendo demais!", avatar: "JP" },
  { name: "Ana Lima", rating: 4, comment: "Excelente didática. Vale muito o investimento.", avatar: "AL" },
];

function StorePreview({ profile, products }) {
  const color = profile?.theme_color || "#3b82f6";
  const activeProducts = products.filter(p => p.status === "ativo");
  const featuredProduct = products.find(p => p.featured) || activeProducts[0];

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08]" style={{ background: "#0f172a", minHeight: "600px" }}>
      {/* Banner */}
      <div className="relative h-36 overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}20, ${color}05)` }}>
        {profile?.banner_url && <img src={profile.banner_url} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent, #0f172a99)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `${color}40` }} />
      </div>

      {/* Profile */}
      <div className="px-5 pb-4 -mt-8 relative">
        <div className="flex items-end justify-between mb-3">
          <div className="w-16 h-16 rounded-2xl border-4 overflow-hidden" style={{ borderColor: "#0f172a", background: color }}>
            {profile?.photo_url
              ? <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">{(profile?.display_name || "P").charAt(0)}</div>}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold"
            style={{ background: color }}>
            <ShoppingCart className="w-3 h-3" /> Ver produtos
          </button>
        </div>
        <h2 className="text-base font-bold text-white">{profile?.display_name || "Professor"}</h2>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{profile?.bio || "Educador apaixonado"}</p>

        {/* Stars */}
        <div className="flex items-center gap-1.5 mt-2">
          {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
          <span className="text-xs text-slate-400">4.9 · 127 avaliações</span>
        </div>
      </div>

      {/* Featured Product */}
      {featuredProduct && (
        <div className="px-5 mb-4">
          <div className="rounded-xl border-2 p-4" style={{ borderColor: `${color}40`, background: `${color}08` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white" style={{ background: color }}>⭐ DESTAQUE</span>
            </div>
            <h3 className="text-sm font-bold text-white">{featuredProduct.name}</h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{featuredProduct.description || "Produto em destaque"}</p>
            <div className="flex items-center justify-between mt-3">
              <p className="text-lg font-bold text-white">R$ {(featuredProduct.price || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <button className="px-3 py-1.5 rounded-xl text-white text-xs font-semibold" style={{ background: color }}>
                Quero agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="px-5 mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Todos os produtos</p>
        <div className="grid grid-cols-2 gap-2">
          {activeProducts.slice(0, 4).map(p => (
            <div key={p.id} className="rounded-xl border border-white/[0.06] p-3" style={{ background: "#0a1628" }}>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium mb-2 inline-block" style={{ background: `${color}20`, color }}>
                {TYPE_LABELS[p.type] || p.type}
              </span>
              <p className="text-xs font-semibold text-white line-clamp-2 mb-2">{p.name}</p>
              <p className="text-sm font-bold" style={{ color }}>R$ {(p.price || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
          ))}
        </div>
        {activeProducts.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/[0.08] p-5 text-center">
            <p className="text-xs text-slate-600">Nenhum produto ativo ainda</p>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="px-5 pb-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Depoimentos</p>
        <div className="space-y-2">
          {DEMO_REVIEWS.slice(0, 2).map(r => (
            <div key={r.name} className="rounded-xl border border-white/[0.06] p-3" style={{ background: "#0a1628" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: color }}>
                  {r.avatar}
                </div>
                <span className="text-xs font-semibold text-white">{r.name}</span>
                <div className="flex ml-auto">{[...Array(r.rating)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}</div>
              </div>
              <p className="text-[11px] text-slate-400">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EditStorePanel({ profile, products, onSave }) {
  const [form, setForm] = useState({
    display_name: profile?.display_name || "",
    bio: profile?.bio || "",
    theme_color: profile?.theme_color || "#3b82f6",
    photo_url: profile?.photo_url || "",
    banner_url: profile?.banner_url || "",
    featured_product_id: profile?.featured_product_id || "",
    slug: profile?.slug || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleUpload = async (key, file) => {
    if (!file) return;
    setUploading(u => ({ ...u, [key]: true }));
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    set(key, file_url);
    setUploading(u => ({ ...u, [key]: false }));
  };

  const handleSave = async () => {
    setSaving(true);
    let updated;
    if (profile?.id) {
      updated = await StoreProfile.update(profile.id, form);
    } else {
      updated = await StoreProfile.create(form);
    }
    onSave(updated);
    toast.success("Loja atualizada!");
    setSaving(false);
  };

  const activeProducts = products.filter(p => p.status === "ativo");

  return (
    <div className="space-y-5">
      {/* Photo + Banner */}
      <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: "#0f172a" }}>
        <h3 className="text-sm font-semibold text-white mb-4">Imagens</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
              {form.photo_url ? <img src={form.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-xl">👤</span>}
            </div>
            <label className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-white/[0.1] hover:border-blue-500/40 cursor-pointer transition-all">
              <input type="file" className="hidden" accept="image/*" onChange={e => handleUpload("photo_url", e.target.files[0])} />
              {uploading.photo_url ? <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-slate-600" />}
              <span className="text-xs text-slate-400">Foto de perfil</span>
            </label>
          </div>
          <label className="block cursor-pointer">
            <input type="file" className="hidden" accept="image/*" onChange={e => handleUpload("banner_url", e.target.files[0])} />
            {form.banner_url ? (
              <div className="h-20 rounded-xl overflow-hidden border border-white/10 relative group">
                <img src={form.banner_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-xl">
                  <span className="text-white text-xs font-medium">Trocar banner</span>
                </div>
              </div>
            ) : (
              <div className="h-20 rounded-xl border border-dashed border-white/[0.1] hover:border-blue-500/40 flex items-center justify-center gap-2 transition-all">
                {uploading.banner_url ? <Loader2 className="w-4 h-4 text-blue-400 animate-spin" /> : <Upload className="w-4 h-4 text-slate-600" />}
                <span className="text-xs text-slate-400">Banner da loja</span>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: "#0f172a" }}>
        <h3 className="text-sm font-semibold text-white mb-4">Informações</h3>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Nome</label>
            <input value={form.display_name} onChange={e => set("display_name", e.target.value)}
              className="w-full h-9 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Bio</label>
            <textarea rows={3} value={form.bio} onChange={e => set("bio", e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none resize-none" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Produto em Destaque</label>
            <select value={form.featured_product_id} onChange={e => set("featured_product_id", e.target.value)}
              className="w-full h-9 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-200 focus:outline-none">
              <option value="">Nenhum</option>
              {activeProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Color */}
      <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: "#0f172a" }}>
        <h3 className="text-sm font-semibold text-white mb-3">Cor principal</h3>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} onClick={() => set("theme_color", c)}
              className="w-8 h-8 rounded-full transition-all"
              style={{ background: c, outline: form.theme_color === c ? "3px solid white" : "none", outlineOffset: "2px" }} />
          ))}
        </div>
      </div>

      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
        onClick={handleSave} disabled={saving}
        className="w-full h-10 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Salvar alterações
      </motion.button>
    </div>
  );
}

export default function HubMyStore({ profile, products, onSave }) {
  const [editMode, setEditMode] = useState(false);
  const shareLink = `${window.location.origin}/store-preview#${profile?.slug || "minha-loja"}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copiado!");
  };

  return (
    <div className="max-w-5xl">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white">Minha Loja</h2>
          <p className="text-xs text-slate-500">Preview de como seus alunos verão sua loja</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-white/[0.08] bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] transition-all">
            <Share2 className="w-3.5 h-3.5" /> Compartilhar
          </button>
          <button onClick={() => setEditMode(e => !e)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all"
            style={{ background: editMode ? "#1e293b" : "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
            {editMode ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            {editMode ? "Ver preview" : "Editar loja"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Preview */}
        <div>
          <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
            <Eye className="w-3 h-3" /> Preview (como alunos veem)
          </p>
          <StorePreview profile={profile} products={products} />
        </div>

        {/* Edit Panel */}
        <div>
          {editMode ? (
            <EditStorePanel profile={profile} products={products} onSave={onSave} />
          ) : (
            <div className="rounded-2xl border border-white/[0.06] p-6 text-center h-full flex flex-col items-center justify-center" style={{ background: "#0f172a" }}>
              <Edit3 className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-sm font-semibold text-white mb-1">Personalize sua loja</p>
              <p className="text-xs text-slate-500 mb-5 max-w-xs">Edite banner, foto, bio, cores e produtos em destaque</p>
              <button onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                <Edit3 className="w-4 h-4" /> Editar loja
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}