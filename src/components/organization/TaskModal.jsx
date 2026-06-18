import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

const PRIORITIES = [
  { value: "Urgente", color: "text-red-400 bg-red-400/10 border-red-400/30" },
  { value: "Alta", color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  { value: "Normal", color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  { value: "Baixa", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
];

const STATUSES = ["A Fazer", "Em Andamento", "Em Aprovação", "Concluído", "Atrasado"];

const DEFAULT_TAGS = ["Prova", "Trabalho", "Frequência", "Nota", "Reunião", "Pais", "Urgente"];

export default function TaskModal({ open, onClose, onSave, task, lists }) {
  const [form, setForm] = useState({
    name: "", assignee: "", priority: "Normal", status: "A Fazer",
    due_date: "", description: "", class_name: "", subject: "",
    tags: [], list_id: ""
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (task) setForm({ ...task, tags: task.tags || [] });
    else setForm({ name: "", assignee: "", priority: "Normal", status: "A Fazer", due_date: "", description: "", class_name: "", subject: "", tags: [], list_id: lists[0]?.id || "" });
  }, [task, open]);

  const toggleTag = (tag) => {
    setForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }));
  };

  const addCustomTag = () => {
    const tag = newTag.trim();
    if (!tag || form.tags.includes(tag)) return;
    setForm(f => ({ ...f, tags: [...f.tags, tag] }));
    setNewTag("");
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  // All available tags = defaults + any custom ones already in form not in defaults
  const allTags = [...new Set([...DEFAULT_TAGS, ...form.tags])];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Input placeholder="Nome da tarefa *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary border-border rounded-xl" />

          {lists.length > 1 && (
            <Select value={form.list_id} onValueChange={v => setForm(f => ({ ...f, list_id: v }))}>
              <SelectTrigger className="bg-secondary border-border rounded-xl"><SelectValue placeholder="Lista..." /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                {lists.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
              <SelectTrigger className="bg-secondary border-border rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                {PRIORITIES.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    <span className={cn("font-medium", p.color.split(" ")[0])}>{p.value}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger className="bg-secondary border-border rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Responsável" value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} className="bg-secondary border-border rounded-xl" />
            <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="bg-secondary border-border rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Turma" value={form.class_name} onChange={e => setForm(f => ({ ...f, class_name: e.target.value }))} className="bg-secondary border-border rounded-xl" />
            <Input placeholder="Disciplina" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="bg-secondary border-border rounded-xl" />
          </div>

          <textarea
            placeholder="Descrição..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />

          {/* Tags */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Etiquetas</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn("px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                    form.tags.includes(tag)
                      ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                      : "bg-secondary border-border text-muted-foreground hover:border-blue-500/30"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Create custom tag */}
            <div className="flex gap-2">
              <Input
                placeholder="Criar nova etiqueta..."
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustomTag()}
                className="bg-secondary border-border rounded-xl h-8 text-xs"
              />
              <Button onClick={addCustomTag} size="sm" variant="outline" className="h-8 rounded-xl border-border px-3 shrink-0">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:opacity-90">
              {task ? "Salvar" : "Criar Tarefa"}
            </Button>
            <Button variant="outline" onClick={onClose} className="rounded-xl border-border">Cancelar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}