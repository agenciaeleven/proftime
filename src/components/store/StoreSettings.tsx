import { db } from '@/api/client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Save, ExternalLink, Palette, Star, GripVertical } from "lucide-react";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

const { StoreProfile, InfoProduct } = db.entities;

const THEME_COLORS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#6366f1"
];

import type { InfoProduct, StoreProfile } from '@/types'

interface StoreSettingsProps {
  profile: StoreProfile | null
  onSave: (data: Partial<StoreProfile>) => void | Promise<void>
  products: InfoProduct[]
}

export default function StoreSettings({ profile, onSave, products }: StoreSettingsProps) {
  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    theme_color: '#3b82f6',
    featured_product_id: '',
    slug: '',
    photo_url: '',
    banner_url: '',
  })
  const [photoUploading, setPhotoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        theme_color: profile.theme_color || "#3b82f6",
        featured_product_id: profile.featured_product_id || "",
        slug: profile.slug || "",
        photo_url: profile.photo_url || "",
        banner_url: profile.banner_url || "",
      });
    }
  }, [profile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return;
    setPhotoUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, photo_url: file_url }));
    setPhotoUploading(false);
    toast.success("Foto atualizada!");
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBannerUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, banner_url: file_url }));
    setBannerUploading(false);
    toast.success("Banner atualizado!");
  };

  const handleSave = async () => {
    if (!form.display_name.trim()) { toast.error("Informe seu nome."); return; }
    setSaving(true);
    let saved;
    if (profile) {
      saved = await StoreProfile.update(profile.id, form);
    } else {
      saved = await StoreProfile.create(form);
    }
    setSaving(false);
    onSave(saved);
    toast.success("Loja atualizada!");
  };

  const storeUrl = form.slug ? `#/loja/${form.slug}` : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Minha Loja</h2>
          <p className="text-sm text-slate-500">Personalize como sua loja aparece para os alunos</p>
        </div>
        {storeUrl && (
          <a href={storeUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 transition-all">
            <ExternalLink className="w-4 h-4" /> Ver Loja
          </a>
        )}
      </div>

      {/* Banner */}
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "#0f172a" }}>
        <div className="h-32 relative flex items-end justify-start p-4"
          style={{ background: form.banner_url ? `url(${form.banner_url}) center/cover` : `linear-gradient(135deg, ${form.theme_color}40, ${form.theme_color}15)` }}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative flex items-center gap-3">
            {form.photo_url ? (
              <img src={form.photo_url} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20" />
            ) : (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white border-2 border-white/20"
                style={{ background: form.theme_color }}>
                {form.display_name?.charAt(0) || "P"}
              </div>
            )}
            <div>
              <p className="text-white font-bold">{form.display_name || "Seu nome"}</p>
              <p className="text-white/60 text-xs">{form.bio?.slice(0, 60) || "Sua bio aparecerá aqui..."}</p>
            </div>
          </div>
          <input type="file" id="banner-upload" className="hidden" accept="image/*" onChange={handleBannerUpload} />
          <label htmlFor="banner-upload"
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white cursor-pointer hover:bg-black/60 transition-all">
            <Upload className="w-3 h-3" /> {bannerUploading ? "Enviando..." : "Banner"}
          </label>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-white/[0.06] p-6 space-y-5" style={{ background: "#0f172a" }}>
        {/* Photo */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center border border-white/10"
            style={{ background: form.photo_url ? undefined : form.theme_color }}>
            {form.photo_url ? (
              <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-black text-white">{form.display_name?.charAt(0) || "P"}</span>
            )}
          </div>
          <div>
            <p className="text-sm text-white font-medium mb-1.5">Foto de Perfil</p>
            <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            <label htmlFor="photo-upload"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.08] text-xs text-slate-400 hover:text-white hover:border-white/[0.15] cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5" /> {photoUploading ? "Enviando..." : "Trocar foto"}
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Nome de Exibição *</label>
            <input value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
              placeholder="Seu nome ou marca"
              className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">URL da Loja</label>
            <div className="flex items-center">
              <span className="h-10 px-3 bg-white/[0.02] border border-r-0 border-white/[0.06] rounded-l-xl text-xs text-slate-600 flex items-center">/loja/</span>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                placeholder="meu-nome"
                className="flex-1 h-10 bg-white/[0.04] border border-white/[0.08] rounded-r-xl px-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Bio</label>
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Conte quem você é, sua experiência e o que você ensina..."
            rows={3}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40 resize-none" />
        </div>

        {/* Theme Color */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
            <Palette className="w-3.5 h-3.5" /> Cor do Tema
          </label>
          <div className="flex gap-2 flex-wrap">
            {THEME_COLORS.map(c => (
              <button key={c} onClick={() => setForm(f => ({ ...f, theme_color: c }))}
                className={cn("w-8 h-8 rounded-xl border-2 transition-all", form.theme_color === c ? "scale-110 border-white" : "border-transparent hover:scale-105")}
                style={{ background: c }} />
            ))}
          </div>
        </div>

        {/* Featured Product */}
        {products.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block flex items-center gap-2">
              <Star className="w-3.5 h-3.5" /> Produto em Destaque
            </label>
            <select value={form.featured_product_id} onChange={e => setForm(f => ({ ...f, featured_product_id: e.target.value }))}
              className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-300 focus:outline-none">
              <option value="">Nenhum selecionado</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
        )}
      </div>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
        <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar Loja"}
      </motion.button>
    </div>
  );
}