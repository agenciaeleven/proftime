const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Plus, X, Trash2, Link2, Filter, ZoomIn, ZoomOut, Maximize2, Sparkles, Tag, Edit2, Save, Loader2 } from "lucide-react";

import { toast } from "sonner";

const { NeuralNode } = db.entities;

const NODE_TYPES = {
  aula:      { color: "#3b82f6", glow: "#3b82f640", label: "Aula" },
  tarefa:    { color: "#f59e0b", glow: "#f59e0b40", label: "Tarefa" },
  ideia:     { color: "#a78bfa", glow: "#a78bfa40", label: "Ideia" },
  evento:    { color: "#34d399", glow: "#34d39940", label: "Evento" },
  conteudo:  { color: "#fb923c", glow: "#fb923c40", label: "Conteúdo" },
  outro:     { color: "#94a3b8", glow: "#94a3b840", label: "Outro" },
};

const FILTERS = ["todos", "aula", "tarefa", "ideia", "evento", "conteudo", "outro"];

// Force-directed layout helpers
function randomPos(centerX, centerY, radius = 120) {
  const angle = Math.random() * Math.PI * 2;
  const r = 60 + Math.random() * radius;
  return { x: centerX + Math.cos(angle) * r, y: centerY + Math.sin(angle) * r };
}

function findBestConnection(newNode, allNodes) {
  if (allNodes.length === 0) return null;
  // Score: same type = +3, shared tag = +2, same category = +2
  let best = null, bestScore = -1;
  for (const n of allNodes) {
    if (n.id === newNode.id) continue;
    let score = 0;
    if (n.type === newNode.type) score += 3;
    if (n.category && newNode.category && n.category === newNode.category) score += 2;
    const sharedTags = (n.tags || []).filter(t => (newNode.tags || []).includes(t));
    score += sharedTags.length * 2;
    // Random small bonus for organic feel
    score += Math.random() * 1.5;
    if (score > bestScore) { bestScore = score; best = n; }
  }
  return best;
}

