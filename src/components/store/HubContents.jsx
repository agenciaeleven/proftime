const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, FileText, Music, PenLine, AlignLeft, Upload, Plus, Trash2, X, Loader2, Play, File } from "lucide-react";

import { toast } from "sonner";

const { ProductContent } = db.entities;

const CONTENT_TYPES = {
  video:    { label:"Vídeo",    icon: Video,    color:"#3b82f6" },
  pdf:      { label:"PDF",      icon: FileText,  color:"#ef4444" },
  audio:    { label:"Áudio",    icon: Music,     color:"#10b981" },
  exercicio:{ label:"Exercício",icon: PenLine,   color:"#f59e0b" },
  texto:    { label:"Texto",    icon: AlignLeft, color:"#a78bfa" },
};

export default function HubContents({ products }) {
  const [contents, setContents] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title:"", type:"video", module:"Módulo 1", description:"", free_preview:false });

  useEffect(() => {
    ProductContent.list().then(c => { setContents(c); setLoading(false); });
    if (products.length > 0 && !selectedProduct) setSelectedProduct(products[0]);
  }, []);

  const productContents = contents.filter(c => c.product_id === selectedProduct?.id);
  const modules = [...new Set(productContents.map(c => c.module || "Geral"))];

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    const created = await ProductContent.create({ ...form, product_id: selectedProduct.id, file_url, file_name: file.name });
    setContents(prev => [...prev, created]);
    setAddOpen(false);
    setForm({ title:"", type:"video", module:"Módulo 1", description:"", free_preview:false });
    setUploading(false);
    toast.success("Conteúdo adicionado!");
  };

  const handleDelete = async (content) => {
    await ProductContent.delete(content.id);
    setContents(prev => prev.filter(c => c.id !== content.id));
    toast.success("Removido.");
  };

  const handleAddWithoutFile = async () => {
    if (!form.title.trim()) { toast.error("Informe um título."); return; }
    const created = await ProductContent.create({ ...form, product_id: selectedProduct.id });
    setContents(prev => [...prev, created]);
    setAddOpen(false);
    setForm({ title:"", type:"video", module:"Módulo 1", description:"", free_preview:false });
    toast.success("Conteúdo adicionado!");
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white">Conteúdos</h2>
          <p className="text-xs text-slate-500">Organize os materiais dos seus produtos</p>
        </div>
        {selectedProduct && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm"
            style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
            <Plus className="w-4 h-4" /> Adicionar conteúdo
          </motion.button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.07] p-12 text-center" style={{ background: "#0f172a" }}>
          <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-base font-semibold text-white mb-1">Nenhum produto ainda</p>
          <p className="text-sm text-slate-500">Crie um produto primeiro para adicionar conteúdos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Product Selector */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Produtos</p>
            {products.map(p => (
              <button key={p.id} onClick={() => setSelectedProduct(p)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all border ${
                  selectedProduct?.id === p.id
                    ? "border-blue-500/30 bg-blue-500/10 text-white"
                    : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]"
                }`}>
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{contents.filter(c => c.product_id === p.id).length} conteúdo(s)</p>
              </button>
            ))}
          </div>

          {/* Contents */}
          <div className="lg:col-span-3">
            {selectedProduct ? (
              productContents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/[0.07] p-10 text-center" style={{ background: "#0f172a" }}>
                  <Upload className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 mb-4">Nenhum conteúdo em <span className="text-white font-semibold">{selectedProduct.name}</span></p>
                  <button onClick={() => setAddOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold mx-auto"
                    style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                    <Plus className="w-3 h-3" /> Adicionar
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {modules.map(mod => (
                    <div key={mod}>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="w-4 h-px bg-slate-700" /> {mod}
                      </p>
                      <div className="space-y-2">
                        {productContents.filter(c => (c.module || "Geral") === mod).sort((a,b) => (a.order||0)-(b.order||0)).map(c => {
                          const ct = CONTENT_TYPES[c.type] || CONTENT_TYPES.texto;
                          const Icon = ct.icon;
                          return (
                            <motion.div key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.05] hover:border-white/10 group transition-all" style={{ background: "#0f172a" }}>
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ct.color}18` }}>
                                <Icon className="w-4 h-4" style={{ color: ct.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{c.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-semibold" style={{ color: ct.color }}>{ct.label}</span>
                                  {c.file_name && <span className="text-[10px] text-slate-600 truncate">{c.file_name}</span>}
                                  {c.free_preview && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Gratuito</span>}
                                </div>
                              </div>
                              {c.file_url && (
                                <a href={c.file_url} target="_blank" rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all opacity-0 group-hover:opacity-100">
                                  <Play className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button onClick={() => handleDelete(c)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : null}
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {addOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl border border-white/[0.08] p-6 z-10 shadow-2xl" style={{ background: "#0f172a" }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-white">Adicionar Conteúdo</h3>
                <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10"><X className="w-4 h-4 text-slate-500" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Título</label>
                  <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Nome do conteúdo"
                    className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Tipo</label>
                    <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}
                      className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-200 focus:outline-none">
                      {Object.entries(CONTENT_TYPES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Módulo</label>
                    <input value={form.module} onChange={e => setForm(f => ({...f, module: e.target.value}))} placeholder="Ex: Módulo 1"
                      className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.free_preview} onChange={e => setForm(f => ({...f, free_preview: e.target.checked}))}
                    className="w-4 h-4 rounded" />
                  <span className="text-sm text-slate-400">Disponível gratuitamente (preview)</span>
                </label>
                <div className="flex gap-2 pt-2">
                  <label className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-blue-500/40 bg-blue-500/10 text-blue-400 text-sm font-medium cursor-pointer hover:bg-blue-500/15 transition-all">
                    <input type="file" className="hidden" onChange={e => handleUpload(e.target.files[0])} />
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? "Enviando..." : "Enviar arquivo"}
                  </label>
                  <button onClick={handleAddWithoutFile}
                    className="px-4 h-10 rounded-xl text-sm text-slate-300 border border-white/[0.08] hover:bg-white/[0.05] transition-all">
                    Sem arquivo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}