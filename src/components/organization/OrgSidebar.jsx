const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Plus, Folder, List, LayoutGrid, MoreHorizontal, Pencil, Trash2, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";

const COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899","#f97316"];

function ProjectEditModal({ project, onSave, onClose }) {
  const [color, setColor] = useState(project.color || "#3b82f6");
  const [imageUrl, setImageUrl] = useState(project.image_url || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleUpload = async (file) => {
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    setUploading(false);
    toast.success("Foto carregada!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-80 rounded-2xl border border-white/[0.08] p-5 z-10 shadow-2xl"
        style={{ background: "#0f172a" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white text-sm">Personalizar Projeto</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10"><X className="w-3.5 h-3.5 text-slate-500" /></button>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 mb-5 p-3 rounded-xl" style={{ background: "#080f1a" }}>
          <div
            className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            style={{ background: color }}
            onClick={() => fileRef.current.click()}
            title="Clique para trocar a foto"
          >
            {imageUrl
              ? <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              : <span className="text-white font-bold text-sm">{project.name.charAt(0)}</span>}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{project.name}</p>
            <button onClick={() => fileRef.current.click()} className="text-xs text-blue-400 hover:underline mt-0.5 flex items-center gap-1">
              <ImagePlus className="w-3 h-3" /> {uploading ? "Enviando..." : "Trocar foto"}
            </button>
          </div>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />

        {/* Color */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cor do projeto</p>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={cn("w-7 h-7 rounded-lg transition-all", color === c ? "ring-2 ring-white/50 ring-offset-1 ring-offset-[#0f172a] scale-110" : "hover:scale-105")}
                style={{ background: c }} />
            ))}
          </div>
        </div>

        {imageUrl && (
          <button onClick={() => setImageUrl("")} className="text-xs text-slate-500 hover:text-red-400 mb-4 flex items-center gap-1 transition-colors">
            <X className="w-3 h-3" /> Remover foto
          </button>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => { onSave({ color, image_url: imageUrl }); onClose(); }}
            className="flex-1 h-9 rounded-xl text-white text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            Salvar
          </button>
          <button onClick={onClose} className="px-4 h-9 rounded-xl text-sm text-slate-400 border border-white/[0.07] hover:bg-white/[0.05]">Cancelar</button>
        </div>
      </motion.div>
    </div>
  );
}

function ContextMenu({ onRename, onDelete, onCustomize }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button onClick={e => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card border-border text-foreground text-sm" align="end">
        <DropdownMenuItem onClick={onRename}><Pencil className="w-3.5 h-3.5 mr-2" />Renomear</DropdownMenuItem>
        {onCustomize && <DropdownMenuItem onClick={onCustomize}><ImagePlus className="w-3.5 h-3.5 mr-2" />Foto / Cor</DropdownMenuItem>}
        <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-400"><Trash2 className="w-3.5 h-3.5 mr-2" />Excluir</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InlineEdit({ value, onSave, onCancel }) {
  const [val, setVal] = useState(value);
  return (
    <input
      autoFocus
      value={val}
      onChange={e => setVal(e.target.value)}
      onKeyDown={e => { if (e.key === "Enter") onSave(val); if (e.key === "Escape") onCancel(); }}
      onBlur={() => onSave(val)}
      onClick={e => e.stopPropagation()}
      className="bg-transparent border-b border-blue-400 outline-none text-sm w-full text-foreground"
    />
  );
}

export default function OrgSidebar({
  projects, folders, lists, selectedProject, selectedFolder, selectedList,
  onSelectProject, onSelectFolder, onSelectList,
  onAddProject, onAddFolder, onAddList,
  onRename, onDelete, onCustomize
}) {
  const [expandedProjects, setExpandedProjects] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({});
  const [renamingId, setRenamingId] = useState(null);
  const [customizingProject, setCustomizingProject] = useState(null);

  const toggleProject = (id) => setExpandedProjects(p => ({ ...p, [id]: !p[id] }));
  const toggleFolder = (id) => setExpandedFolders(p => ({ ...p, [id]: !p[id] }));

  return (
    <>
    {customizingProject && (
      <ProjectEditModal
        project={customizingProject}
        onSave={(data) => onCustomize(customizingProject, data)}
        onClose={() => setCustomizingProject(null)}
      />
    )}
    <div className="h-full flex flex-col bg-[hsl(var(--sidebar-background))] border-r border-sidebar-border w-64 shrink-0 overflow-hidden">
      <div className="px-4 py-4 border-b border-sidebar-border flex items-center justify-between">
        <span className="text-xs font-bold text-sidebar-foreground uppercase tracking-widest">Organização</span>
        <button onClick={onAddProject} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-sidebar-foreground transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {projects.map(project => {
          const isExpandedP = expandedProjects[project.id];
          const isActiveP = selectedProject?.id === project.id;
          const projectFolders = folders.filter(f => f.project_id === project.id);

          return (
            <div key={project.id}>
              {/* Project Row */}
              <div
                onClick={() => { toggleProject(project.id); onSelectProject(project); }}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer group transition-all",
                  isActiveP ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-white/5 text-sidebar-foreground"
                )}
              >
                <ChevronRight className={cn("w-3.5 h-3.5 shrink-0 transition-transform", isExpandedP && "rotate-90")} />
                <div className="w-5 h-5 rounded overflow-hidden shrink-0 flex items-center justify-center"
                  style={{ background: project.color || "#3b82f6" }}>
                  {project.image_url
                    ? <img src={project.image_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-white font-bold text-[9px]">{project.name.charAt(0)}</span>}
                </div>
                {renamingId === project.id ? (
                  <InlineEdit value={project.name} onSave={v => { onRename(project, v); setRenamingId(null); }} onCancel={() => setRenamingId(null)} />
                ) : (
                  <span className="text-sm font-medium flex-1 truncate">{project.name}</span>
                )}
                <ContextMenu
                  onRename={() => setRenamingId(project.id)}
                  onDelete={() => onDelete("project", project)}
                  onCustomize={() => setCustomizingProject(project)}
                />
              </div>

              {/* Folders */}
              <AnimatePresence>
                {isExpandedP && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                    <div className="ml-4 space-y-0.5 mt-0.5">
                      {projectFolders.map(folder => {
                        const isExpandedF = expandedFolders[folder.id];
                        const isActiveF = selectedFolder?.id === folder.id;
                        const folderLists = lists.filter(l => l.folder_id === folder.id);

                        return (
                          <div key={folder.id}>
                            <div
                              onClick={() => { toggleFolder(folder.id); onSelectFolder(folder); }}
                              className={cn(
                                "flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer group transition-all",
                                isActiveF ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-white/5 text-sidebar-foreground"
                              )}
                            >
                              <ChevronRight className={cn("w-3 h-3 shrink-0 transition-transform", isExpandedF && "rotate-90")} />
                              <Folder className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                              {renamingId === folder.id ? (
                                <InlineEdit value={folder.name} onSave={v => { onRename(folder, v); setRenamingId(null); }} onCancel={() => setRenamingId(null)} />
                              ) : (
                                <span className="text-xs font-medium flex-1 truncate">{folder.name}</span>
                              )}
                              <button
                                onClick={e => { e.stopPropagation(); onAddList(folder); }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <ContextMenu onRename={() => setRenamingId(folder.id)} onDelete={() => onDelete("folder", folder)} />
                            </div>

                            {/* Lists */}
                            <AnimatePresence>
                              {isExpandedF && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}>
                                  <div className="ml-4 space-y-0.5 mt-0.5">
                                    {folderLists.map(list => {
                                      const isActiveL = selectedList?.id === list.id;
                                      return (
                                        <div
                                          key={list.id}
                                          onClick={() => onSelectList(list)}
                                          className={cn(
                                            "flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer group transition-all",
                                            isActiveL ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-white/5 text-sidebar-foreground"
                                          )}
                                        >
                                          <List className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                                          {renamingId === list.id ? (
                                            <InlineEdit value={list.name} onSave={v => { onRename(list, v); setRenamingId(null); }} onCancel={() => setRenamingId(null)} />
                                          ) : (
                                            <span className="text-xs flex-1 truncate">{list.name}</span>
                                          )}
                                          <ContextMenu onRename={() => setRenamingId(list.id)} onDelete={() => onDelete("list", list)} />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}

                      {/* Add folder */}
                      <button
                        onClick={() => onAddFolder(project)}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sidebar-foreground hover:bg-white/5 transition-colors w-full text-left"
                      >
                        <Plus className="w-3 h-3" />
                        <span className="text-xs">Adicionar pasta</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-sidebar-foreground">Nenhum projeto ainda</p>
            <button onClick={onAddProject} className="text-xs text-blue-400 hover:underline mt-1">Criar primeiro projeto</button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}