// ── Node Detail Panel ──────────────────────────────────────────────────────
function NodePanel({ node, nodes, onClose, onDelete, onUpdate, onConnect }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ label: node.label, type: node.type, category: node.category || "", tags: (node.tags || []).join(", "), notes: node.notes || "", raw_content: node.raw_content || "" });
  const [saving, setSaving] = useState(false);
  const cfg = NODE_TYPES[node.type] || NODE_TYPES.outro;
  const connected = nodes.filter(n => (node.connections || []).includes(n.id));

  const handleSave = async () => {
    setSaving(true);
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    await onUpdate(node.id, { ...form, tags });
    setSaving(false);
    setEditing(false);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
      className="absolute top-4 right-4 w-96 rounded-2xl border border-[#DDD9D3] shadow-xl z-30 overflow-hidden bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-[#E8E6E1]"
        style={{ borderLeft: `3px solid ${cfg.color}` }}>
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</span>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setEditing(e => !e)} className="p-1.5 rounded-lg hover:bg-[#F1F1EF] text-[#A0A0A6] hover:text-[#1F1F1F] transition-all">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { onDelete(node.id); onClose(); }} className="p-1.5 rounded-lg hover:bg-red-50 text-[#A0A0A6] hover:text-red-500 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F1EF] text-[#A0A0A6] hover:text-[#1F1F1F] transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
        {editing ? (
          <div className="space-y-2.5">
            <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              className="w-full h-9 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full h-9 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] focus:outline-none">
              {Object.entries(NODE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              placeholder="Categoria..." className="w-full h-9 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="Tags (separadas por vírgula)..." className="w-full h-9 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
            <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Notas..." className="w-full bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 py-2 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none resize-none" />
            <div>
              <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1 block">📄 Material Bruto</label>
              <textarea rows={8} value={form.raw_content} onChange={e => setForm(f => ({ ...f, raw_content: e.target.value }))}
                placeholder="Cole aqui textos, resumos, referências, anotações, links, qualquer conteúdo relacionado a este assunto..."
                className="w-full bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 py-2 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none resize-none" />
            </div>
            <button onClick={handleSave} disabled={saving}
              className="w-full h-9 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "#4D7CFE" }}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Salvar
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-base font-bold text-[#1F1F1F] leading-tight">{node.label}</h3>
            {node.category && <p className="text-xs text-[#A0A0A6]">{node.category}</p>}
            {(node.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(node.tags || []).map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[#F1F1EF] text-[#6E6E73] border border-[#DDD9D3]"># {t}</span>
                ))}
              </div>
            )}
            {node.notes && <p className="text-xs text-[#6E6E73] leading-relaxed border-t border-[#E8E6E1] pt-3">{node.notes}</p>}
            {node.raw_content && (
              <div className="border-t border-[#E8E6E1] pt-3">
                <p className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-2">📄 Material Bruto</p>
                <pre className="text-xs text-[#1F1F1F] leading-relaxed whitespace-pre-wrap font-sans max-h-60 overflow-y-auto bg-[#FAFAF8] rounded-xl p-3 border border-[#DDD9D3]">{node.raw_content}</pre>
              </div>
            )}
          </>
        )}

        {/* Connections */}
        {connected.length > 0 && (
          <div className="border-t border-[#E8E6E1] pt-3">
            <p className="text-xs text-[#A0A0A6] mb-2 flex items-center gap-1.5"><Link2 className="w-3 h-3" /> {connected.length} conexão(ões)</p>
            <div className="space-y-1">
              {connected.map(cn => {
                const ccfg = NODE_TYPES[cn.type] || NODE_TYPES.outro;
                return (
                  <div key={cn.id} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: ccfg.color }} />
                    <span className="text-xs text-[#6E6E73] truncate">{cn.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Add Node Modal ─────────────────────────────────────────────────────────
function AddNodeModal({ open, onClose, onAdd, parentNode }) {
  const [form, setForm] = useState({ label: "", type: "ideia", category: "", tags: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.label.trim()) { toast.error("Informe um título."); return; }
    setSaving(true);
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    await onAdd({ ...form, tags }, parentNode);
    setForm({ label: "", type: "ideia", category: "", tags: "", notes: "" });
    setSaving(false);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-sm rounded-2xl border border-[#DDD9D3] p-6 z-10 shadow-xl bg-white">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-500" />
            <h2 className="font-semibold text-[#1F1F1F]">{parentNode ? `Conectar a "${parentNode.label}"` : "Novo Nó"}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F1EF]"><X className="w-4 h-4 text-[#A0A0A6]" /></button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-1.5">
            {Object.entries(NODE_TYPES).map(([k, v]) => (
              <button key={k} onClick={() => setForm(f => ({ ...f, type: k }))}
                className="py-1.5 rounded-xl text-xs font-medium border transition-all"
                style={form.type === k
                  ? { background: v.color + "15", borderColor: v.color + "50", color: v.color }
                  : { background: "#FAFAF8", borderColor: "#DDD9D3", color: "#6E6E73" }}>
                {v.label}
              </button>
            ))}
          </div>
          <input autoFocus value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="Título do nó..." className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
          <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            placeholder="Categoria (opcional)..." className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
          <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            placeholder="Tags: matemática, 9ano, revisão..." className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
          <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Notas..." className="w-full bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 py-2 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none resize-none" />
        </div>

        <div className="flex gap-3 mt-5">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleAdd} disabled={saving}
            className="flex-1 h-10 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Criar Nó
          </motion.button>
          <button onClick={onClose} className="px-4 h-10 rounded-xl text-sm text-[#6E6E73] border border-[#DDD9D3] hover:bg-[#F1F1EF] transition-all">Cancelar</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Canvas Graph ───────────────────────────────────────────────────────────
function GraphCanvas({ nodes, filter, onNodeClick, onNodeDblClick, hoveredNode, setHoveredNode, newNodeId }) {
  const canvasRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isDraggingNode = useRef(null);
  const isDraggingCanvas = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const nodePositions = useRef({});
  const animFrame = useRef(null);
  const birthNodes = useRef(new Set());

  const filtered = filter === "todos" ? nodes : nodes.filter(n => n.type === filter);

  // Birth animation tracking
  useEffect(() => {
    if (newNodeId) birthNodes.current.add(newNodeId);
    setTimeout(() => birthNodes.current.delete(newNodeId), 1200);
  }, [newNodeId]);

  // Sync positions
  useEffect(() => {
    nodes.forEach(n => {
      if (!nodePositions.current[n.id]) {
        nodePositions.current[n.id] = { x: n.x || 400, y: n.y || 300 };
      }
    });
  }, [nodes]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(pan.x + w / 2, pan.y + h / 2);
    ctx.scale(zoom, zoom);

    const visibleNodes = filtered;
    const now = Date.now();

    // Draw edges
    visibleNodes.forEach(node => {
      const pos = nodePositions.current[node.id];
      if (!pos) return;
      (node.connections || []).forEach(cid => {
        const target = visibleNodes.find(n => n.id === cid);
        const tpos = nodePositions.current[cid];
        if (!target || !tpos) return;

        const isHoveredEdge = hoveredNode === node.id || hoveredNode === cid;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        // Curved line
        const mx = (pos.x + tpos.x) / 2 + (Math.random() > 0.5 ? 20 : -20);
        const my = (pos.y + tpos.y) / 2 + (Math.random() > 0.5 ? 20 : -20);
        ctx.quadraticCurveTo(mx, my, tpos.x, tpos.y);
        ctx.strokeStyle = isHoveredEdge ? "rgba(139,92,246,0.6)" : "rgba(100,116,139,0.18)";
        ctx.lineWidth = isHoveredEdge ? 1.5 : 0.8;
        ctx.stroke();
      });
    });

    // Draw nodes
    visibleNodes.forEach(node => {
      const pos = nodePositions.current[node.id];
      if (!pos) return;
      const cfg = NODE_TYPES[node.type] || NODE_TYPES.outro;
      const isHovered = hoveredNode === node.id;
      const isBirth = birthNodes.current.has(node.id);
      const connCount = (node.connections || []).length;
      const r = 6 + Math.min(connCount * 2, 10);
      const scale = isBirth ? (1 + Math.sin((now % 1200) / 1200 * Math.PI) * 0.5) : (isHovered ? 1.4 : 1);

      // Glow
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * scale * 3);
      gradient.addColorStop(0, cfg.color + "60");
      gradient.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r * scale * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r * scale, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? cfg.color : cfg.color + "cc";
      if (isHovered || isBirth) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = cfg.color;
      } else {
        ctx.shadowBlur = 6;
        ctx.shadowColor = cfg.color + "80";
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      if (zoom > 0.5) {
        ctx.font = `${isHovered ? "600 " : ""}${Math.max(10, 11 / zoom)}px Inter, sans-serif`;
        ctx.fillStyle = isHovered ? "#1F1F1F" : "rgba(50,50,60,0.75)";
        ctx.textAlign = "center";
        ctx.fillText(node.label.length > 18 ? node.label.slice(0, 18) + "…" : node.label, pos.x, pos.y + r * scale + 14 / zoom);
      }
    });

    ctx.restore();
    animFrame.current = requestAnimationFrame(draw);
  }, [filtered, hoveredNode, pan, zoom]);

  useEffect(() => {
    animFrame.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrame.current);
  }, [draw]);

  // Resize
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const getNodeAt = (mx, my) => {
    const canvas = canvasRef.current;
    const cx = (mx - canvas.width / 2 - pan.x) / zoom;
    const cy = (my - canvas.height / 2 - pan.y) / zoom;
    return filtered.find(n => {
      const pos = nodePositions.current[n.id];
      if (!pos) return false;
      const r = 6 + Math.min((n.connections || []).length * 2, 10);
      return Math.hypot(pos.x - cx, pos.y - cy) < r * 2.5;
    });
  };

  const onMouseDown = (e) => {
    const node = getNodeAt(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    if (node) { isDraggingNode.current = node; }
    else { isDraggingCanvas.current = true; }
    lastMouse.current = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  const onMouseMove = (e) => {
    const mx = e.nativeEvent.offsetX, my = e.nativeEvent.offsetY;
    if (isDraggingNode.current) {
      const dx = (mx - lastMouse.current.x) / zoom;
      const dy = (my - lastMouse.current.y) / zoom;
      const id = isDraggingNode.current.id;
      nodePositions.current[id] = { x: nodePositions.current[id].x + dx, y: nodePositions.current[id].y + dy };
    } else if (isDraggingCanvas.current) {
      setPan(p => ({ x: p.x + mx - lastMouse.current.x, y: p.y + my - lastMouse.current.y }));
    } else {
      const node = getNodeAt(mx, my);
      setHoveredNode(node ? node.id : null);
    }
    lastMouse.current = { x: mx, y: my };
  };

  const onMouseUp = async (e) => {
    if (isDraggingNode.current && Math.hypot(e.nativeEvent.offsetX - lastMouse.current.x, e.nativeEvent.offsetY - lastMouse.current.y) < 4) {
      // it was a click
    }
    isDraggingNode.current = null;
    isDraggingCanvas.current = false;
  };

  const onClick = (e) => {
    const node = getNodeAt(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    if (node) onNodeClick(node);
  };

  const onDblClick = (e) => {
    const node = getNodeAt(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    onNodeDblClick(node || null);
  };

  const onWheel = (e) => {
    e.preventDefault();
    setZoom(z => Math.max(0.2, Math.min(3, z - e.deltaY * 0.001)));
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onClick={onClick}
        onDoubleClick={onDblClick}
        onWheel={onWheel}
        style={{ display: "block" }}
      />
      {/* Zoom controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button onClick={() => setZoom(z => Math.min(3, z + 0.2))}
          className="w-9 h-9 rounded-xl bg-white border border-[#DDD9D3] flex items-center justify-center text-[#6E6E73] hover:text-[#1F1F1F] hover:bg-[#F1F1EF] shadow-sm transition-all">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => setZoom(z => Math.max(0.2, z - 0.2))}
          className="w-9 h-9 rounded-xl bg-white border border-[#DDD9D3] flex items-center justify-center text-[#6E6E73] hover:text-[#1F1F1F] hover:bg-[#F1F1EF] shadow-sm transition-all">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }}
          className="w-9 h-9 rounded-xl bg-white border border-[#DDD9D3] flex items-center justify-center text-[#6E6E73] hover:text-[#1F1F1F] hover:bg-[#F1F1EF] shadow-sm transition-all">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function NeuralMap() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [parentForAdd, setParentForAdd] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [filter, setFilter] = useState("todos");
  const [newNodeId, setNewNodeId] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    NeuralNode.list().then(list => {
      setNodes(list);
      setLoading(false);
    });
  }, []);

  const getCenter = () => {
    if (!containerRef.current) return { x: 0, y: 0 };
    return { x: 0, y: 0 }; // relative to canvas center
  };

  const handleAddNode = async (formData, parentNode) => {
    const center = getCenter();
    let spawnX = center.x + (Math.random() - 0.5) * 300;
    let spawnY = center.y + (Math.random() - 0.5) * 200;

    // Spawn near parent if exists
    if (parentNode) {
      const pp = { x: parentNode.x || 0, y: parentNode.y || 0 };
      const angle = Math.random() * Math.PI * 2;
      spawnX = pp.x + Math.cos(angle) * 120;
      spawnY = pp.y + Math.sin(angle) * 120;
    } else if (nodes.length > 0) {
      // Spawn near auto-matched node
    }

    const newNode = await NeuralNode.create({ ...formData, x: spawnX, y: spawnY, connections: [] });

    // Auto-connect: to parent (if dblclick) or best semantic match
    let targetId = parentNode?.id || findBestConnection(newNode, nodes)?.id;
    let finalNode = newNode;

    if (targetId) {
      finalNode = await NeuralNode.update(newNode.id, { ...newNode, connections: [targetId] });
      // Add reverse connection
      const target = nodes.find(n => n.id === targetId);
      if (target) {
        const updatedTarget = await NeuralNode.update(targetId, { connections: [...(target.connections || []), newNode.id] });
        setNodes(prev => prev.map(n => n.id === targetId ? updatedTarget : n));
      }
    }

    setNodes(prev => [...prev, finalNode]);
    setNewNodeId(finalNode.id);
    setTimeout(() => setNewNodeId(null), 1200);
    toast.success("Nó criado e conectado!");
  };

  const handleDeleteNode = async (id) => {
    await NeuralNode.delete(id);
    // Remove from all connections
    const toUpdate = nodes.filter(n => (n.connections || []).includes(id));
    for (const n of toUpdate) {
      const updated = await NeuralNode.update(n.id, { connections: (n.connections || []).filter(c => c !== id) });
      setNodes(prev => prev.map(x => x.id === n.id ? updated : x));
    }
    setNodes(prev => prev.filter(n => n.id !== id));
    toast.success("Nó removido.");
  };

  const handleUpdateNode = async (id, data) => {
    const updated = await NeuralNode.update(id, data);
    setNodes(prev => prev.map(n => n.id === id ? updated : n));
    setSelectedNode(updated);
    toast.success("Nó atualizado!");
  };

  const handleNodeDblClick = (node) => {
    setParentForAdd(node);
    setAddModal(true);
  };

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "#F0EEF5" }} ref={containerRef}>
      {/* Ambient glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-[0.08]" style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-[0.06]" style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 flex items-center gap-4"
        style={{ background: "linear-gradient(to bottom, #F0EEF5f0, transparent)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#1F1F1F]">Mapa Neural</h1>
            <p className="text-xs text-[#A0A0A6]">{nodes.length} nó{nodes.length !== 1 ? "s" : ""} · {nodes.reduce((a, n) => a + (n.connections || []).length, 0) / 2 | 0} conexões</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 ml-4 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border bg-white/70 backdrop-blur-sm"
              style={filter === f
                ? { borderColor: f === "todos" ? "#a855f7" : (NODE_TYPES[f]?.color || "#a855f7"), color: f === "todos" ? "#7c3aed" : (NODE_TYPES[f]?.color || "#a855f7"), background: f === "todos" ? "#f3e8ff" : (NODE_TYPES[f]?.color + "15" || "#f3e8ff") }
                : { borderColor: "#DDD9D3", color: "#6E6E73" }}>
              {f === "todos" ? "Todos" : NODE_TYPES[f]?.label}
            </button>
          ))}
        </div>

        <div className="ml-auto">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { setParentForAdd(null); setAddModal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
            <Plus className="w-4 h-4" /> Novo Nó
          </motion.button>
        </div>
      </div>

      {/* Empty state */}
      {!loading && nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}>
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "#F3F0FF", border: "1px solid rgba(167,139,250,0.3)" }}>
              <Brain className="w-12 h-12 text-violet-400 opacity-60" />
            </div>
            <p className="text-[#6E6E73] text-center text-sm max-w-xs">Seu mapa neural está vazio. Clique em <strong className="text-violet-600">Novo Nó</strong> para começar a construir seu segundo cérebro digital.</p>
          </motion.div>
        </div>
      )}

      {/* Canvas */}
      {!loading && (
        <GraphCanvas
          nodes={nodes}
          filter={filter}
          onNodeClick={node => setSelectedNode(node)}
          onNodeDblClick={handleNodeDblClick}
          hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode}
          newNodeId={newNodeId}
        />
      )}

      {/* Hint */}
      {!loading && nodes.length > 0 && (
        <div className="absolute bottom-6 left-6 text-xs text-[#A0A0A6] space-y-1 pointer-events-none bg-white/70 backdrop-blur-sm px-3 py-2 rounded-xl border border-[#DDD9D3]">
          <p>Arraste para mover · Scroll para zoom</p>
          <p>Duplo clique num nó para conectar novo</p>
        </div>
      )}

      {/* Node detail panel */}
      <AnimatePresence>
        {selectedNode && (
          <NodePanel
            node={selectedNode}
            nodes={nodes}
            onClose={() => setSelectedNode(null)}
            onDelete={handleDeleteNode}
            onUpdate={handleUpdateNode}
            onConnect={() => { setParentForAdd(selectedNode); setAddModal(true); }}
          />
        )}
      </AnimatePresence>

      {/* Add modal */}
      <AnimatePresence>
        {addModal && (
          <AddNodeModal
            open
            onClose={() => { setAddModal(false); setParentForAdd(null); }}
            onAdd={handleAddNode}
            parentNode={parentForAdd}
          />
        )}
      </AnimatePresence>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
        </div>
      )}
    </div>
  );
}