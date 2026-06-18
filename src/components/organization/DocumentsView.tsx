import { db } from '@/api/client';

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Trash2, Search, Save, Clock, CheckCircle, MoreVertical, Edit3 } from "lucide-react";

import { toast } from "sonner";

const { OrgDocument } = db.entities;

export default function DocumentsView() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDoc, setActiveDoc] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const autoSaveRef = useRef(null);

  useEffect(() => {
    OrgDocument.list("-updated_date").then(list => {
      setDocs(list);
      setLoading(false);
    });
  }, []);

  // Auto-save
  useEffect(() => {
    if (!dirty || !activeDoc) return;
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => handleSave(true), 2000);
    return () => clearTimeout(autoSaveRef.current);
  }, [title, content, dirty]);

  const selectDoc = (doc) => {
    setActiveDoc(doc);
    setTitle(doc.title || "");
    setContent(doc.content || "");
    setDirty(false);
    setMenuOpen(null);
  };

  const handleNew = async () => {
    const created = await OrgDocument.create({ title: "Nova Anotação", content: "", status: "rascunho" });
    setDocs(prev => [created, ...prev]);
    selectDoc(created);
  };

  const handleSave = async (silent = false) => {
    if (!activeDoc) return;
    setSaving(true);
    const updated = await OrgDocument.update(activeDoc.id, { title, content });
    setDocs(prev => prev.map(d => d.id === activeDoc.id ? updated : d));
    setActiveDoc(updated);
    setDirty(false);
    setSaving(false);
    if (!silent) toast.success("Anotação salva!");
  };

  const handleDelete = async (doc) => {
    await OrgDocument.delete(doc.id);
    setDocs(prev => prev.filter(d => d.id !== doc.id));
    if (activeDoc?.id === doc.id) {
      setActiveDoc(null);
      setTitle(""); setContent("");
    }
    setMenuOpen(null);
    toast.success("Anotação excluída.");
  };

  const filtered = docs.filter(d => (d.title || "").toLowerCase().includes(search.toLowerCase()));
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-60 shrink-0 border-r border-[#DDD9D3] flex flex-col bg-white">
        <div className="px-3 py-3 border-b border-[#DDD9D3] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider">Anotações</span>
            <button onClick={handleNew}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[#A0A0A6] hover:text-[#1F1F1F] hover:bg-[#F1F1EF] transition-all">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#A0A0A6]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full h-7 bg-[#FAFAF8] border border-[#DDD9D3] rounded-lg pl-7 pr-2 text-xs text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-4 h-4 border-2 border-[#DDD9D3] border-t-[#4D7CFE] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 px-2">
              <FileText className="w-7 h-7 text-[#DDD9D3] mx-auto mb-2" />
              <p className="text-xs text-[#A0A0A6]">{search ? "Sem resultados." : "Nenhuma anotação."}</p>
              {!search && (
                <button onClick={handleNew} className="mt-2 text-xs text-[#4D7CFE] hover:underline">+ Criar</button>
              )}
            </div>
          ) : filtered.map(doc => (
            <div key={doc.id} onClick={() => selectDoc(doc)}
              className={`relative flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer group transition-all ${
                activeDoc?.id === doc.id ? "bg-[#F1F5FF] border border-[#4D7CFE]/20" : "hover:bg-[#FAFAF8] border border-transparent"
              }`}>
              <FileText className="w-3.5 h-3.5 shrink-0 text-[#A0A0A6]" />
              <span className={`text-sm truncate flex-1 ${activeDoc?.id === doc.id ? "text-[#1F1F1F] font-medium" : "text-[#6E6E73]"}`}>
                {doc.title || "Sem título"}
              </span>
              <div className="relative">
                <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === doc.id ? null : doc.id); }}
                  className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-[#F1F1EF] text-[#A0A0A6] hover:text-[#1F1F1F] transition-all">
                  <MoreVertical className="w-3 h-3" />
                </button>
                {menuOpen === doc.id && (
                  <div className="absolute right-0 top-5 w-28 rounded-xl border border-[#DDD9D3] shadow-xl z-20 overflow-hidden bg-white">
                    <button onClick={e => { e.stopPropagation(); handleDelete(doc); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3 h-3" /> Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeDoc ? (
          <>
            {/* Title bar */}
            <div className="shrink-0 px-8 pt-6 pb-3 flex items-center gap-3 bg-white border-b border-[#DDD9D3]">
              <input value={title} onChange={e => { setTitle(e.target.value); setDirty(true); }}
                placeholder="Título da anotação..."
                className="flex-1 bg-transparent text-xl font-bold text-[#1F1F1F] placeholder:text-[#DDD9D3] focus:outline-none border-b border-[#DDD9D3] pb-2" />
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => handleSave(false)} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold shrink-0 disabled:opacity-50"
                style={{ background: "#4D7CFE" }}>
                <Save className="w-3 h-3" />
                {saving ? "Salvando..." : dirty ? "Salvar*" : "Salvo"}
              </motion.button>
            </div>

            {/* Text area */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 bg-white">
              <textarea
                value={content}
                onChange={e => { setContent(e.target.value); setDirty(true); }}
                placeholder="Escreva suas anotações aqui..."
                className="w-full h-full min-h-[500px] bg-transparent text-[#1F1F1F] placeholder:text-[#DDD9D3] text-sm leading-relaxed focus:outline-none resize-none pt-6"
              />
            </div>

            {/* Footer */}
            <div className="shrink-0 px-8 py-2 border-t border-[#DDD9D3] flex items-center gap-4 bg-white">
              <span className="text-xs text-[#A0A0A6]">{wordCount} palavras · {content.length} caracteres</span>
              {dirty && <span className="text-xs text-amber-500">• Não salvo</span>}
              {!dirty && <span className="text-xs text-emerald-600">• Salvo</span>}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-[#FAFAF8]">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "#F1F5FF", border: "1px solid rgba(77,124,254,0.2)" }}>
              <Edit3 className="w-7 h-7 text-[#4D7CFE] opacity-60" />
            </div>
            <h3 className="text-base font-bold text-[#1F1F1F] mb-1">Anotações</h3>
            <p className="text-xs text-[#A0A0A6] max-w-xs mb-5">Selecione uma anotação ou crie uma nova para começar.</p>
            <button onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
              style={{ background: "#4D7CFE" }}>
              <Plus className="w-4 h-4" /> Nova Anotação
            </button>
          </div>
        )}
      </div>
    </div>
  );
}