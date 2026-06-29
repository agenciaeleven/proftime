import { db } from '@/api/client';
import { useIsMobile } from '@/hooks/use-mobile';

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

function edgeControlOffset(a: string, b: string) {
  const key = a < b ? `${a}-${b}` : `${b}-${a}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash + key.charCodeAt(i) * (i + 1)) % 1000;
  const sign = hash % 2 === 0 ? 1 : -1;
  return { ox: sign * (18 + (hash % 28)), oy: -sign * (14 + (hash % 22)) };
}

// ── Node Detail Panel ──────────────────────────────────────────────────────
function NodePanel({ node, nodes, onClose, onDelete, onUpdate, isMobile }) {
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
    <motion.div
      initial={{ opacity: 0, y: isMobile ? 40 : 0, x: isMobile ? 0 : 24 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: isMobile ? 40 : 0, x: isMobile ? 0 : 24 }}
      className={
        isMobile
          ? "fixed inset-x-0 bottom-0 z-40 max-h-[78vh] rounded-t-2xl border border-[#DDD9D3] shadow-2xl overflow-hidden bg-white"
          : "absolute top-4 right-4 w-full max-w-sm sm:max-w-md rounded-2xl border border-[#DDD9D3] shadow-xl z-30 overflow-hidden bg-white"
      }
    >
      {/* Header */}
      <div className="relative px-4 py-3 flex items-center gap-3 border-b border-[#E8E6E1]"
        style={{ borderLeft: `3px solid ${cfg.color}` }}>
        {isMobile && <div className="w-10 h-1 rounded-full bg-[#DDD9D3] absolute top-2 left-1/2 -translate-x-1/2" />}
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

      <div className="p-4 space-y-3 max-h-[calc(78vh-3.5rem)] sm:max-h-[80vh] overflow-y-auto">
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
function GraphCanvas({ nodes, filter, onNodeClick, onNodeDblClick, onNodeMove, hoveredNode, setHoveredNode, newNodeId, isMobile }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const dragNode = useRef(null);
  const dragCanvas = useRef(false);
  const dragMoved = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const pinchStart = useRef(null);
  const nodePositions = useRef({});
  const animFrame = useRef(null);
  const birthNodes = useRef(new Set());
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  const filtered = filter === "todos" ? nodes : nodes.filter(n => n.type === filter);

  useEffect(() => {
    if (newNodeId) birthNodes.current.add(newNodeId);
    const t = setTimeout(() => birthNodes.current.delete(newNodeId), 1200);
    return () => clearTimeout(t);
  }, [newNodeId]);

  useEffect(() => {
    nodes.forEach(n => {
      if (!nodePositions.current[n.id]) {
        nodePositions.current[n.id] = { x: n.x ?? 0, y: n.y ?? 0 };
      }
    });
    Object.keys(nodePositions.current).forEach((id) => {
      if (!nodes.find((n) => n.id === id)) delete nodePositions.current[id];
    });
  }, [nodes]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const screenToWorld = useCallback((sx, sy) => {
    const w = size.w || 1;
    const h = size.h || 1;
    return {
      x: (sx - w / 2 - pan.x) / zoom,
      y: (sy - h / 2 - pan.y) / zoom,
    };
  }, [pan, size, zoom]);

  const getNodeAt = useCallback((sx, sy) => {
    const { x: cx, y: cy } = screenToWorld(sx, sy);
    return filtered.find(n => {
      const pos = nodePositions.current[n.id];
      if (!pos) return false;
      const r = 6 + Math.min((n.connections || []).length * 2, 10);
      return Math.hypot(pos.x - cx, pos.y - cy) < Math.max(r * 2.2, 14);
    });
  }, [filtered, screenToWorld]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.w || !size.h) return;
    const ctx = canvas.getContext("2d");
    const w = size.w;
    const h = size.h;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(pan.x + w / 2, pan.y + h / 2);
    ctx.scale(zoom, zoom);

    const now = Date.now();

    filtered.forEach(node => {
      const pos = nodePositions.current[node.id];
      if (!pos) return;
      (node.connections || []).forEach(cid => {
        const tpos = nodePositions.current[cid];
        if (!tpos || !filtered.find(n => n.id === cid)) return;

        const isHoveredEdge = hoveredNode === node.id || hoveredNode === cid;
        const { ox, oy } = edgeControlOffset(node.id, cid);
        const mx = (pos.x + tpos.x) / 2 + ox;
        const my = (pos.y + tpos.y) / 2 + oy;

        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.quadraticCurveTo(mx, my, tpos.x, tpos.y);
        ctx.strokeStyle = isHoveredEdge ? "rgba(139,92,246,0.65)" : "rgba(100,116,139,0.2)";
        ctx.lineWidth = (isHoveredEdge ? 1.6 : 1) / zoom;
        ctx.stroke();
      });
    });

    filtered.forEach(node => {
      const pos = nodePositions.current[node.id];
      if (!pos) return;
      const cfg = NODE_TYPES[node.type] || NODE_TYPES.outro;
      const isHovered = hoveredNode === node.id;
      const isBirth = birthNodes.current.has(node.id);
      const connCount = (node.connections || []).length;
      const r = 6 + Math.min(connCount * 2, 10);
      const scale = isBirth ? (1 + Math.sin((now % 1200) / 1200 * Math.PI) * 0.45) : (isHovered ? 1.35 : 1);
      const labelZoom = Math.max(zoom, 0.45);

      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * scale * 3);
      gradient.addColorStop(0, cfg.color + "55");
      gradient.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r * scale * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r * scale, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? cfg.color : cfg.color + "cc";
      ctx.shadowBlur = isHovered || isBirth ? 16 : 5;
      ctx.shadowColor = cfg.color + "90";
      ctx.fill();
      ctx.shadowBlur = 0;

      if (labelZoom > 0.35) {
        const fontSize = Math.max(10, Math.min(13, 12 / labelZoom));
        const maxLen = isMobile ? 14 : 18;
        const label = node.label.length > maxLen ? `${node.label.slice(0, maxLen)}…` : node.label;
        ctx.font = `${isHovered ? "600 " : ""}${fontSize}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = isHovered ? "#1F1F1F" : "rgba(50,50,60,0.8)";
        ctx.textAlign = "center";
        ctx.fillText(label, pos.x, pos.y + r * scale + fontSize + 2);
      }
    });

    ctx.restore();
    animFrame.current = requestAnimationFrame(draw);
  }, [dpr, filtered, hoveredNode, isMobile, pan, size, zoom]);

  useEffect(() => {
    animFrame.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrame.current);
  }, [draw]);

  const getPointerPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e) => {
    if (e.pointerType === 'touch' && e.isPrimary === false) return;
    const { x, y } = getPointerPos(e);
    const node = getNodeAt(x, y);
    dragMoved.current = false;
    if (node) {
      dragNode.current = node;
      canvasRef.current.setPointerCapture(e.pointerId);
    } else {
      dragCanvas.current = true;
      canvasRef.current.setPointerCapture(e.pointerId);
    }
    lastPointer.current = { x, y };
  };

  const onPointerMove = (e) => {
    const { x, y } = getPointerPos(e);

    if (dragNode.current) {
      const dx = (x - lastPointer.current.x) / zoom;
      const dy = (y - lastPointer.current.y) / zoom;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) dragMoved.current = true;
      const id = dragNode.current.id;
      nodePositions.current[id] = {
        x: nodePositions.current[id].x + dx,
        y: nodePositions.current[id].y + dy,
      };
    } else if (dragCanvas.current) {
      if (Math.hypot(x - lastPointer.current.x, y - lastPointer.current.y) > 2) dragMoved.current = true;
      setPan(p => ({ x: p.x + x - lastPointer.current.x, y: p.y + y - lastPointer.current.y }));
    } else {
      const node = getNodeAt(x, y);
      setHoveredNode(node ? node.id : null);
    }
    lastPointer.current = { x, y };
  };

  const onPointerUp = async (e) => {
    const { x, y } = getPointerPos(e);
    if (dragNode.current && dragMoved.current) {
      const id = dragNode.current.id;
      const pos = nodePositions.current[id];
      onNodeMove?.(id, pos.x, pos.y);
    } else if (!dragMoved.current) {
      const node = getNodeAt(x, y);
      if (node) onNodeClick(node);
    }
    dragNode.current = null;
    dragCanvas.current = false;
    try { canvasRef.current?.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  const onDoubleClick = (e) => {
    const { x, y } = getPointerPos(e);
    const node = getNodeAt(x, y);
    onNodeDblClick(node || null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * (e.ctrlKey ? 0.004 : 0.0012);
      setZoom(z => Math.max(0.25, Math.min(3, z - delta)));
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        const [a, b] = e.touches;
        pinchStart.current = {
          distance: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
          zoom,
        };
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2 && pinchStart.current) {
        e.preventDefault();
        const [a, b] = e.touches;
        const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const ratio = distance / pinchStart.current.distance;
        setZoom(Math.max(0.25, Math.min(3, pinchStart.current.zoom * ratio)));
      }
    };

    const onTouchEnd = () => { pinchStart.current = null; };

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [zoom]);

  const fitView = () => {
    if (!filtered.length) {
      setPan({ x: 0, y: 0 });
      setZoom(1);
      return;
    }
    const xs = filtered.map(n => nodePositions.current[n.id]?.x ?? 0);
    const ys = filtered.map(n => nodePositions.current[n.id]?.y ?? 0);
    const minX = Math.min(...xs) - 80;
    const maxX = Math.max(...xs) + 80;
    const minY = Math.min(...ys) - 80;
    const maxY = Math.max(...ys) + 80;
    const bw = maxX - minX;
    const bh = maxY - minY;
    const padding = isMobile ? 48 : 64;
    const scale = Math.min((size.w - padding) / bw, (size.h - padding) / bh, 1.5);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    setZoom(Math.max(0.35, Math.min(scale, 1.2)));
    setPan({ x: -cx * scale, y: -cy * scale });
  };

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden touch-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
        style={{ display: "block" }}
      />
      <div className={`absolute flex flex-col gap-2 z-10 ${isMobile ? 'bottom-20 right-3' : 'bottom-6 right-6'}`}>
        <button type="button" onClick={() => setZoom(z => Math.min(3, z + 0.2))}
          className="w-9 h-9 rounded-xl bg-white/95 border border-[#DDD9D3] flex items-center justify-center text-[#6E6E73] hover:text-[#1F1F1F] hover:bg-[#F1F1EF] shadow-sm transition-all"
          aria-label="Aumentar zoom">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => setZoom(z => Math.max(0.25, z - 0.2))}
          className="w-9 h-9 rounded-xl bg-white/95 border border-[#DDD9D3] flex items-center justify-center text-[#6E6E73] hover:text-[#1F1F1F] hover:bg-[#F1F1EF] shadow-sm transition-all"
          aria-label="Diminuir zoom">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button type="button" onClick={fitView}
          className="w-9 h-9 rounded-xl bg-white/95 border border-[#DDD9D3] flex items-center justify-center text-[#6E6E73] hover:text-[#1F1F1F] hover:bg-[#F1F1EF] shadow-sm transition-all"
          aria-label="Centralizar mapa">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function NeuralMap() {
  const isMobile = useIsMobile();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [parentForAdd, setParentForAdd] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [filter, setFilter] = useState("todos");
  const [newNodeId, setNewNodeId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
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

  const handleNodeMove = async (id, x, y) => {
    const updated = await NeuralNode.update(id, { x, y });
    setNodes(prev => prev.map(n => n.id === id ? updated : n));
    if (selectedNode?.id === id) setSelectedNode(updated);
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
      <div className="absolute top-0 left-0 right-0 z-20 px-3 sm:px-6 py-3 sm:py-4"
        style={{ background: "linear-gradient(to bottom, #F0EEF5f5, transparent)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold text-[#1F1F1F] truncate">Mapa Neural</h1>
              <p className="text-xs text-[#A0A0A6]">{nodes.length} nó{nodes.length !== 1 ? "s" : ""} · {nodes.reduce((a, n) => a + (n.connections || []).length, 0) / 2 | 0} conexões</p>
            </div>
            {isMobile && (
              <button
                type="button"
                onClick={() => setShowFilters(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[#DDD9D3] bg-white/80 text-[#6E6E73] shrink-0"
              >
                <Filter className="w-3.5 h-3.5" />
                Filtros
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setParentForAdd(null); setAddModal(true); }}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-white text-sm font-semibold shrink-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
            >
              <Plus className="w-4 h-4" />
              <span>{isMobile ? 'Novo' : 'Novo Nó'}</span>
            </motion.button>
          </div>

          {(!isMobile || showFilters) && (
            <div className={`flex gap-1.5 sm:ml-2 ${isMobile ? 'overflow-x-auto pb-1 scrollbar-hide' : 'flex-wrap flex-1'}`}>
              {FILTERS.map(f => (
                <button key={f} type="button" onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border bg-white/70 backdrop-blur-sm whitespace-nowrap shrink-0"
                  style={filter === f
                    ? { borderColor: f === "todos" ? "#a855f7" : (NODE_TYPES[f]?.color || "#a855f7"), color: f === "todos" ? "#7c3aed" : (NODE_TYPES[f]?.color || "#a855f7"), background: f === "todos" ? "#f3e8ff" : (NODE_TYPES[f]?.color + "15" || "#f3e8ff") }
                    : { borderColor: "#DDD9D3", color: "#6E6E73" }}>
                  {f === "todos" ? "Todos" : NODE_TYPES[f]?.label}
                </button>
              ))}
            </div>
          )}
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
          onNodeMove={handleNodeMove}
          hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode}
          newNodeId={newNodeId}
          isMobile={isMobile}
        />
      )}

      {/* Hint */}
      {!loading && nodes.length > 0 && !isMobile && (
        <div className="absolute bottom-6 left-6 text-xs text-[#A0A0A6] space-y-1 pointer-events-none bg-white/70 backdrop-blur-sm px-3 py-2 rounded-xl border border-[#DDD9D3] max-w-xs">
          <p>Arraste para mover · Scroll para zoom</p>
          <p>Duplo clique num nó para conectar novo</p>
        </div>
      )}

      {/* Node detail panel */}
      <AnimatePresence>
        {selectedNode && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40"
            onClick={() => setSelectedNode(null)}
          />
        )}
        {selectedNode && (
          <NodePanel
            node={selectedNode}
            nodes={nodes}
            isMobile={isMobile}
            onClose={() => setSelectedNode(null)}
            onDelete={handleDeleteNode}
            onUpdate={handleUpdateNode}
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