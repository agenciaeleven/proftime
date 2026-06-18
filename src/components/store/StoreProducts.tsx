// @ts-nocheck
import { db } from '@/api/client';

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Users, DollarSign, ToggleLeft, ToggleRight, Star } from "lucide-react";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

const { InfoProduct } = db.entities;

const TYPE_LABELS = {
  aula_avulsa: "Aula Avulsa", curso: "Curso", comunidade: "Comunidade",
  mentoria: "Mentoria", programa: "Programa", desafio: "Desafio", material: "Material",
};

const TYPE_COLORS = {
  aula_avulsa: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  curso: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  comunidade: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  mentoria: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  programa: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  desafio: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  material: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export default function StoreProducts({ products, onAdd, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === "ativo" ? "inativo" : "ativo";
    const updated = await InfoProduct.update(product.id, { status: newStatus });
    onUpdate(updated);
    toast.success(`Produto ${newStatus === "ativo" ? "ativado" : "desativado"}!`);
  };

  const handleDelete = async (product) => {
    if (!confirm(`Excluir "${product.name}"? Esta ação não pode ser desfeita.`)) return;
    await InfoProduct.delete(product.id);
    onDelete(product.id);
    toast.success("Produto excluído.");
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditForm({ name: product.name, price: product.price, description: product.description || "" });
  };

  const saveEdit = async () => {
    const updated = await InfoProduct.update(editingId, editForm);
    onUpdate(updated);
    setEditingId(null);
    toast.success("Produto atualizado!");
  };

  const handleToggleFeatured = async (product) => {
    const updated = await InfoProduct.update(product.id, { featured: !product.featured });
    onUpdate(updated);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Meus Produtos</h2>
          <p className="text-sm text-slate-500">{products.length} produto{products.length !== 1 ? "s" : ""} cadastrado{products.length !== 1 ? "s" : ""}</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
          <Plus className="w-4 h-4" /> Novo Produto
        </motion.button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-white/[0.08] p-16 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f620, #8b5cf620)", border: "1px solid #3b82f630" }}>
            <Plus className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Crie seu primeiro produto</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Você está a menos de 2 minutos de começar a vender seu conhecimento.</p>
          <button onClick={onAdd}
            className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
            Criar produto agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-white/[0.06] overflow-hidden group"
              style={{ background: "#0f172a" }}>
              {/* Cover */}
              <div className="h-32 relative flex items-center justify-center"
                style={{ background: product.cover_url ? `url(${product.cover_url}) center/cover` : "linear-gradient(135deg, #1e3a5f, #1a1a3e)" }}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative flex items-center gap-2 flex-col">
                  {!product.cover_url && (
                    <span className="text-3xl font-black text-white/30">{product.name.charAt(0)}</span>
                  )}
                </div>
                {/* Status Badge */}
                <div className={cn("absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold border",
                  product.status === "ativo" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : product.status === "inativo" ? "bg-red-500/20 text-red-400 border-red-500/40"
                    : "bg-slate-500/20 text-slate-400 border-slate-500/40")}>
                  {product.status === "ativo" ? "Ativo" : product.status === "inativo" ? "Inativo" : "Rascunho"}
                </div>
                {product.featured && (
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 flex items-center gap-1">
                    <Star className="w-3 h-3" /> Destaque
                  </div>
                )}
              </div>

              <div className="p-4">
                {editingId === product.id ? (
                  <div className="space-y-2">
                    <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40" />
                    <input type="number" value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600">Salvar</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-xl text-xs text-slate-400 border border-white/10 hover:bg-white/5">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-white text-sm leading-tight">{product.name}</h3>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full border shrink-0", TYPE_COLORS[product.type] || "bg-slate-500/15 text-slate-400 border-slate-500/30")}>
                        {TYPE_LABELS[product.type] || product.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 mb-3">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-400">R$ {(product.price || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        {product.billing === "mensal" && <span className="text-xs text-slate-500">/mês</span>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs text-slate-400">{product.students_count || 0} alunos</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-3 border-t border-white/[0.05]">
                      <button onClick={() => startEdit(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all">
                        <Pencil className="w-3.5 h-3.5" /> Editar
                      </button>
                      <button onClick={() => handleToggleFeatured(product)}
                        className={cn("flex items-center justify-center p-1.5 rounded-lg transition-all", product.featured ? "text-yellow-400 hover:bg-yellow-500/10" : "text-slate-600 hover:text-slate-400 hover:bg-white/5")}>
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleToggleStatus(product)}
                        className="flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05] transition-all">
                        {product.status === "ativo" ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDelete(product)}
                        className="flex items-center justify-center p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}