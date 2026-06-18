import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, LayoutList, Columns } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PRIORITY_CONFIG = {
  Urgente: { label: "Urgente", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  Alta: { label: "Alta", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  Normal: { label: "Normal", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  Baixa: { label: "Baixa", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
};

const STATUS_CONFIG = {
  "A Fazer": "bg-secondary text-muted-foreground",
  "Em Andamento": "bg-blue-500/20 text-blue-400",
  "Em Aprovação": "bg-violet-500/20 text-violet-400",
  "Concluído": "bg-emerald-500/20 text-emerald-400",
  "Atrasado": "bg-red-500/20 text-red-400",
};

const KANBAN_COLS = ["A Fazer", "Em Andamento", "Em Aprovação", "Concluído", "Atrasado"];

function TaskRow({ task, onEdit, onDelete }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-border hover:bg-secondary/20 group transition-colors"
    >
      <td className="px-4 py-3">
        <span className="text-sm text-foreground font-medium">{task.name}</span>
        {task.tags?.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {task.tags.map(t => (
              <span key={t} className="text-xs bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{task.class_name || "—"}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{task.assignee || "—"}</td>
      <td className="px-4 py-3">
        {task.priority && (
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", PRIORITY_CONFIG[task.priority]?.color)}>
            {PRIORITY_CONFIG[task.priority]?.label}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={cn("text-xs px-2 py-1 rounded-full font-medium", STATUS_CONFIG[task.status])}>
          {task.status}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {task.due_date ? new Date(task.due_date + "T12:00:00").toLocaleDateString("pt-BR") : "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(task)} className="p-1 rounded hover:bg-secondary"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
          <button onClick={() => onDelete(task)} className="p-1 rounded hover:bg-secondary"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
        </div>
      </td>
    </motion.tr>
  );
}

function ListView({ tasks, onAdd, onEdit, onDelete }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tarefa</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Turma</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Responsável</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prioridade</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data</th>
            <th className="w-20" />
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => <TaskRow key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />)}
        </tbody>
      </table>
      <button onClick={onAdd} className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors w-full">
        <Plus className="w-4 h-4" /> Adicionar tarefa
      </button>
    </div>
  );
}

function KanbanView({ tasks, onEdit, onDelete }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLS.map(col => {
        const colTasks = tasks.filter(t => t.status === col);
        return (
          <div key={col} className="shrink-0 w-64 bg-secondary/40 rounded-xl border border-border p-3">
            <div className="flex items-center justify-between mb-3">
              <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", STATUS_CONFIG[col])}>{col}</span>
              <span className="text-xs text-muted-foreground">{colTasks.length}</span>
            </div>
            <div className="space-y-2">
              {colTasks.map(task => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card border border-border rounded-xl p-3 cursor-pointer hover:border-blue-500/30 transition-all group"
                  onClick={() => onEdit(task)}
                >
                  <p className="text-sm font-medium text-foreground mb-2">{task.name}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {task.priority && (
                      <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded border", PRIORITY_CONFIG[task.priority]?.color)}>
                        {PRIORITY_CONFIG[task.priority]?.label}
                      </span>
                    )}
                    {task.assignee && <span className="text-xs text-muted-foreground">{task.assignee}</span>}
                    {task.due_date && <span className="text-xs text-muted-foreground ml-auto">{new Date(task.due_date + "T12:00:00").toLocaleDateString("pt-BR")}</span>}
                  </div>
                  {task.tags?.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {task.tags.slice(0, 2).map(t => <span key={t} className="text-xs bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-full">{t}</span>)}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TasksView({ tasks, listName, onAdd, onEdit, onDelete }) {
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = tasks.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.assignee || "").toLowerCase().includes(search.toLowerCase());
    const matchPriority = !filterPriority || t.priority === filterPriority;
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchSearch && matchPriority && matchStatus;
  });

  const done = tasks.filter(t => t.status === "Concluído").length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-base font-bold text-foreground">{listName}</h2>
              <span className="text-xs text-muted-foreground">{tasks.length} tarefa{tasks.length !== 1 ? "s" : ""}</span>
            </div>
            {tasks.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{pct}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="h-8 bg-secondary border border-border rounded-lg px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 w-36"
          />
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="h-8 bg-secondary border border-border rounded-lg px-2 text-xs text-foreground focus:outline-none">
            <option value="">Prioridade</option>
            <option value="P">P – Imediata</option>
            <option value="I">I – Importante</option>
            <option value="N">N – Normal</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-8 bg-secondary border border-border rounded-lg px-2 text-xs text-foreground focus:outline-none">
            <option value="">Status</option>
            {["A Fazer","Em Andamento","Em Aprovação","Concluído","Atrasado"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* View Toggle */}
          <div className="flex bg-secondary rounded-lg border border-border p-0.5">
            <button onClick={() => setView("list")} className={cn("p-1.5 rounded transition-all", view === "list" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground")}>
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setView("kanban")} className={cn("p-1.5 rounded transition-all", view === "kanban" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground")}>
              <Columns className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button onClick={onAdd} size="sm" className="h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs px-3">
            <Plus className="w-3.5 h-3.5 mr-1" /> Nova Tarefa
          </Button>
        </div>
      </div>

      {/* View */}
      {view === "list" ? (
        <ListView tasks={filtered} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} />
      ) : (
        <KanbanView tasks={filtered} onEdit={onEdit} onDelete={onDelete} />
      )}
    </div>
  );
}