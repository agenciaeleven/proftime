const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Edit2, Trash2, Star, Users, ToggleLeft, ToggleRight, Search, Filter } from "lucide-react";

import { toast } from "sonner";

const { InfoProduct } = db.entities;

const TYPE_LABELS = { aula_avulsa:"Aula Avulsa", curso:"Curso", comunidade:"Comunidade", mentoria:"Mentoria", programa:"Programa", desafio:"Desafio", material:"Material" };
const TYPE_COLORS = { aula_avulsa:"#3b82f6", curso:"#8b5cf6", comunidade:"#10b981", mentoria:"#f59e0b", programa:"#ec4899", desafio:"#ef4444", material:"#06b6d4" };
const STATUS_CONFIG = {
  ativo:    { label:"Ativo",    color:"#10b981", bg:"#10b98120" },
  inativo:  { label:"Inativo",  color:"#64748b", bg:"#64748b20" },
  rascunho: { label:"Rascunho", color:"#f59e0b", bg:"#f59e0b20" },
};

export default function HubProducts({ products, onAdd, onUpdate, onDelete }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === "ativo" ? "inativo" : "ativo";
    const updated = await InfoProduct.update(product.id, { status: newStatus });
    onUpdate(updated);
    toast.success(`Produto ${newStatus === "ativo" ? "ativado" : "desativado"}!`);
  };

  const handleToggleFeatured = async (product) => {
    const updated = await InfoProduct.update(product.id, { featured: !product.featured });
    onUpdate(updated);
    toast.success(product.featured ? "Destaque removido" : "Produto em destaque!");
  };

  const handleDelete = async (product) => {
    await InfoProduct.delete(product.id);
    onDelete(product.id);
    toast.success("Produto excluído.");
  };

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-[#1F1F1F]">Meus Produtos</h2>
          <p className="text-xs text-[#A0A0A6]">{products.length} produto{products.length !== 1 ? "s" : ""} cadastrado{products.length !== 1 ? "s" : ""}</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm"
          style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
          <Plus className="w-4 h-4" /> Criar Produto
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A0A0A6]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..."
            className="w-full h-9 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl pl-8 pr-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
        </div>
        <div className="flex gap-1 p-1 rounded-xl border border-[#DDD9D3] bg-white">
          {[{ key: "all", label: "Todos" }, { key: "ativo", label: "Ativos" }, { key: "rascunho", label: "Rascunho" }, { key: "inativo", label: "Inativos" }].map(f => (
            <button key={f.key} onClick={() => setFilterStatus(f.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterStatus === f.key ? "bg-[#F1F5FF] text-[#4D7CFE]" : "text-[#6E6E73] hover:text-[#1F1F1F]"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-[#DDD9D3] bg-white">
          <Package className="w-12 h-12 text-[#DDD9D3] mx-auto mb-3" />
          <p className="text-base font-semibold text-[#1F1F1F] mb-1">
            {search || filterStatus !== "all" ? "Nenhum produto encontrado." : "Nenhum produto ainda."}
          </p>
          <p className="text-sm text-[#A0A0A6] mb-5">Crie seu primeiro produto e comece a vender!</p>
          {!search && filterStatus === "all" && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm mx-auto"
              style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
              <Plus className="w-4 h-4" /> Criar Produto
            </motion.button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((product, i) => {
              const typeColor = TYPE_COLORS[product.type] || "#3b82f6";
              const statusCfg = STATUS_CONFIG[product.status] || STATUS_CONFIG.rascunho;
              return (
                <motion.div key={product.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                  className="rounded-2xl border border-[#DDD9D3] overflow-hidden group hover:border-[#C8C4BE] transition-all bg-white shadow-sm">
                  {/* Color bar */}
                  <div className="h-1" style={{ background: `linear-gradient(90deg,${typeColor},${typeColor}60)` }} />

                  {/* Cover Image */}
                  {product.cover_url ? (
                    <div className="h-28 overflow-hidden">
                      <img src={product.cover_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-28 flex items-center justify-center" style={{ background: `${typeColor}10` }}>
                      <Package className="w-10 h-10 opacity-30" style={{ color: typeColor }} />
                    </div>
                  )}

                  <div className="p-4">
                    {/* Type + Status */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${typeColor}20`, color: typeColor }}>
                        {TYPE_LABELS[product.type] || product.type}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                        {statusCfg.label}
                      </span>
                    </div>

                   <h3 className="text-sm font-bold text-[#1F1F1F] mb-1 line-clamp-2">{product.name}</h3>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-lg font-bold text-[#1F1F1F]">
                        R$ {(product.price || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        {product.billing === "mensal" && <span className="text-xs text-[#A0A0A6] font-normal">/mês</span>}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-[#A0A0A6]">
                        <Users className="w-3 h-3" />
                        <span>{product.students_count || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-[#E8E6E1]">
                      <button onClick={() => handleToggleFeatured(product)}
                        className={`p-1.5 rounded-lg transition-all ${product.featured ? "text-amber-500 bg-amber-50" : "text-[#A0A0A6] hover:text-amber-500 hover:bg-amber-50"}`}>
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleToggleStatus(product)}
                        className={`p-1.5 rounded-lg transition-all ${product.status === "ativo" ? "text-emerald-600 bg-emerald-50" : "text-[#A0A0A6] hover:text-emerald-600 hover:bg-emerald-50"}`}>
                        {product.status === "ativo" ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                      </button>
                      <div className="flex-1" />
                      <button onClick={() => handleDelete(product)}
                        className="p-1.5 rounded-lg text-[#A0A0A6] hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}