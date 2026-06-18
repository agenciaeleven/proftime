import { db } from '@/api/client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Upload, Trash2, Video, FileText, Music, PenLine, X } from "lucide-react";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

const { ProductContent } = db.entities;

const TYPE_CONFIG = {
  video: { icon: Video, color: "#60a5fa", label: "Vídeo" },
  pdf: { icon: FileText, color: "#f472b6", label: "PDF" },
  audio: { icon: Music, color: "#34d399", label: "Áudio" },
  exercicio: { icon: PenLine, color: "#fb923c", label: "Exercício" },
  texto: { icon: FileText, color: "#a78bfa", label: "Texto" },
};

export default function StoreContents({ products }) {
  const [contents, setContents] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", type: "video", module: "", description: "", free_preview: false });
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);

  useEffect(() => {
    if (selectedProduct) loadContents();
  }, [selectedProduct]);

  const loadContents = async () => {
    setLoading(true);
    const list = await ProductContent.filter({ product_id: selectedProduct });
    setContents(list.sort((a, b) => Number(a.order || 0) - Number(b.order || 0)))
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!form.title.trim()) { toast.error("Informe um título."); return; }
    setUploading(true);
    let file_url = "";
    let file_name = "";
    if (fileToUpload) {
      const res = await db.integrations.Core.UploadFile({ file: fileToUpload });
      file_url = res.file_url;
      file_name = fileToUpload.name;
    }
    const created = await ProductContent.create({
      ...form,
      product_id: selectedProduct,
      file_url,
      file_name,
      order: contents.length,
    });
    setContents(prev => [...prev, created]);
    setAddOpen(false);
    setForm({ title: "", type: "video", module: "", description: "", free_preview: false });
    setFileToUpload(null);
    setUploading(false);
    toast.success("Conteúdo adicionado!");
  };

  const handleDelete = async (content) => {
    await ProductContent.delete(content.id);
    setContents(prev => prev.filter(c => c.id !== content.id));
    toast.success("Conteúdo removido.");
  };

  const modules = [...new Set(contents.map(c => c.module || "Sem Módulo"))];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Conteúdos</h2>
          <p className="text-sm text-slate-500">Organize os materiais por produto e módulo</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
            className="h-9 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-300 focus:outline-none">
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            {products.length === 0 && <option value="">Nenhum produto</option>}
          </select>
          <button onClick={() => setAddOpen(true)} disabled={!selectedProduct}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin" />
        </div>
      ) : contents.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-white/[0.07] p-14 text-center">
          <Upload className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium mb-1">Nenhum conteúdo ainda</p>
          <p className="text-slate-600 text-xs">Adicione vídeos, PDFs, áudios e exercícios para este produto.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {modules.map(mod => (
            <div key={mod}>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">{mod}</h3>
              <div className="space-y-2">
                {contents.filter(c => (c.module || "Sem Módulo") === mod).map((content, i) => {
                  const cfg = TYPE_CONFIG[content.type] || TYPE_CONFIG.texto;
                  const Icon = cfg.icon;
                  return (
                    <motion.div key={content.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.05] group hover:border-white/[0.1] transition-all"
                      style={{ background: "#0f172a" }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{content.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-600">{cfg.label}</span>
                          {content.file_name && <span className="text-xs text-slate-700 truncate">· {content.file_name}</span>}
                          {content.free_preview && <span className="text-xs bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30">Gratuito</span>}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(content)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Content Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md rounded-2xl border border-white/[0.08] p-6 z-10"
            style={{ background: "#0d1728" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white">Adicionar Conteúdo</h3>
              <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-xl hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Título *</label>
                <input autoFocus value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Aula 1 - Introdução"
                  className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Tipo</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-300 focus:outline-none">
                    {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Módulo</label>
                  <input value={form.module} onChange={e => setForm(f => ({ ...f, module: e.target.value }))}
                    placeholder="Ex: Módulo 1"
                    className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Arquivo (opcional)</label>
                <div className="flex items-center gap-2">
                  <input type="file" id="content-file" className="hidden" onChange={e => setFileToUpload(e.target.files[0])} />
                  <label htmlFor="content-file"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.08] text-xs text-slate-400 hover:text-white hover:border-white/[0.15] cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5" /> {fileToUpload ? fileToUpload.name : "Selecionar arquivo"}
                  </label>
                  {fileToUpload && <button onClick={() => setFileToUpload(null)} className="text-slate-600 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.free_preview} onChange={e => setForm(f => ({ ...f, free_preview: e.target.checked }))}
                  className="w-4 h-4 rounded accent-blue-500" />
                <span className="text-sm text-slate-400">Preview gratuito</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleAdd} disabled={uploading}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                {uploading ? "Enviando..." : "Adicionar"}
              </button>
              <button onClick={() => setAddOpen(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-400 border border-white/[0.07] hover:bg-white/[0.05]">Cancelar</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}