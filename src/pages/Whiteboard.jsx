import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PenLine, Eraser, Square, Circle, Type, Trash2, Download, Minus, Plus, RotateCcw, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ["#1e293b","#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#ffffff"];
const TOOLS = [
  { key: "pen", icon: PenLine, label: "Caneta" },
  { key: "eraser", icon: Eraser, label: "Borracha" },
  { key: "line", icon: Minus, label: "Linha" },
  { key: "rect", icon: Square, label: "Retângulo" },
  { key: "circle", icon: Circle, label: "Círculo" },
  { key: "text", icon: Type, label: "Texto" },
];

export default function Whiteboard() {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#1e293b");
  const [size, setSize] = useState(3);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [stickies, setStickies] = useState([]);
  const [showStickyInput, setShowStickyInput] = useState(false);
  const [stickyText, setStickyText] = useState("");
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.fillStyle = "#FAFAF8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  }, []);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(canvas.toDataURL());
    historyIndexRef.current++;
  };

  const undo = () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = historyRef.current[historyIndexRef.current];
    img.onload = () => ctx.drawImage(img, 0, 0);
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    const pos = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (tool === "text") {
      const text = prompt("Digite o texto:");
      if (text) {
        ctx.fillStyle = color;
        ctx.font = `${size * 6}px Manrope, sans-serif`;
        ctx.fillText(text, pos.x, pos.y);
        saveHistory();
      }
      return;
    }
    setDrawing(true);
    setStartPos(pos);
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!drawing) return;
    const pos = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = tool === "eraser" ? "#FAFAF8" : color;
    ctx.lineWidth = tool === "eraser" ? size * 5 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (["line","rect","circle"].includes(tool)) {
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      if (tool === "line") {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === "rect") {
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      } else if (tool === "circle") {
        const rx = Math.abs(pos.x - startPos.x) / 2;
        const ry = Math.abs(pos.y - startPos.y) / 2;
        const cx = startPos.x + (pos.x - startPos.x) / 2;
        const cy = startPos.y + (pos.y - startPos.y) / 2;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  const stopDraw = () => { if (drawing) { setDrawing(false); saveHistory(); } };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FAFAF8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setStickies([]);
    saveHistory();
  };

  const downloadCanvas = () => {
    const link = document.createElement("a");
    link.download = "lousa.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const addSticky = () => {
    if (!stickyText.trim()) return;
    const colors = ["#fef08a","#86efac","#93c5fd","#f9a8d4","#fca5a5"];
    setStickies(prev => [...prev, {
      id: Date.now(), text: stickyText,
      x: 100 + Math.random() * 200, y: 100 + Math.random() * 200,
      color: colors[Math.floor(Math.random() * colors.length)]
    }]);
    setStickyText(""); setShowStickyInput(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F3F0]">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-[#DDD9D3] flex items-center gap-3 flex-wrap shrink-0 bg-white shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1" style={{ background: "#FFF0F6", border: "1px solid rgba(236,72,153,0.2)" }}>
          <PenLine className="w-3.5 h-3.5 text-pink-500" />
          <span className="text-xs text-pink-600 font-medium">Lousa Digital</span>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-[#DDD9D3] bg-[#FAFAF8]">
          {TOOLS.map(t => (
            <button key={t.key} onClick={() => setTool(t.key)} title={t.label}
              className={cn("p-2 rounded-lg transition-all", tool === t.key ? "bg-white shadow-sm text-[#1F1F1F]" : "text-[#A0A0A6] hover:text-[#1F1F1F] hover:bg-white/60")}>
              <t.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1.5">
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)}
              className={cn("w-5 h-5 rounded-full transition-transform", color === c ? "scale-125 ring-2 ring-[#1F1F1F]/30 ring-offset-1 ring-offset-white" : "hover:scale-110")}
              style={{ background: c, border: c === "#ffffff" ? "1px solid #DDD9D3" : "none" }} />
          ))}
        </div>

        {/* Size */}
        <div className="flex items-center gap-2">
          <button onClick={() => setSize(s => Math.max(1, s - 1))} className="w-7 h-7 rounded-lg bg-[#F1F1EF] border border-[#DDD9D3] flex items-center justify-center text-[#6E6E73] hover:bg-[#E8E6E1] transition-all">
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-xs text-[#6E6E73] w-6 text-center font-medium">{size}</span>
          <button onClick={() => setSize(s => Math.min(20, s + 1))} className="w-7 h-7 rounded-lg bg-[#F1F1EF] border border-[#DDD9D3] flex items-center justify-center text-[#6E6E73] hover:bg-[#E8E6E1] transition-all">
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button onClick={() => setShowStickyInput(s => !s)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all">
            <StickyNote className="w-3.5 h-3.5" /> Post-it
          </button>
          <button onClick={undo} className="p-2 rounded-xl text-[#A0A0A6] hover:text-[#1F1F1F] hover:bg-[#F1F1EF] transition-all" title="Desfazer">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={downloadCanvas} className="p-2 rounded-xl text-[#A0A0A6] hover:text-[#1F1F1F] hover:bg-[#F1F1EF] transition-all" title="Salvar imagem">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={clearCanvas} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-all">
            <Trash2 className="w-3.5 h-3.5" /> Limpar
          </button>
        </div>
      </div>

      {/* Sticky input */}
      {showStickyInput && (
        <div className="px-4 py-2 border-b border-[#DDD9D3] flex items-center gap-2 bg-amber-50">
          <input value={stickyText} onChange={e => setStickyText(e.target.value)} onKeyDown={e => e.key === "Enter" && addSticky()}
            placeholder="Texto do post-it..."
            className="flex-1 h-8 bg-white border border-[#DDD9D3] rounded-lg px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
          <button onClick={addSticky} className="px-3 h-8 rounded-lg bg-amber-400 text-white text-xs font-medium hover:bg-amber-500 transition-all">Adicionar</button>
        </div>
      )}

      {/* Canvas area */}
      <div className="flex-1 relative overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full"
          style={{ cursor: tool === "eraser" ? "cell" : tool === "text" ? "text" : "crosshair" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />

        {/* Post-its */}
        {stickies.map(sticky => (
          <motion.div key={sticky.id} drag dragMomentum={false}
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="absolute w-36 p-3 rounded-lg shadow-xl text-sm text-slate-800 font-medium cursor-move select-none"
            style={{ left: sticky.x, top: sticky.y, background: sticky.color, rotate: `${(Math.random() * 4 - 2).toFixed(1)}deg` }}>
            <button onClick={() => setStickies(s => s.filter(x => x.id !== sticky.id))}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-xs hover:bg-black/40">×</button>
            {sticky.text}
          </motion.div>
        ))}
      </div>
    </div>
  );
}