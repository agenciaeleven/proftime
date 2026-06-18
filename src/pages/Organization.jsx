const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderKanban, ChevronRight, Plus, Folder, List } from "lucide-react";

import { toast } from "sonner";
import OrgSidebar from "../components/organization/OrgSidebar";
import TasksView from "../components/organization/TasksView";
import TaskModal from "../components/organization/TaskModal";
import DocumentsView from "../components/organization/DocumentsView";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const { Project, OrgFolder, OrgList, OrgTask } = db.entities;

const ORG_TABS = [
  { key: "tasks", label: "📋 Tarefas" },
  { key: "docs", label: "📄 Documentos" },
];

export default function Organization() {
  const [orgTab, setOrgTab] = useState("tasks");
  const [projects, setProjects] = useState([]);
  const [folders, setFolders] = useState([]);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedList, setSelectedList] = useState(null);

  const [addDialog, setAddDialog] = useState(null);
  const [addName, setAddName] = useState("");
  const [taskModal, setTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [p, f, l, t] = await Promise.all([
      Project.list(), OrgFolder.list(), OrgList.list(), OrgTask.list()
    ]);
    setProjects(p); setFolders(f); setLists(l); setTasks(t);
    setLoading(false);
  };

  const currentTasks = selectedList ? tasks.filter(t => t.list_id === selectedList.id) : [];

  const handleAddItem = async () => {
    if (!addName.trim()) return;
    const { type, parent } = addDialog;
    if (type === "project") {
      const created = await Project.create({ name: addName, color: randomColor() });
      setProjects(p => [...p, created]);
    } else if (type === "folder") {
      const created = await OrgFolder.create({ name: addName, project_id: parent.id });
      setFolders(f => [...f, created]);
    } else if (type === "list") {
      const created = await OrgList.create({ name: addName, folder_id: parent.id, project_id: parent.project_id });
      setLists(l => [...l, created]);
    }
    setAddName("");
    setAddDialog(null);
    toast.success("Criado com sucesso!");
  };

  const handleRename = async (item, newName) => {
    if (!newName.trim()) return;
    if (projects.find(p => p.id === item.id)) {
      await Project.update(item.id, { name: newName });
      setProjects(p => p.map(x => x.id === item.id ? { ...x, name: newName } : x));
    } else if (folders.find(f => f.id === item.id)) {
      await OrgFolder.update(item.id, { name: newName });
      setFolders(f => f.map(x => x.id === item.id ? { ...x, name: newName } : x));
    } else {
      await OrgList.update(item.id, { name: newName });
      setLists(l => l.map(x => x.id === item.id ? { ...x, name: newName } : x));
    }
  };

  const handleCustomize = async (project, data) => {
    const updated = await Project.update(project.id, data);
    setProjects(p => p.map(x => x.id === project.id ? updated : x));
    if (selectedProject?.id === project.id) setSelectedProject(updated);
    toast.success("Projeto personalizado!");
  };

  const handleDelete = async (type, item) => {
    if (type === "project") {
      await Project.delete(item.id);
      setProjects(p => p.filter(x => x.id !== item.id));
      if (selectedProject?.id === item.id) { setSelectedProject(null); setSelectedFolder(null); setSelectedList(null); }
    } else if (type === "folder") {
      await OrgFolder.delete(item.id);
      setFolders(f => f.filter(x => x.id !== item.id));
      if (selectedFolder?.id === item.id) { setSelectedFolder(null); setSelectedList(null); }
    } else {
      await OrgList.delete(item.id);
      setLists(l => l.filter(x => x.id !== item.id));
      if (selectedList?.id === item.id) setSelectedList(null);
    }
    toast.success("Excluído.");
  };

  const handleSaveTask = async (form) => {
    const data = {
      ...form,
      list_id: form.list_id || selectedList?.id,
      folder_id: selectedFolder?.id,
      project_id: selectedProject?.id
    };
    if (editingTask) {
      const updated = await OrgTask.update(editingTask.id, data);
      setTasks(t => t.map(x => x.id === editingTask.id ? updated : x));
      toast.success("Tarefa atualizada!");
    } else {
      const created = await OrgTask.create(data);
      setTasks(t => [...t, created]);
      toast.success("Tarefa criada!");
    }
    setTaskModal(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (task) => {
    await OrgTask.delete(task.id);
    setTasks(t => t.filter(x => x.id !== task.id));
    toast.success("Tarefa excluída.");
  };

  const openAddTask = () => { setEditingTask(null); setTaskModal(true); };
  const openEditTask = (task) => { setEditingTask(task); setTaskModal(true); };

  const breadcrumb = [
    selectedProject && selectedProject.name,
    selectedFolder && selectedFolder.name,
    selectedList && selectedList.name,
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-secondary border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const TabBar = () => (
    <div className="flex gap-1 px-4 py-2 border-b border-[#DDD9D3] shrink-0 bg-white">
      {ORG_TABS.map(t => (
        <button key={t.key} onClick={() => setOrgTab(t.key)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            orgTab === t.key ? "bg-[#F1F5FF] text-[#4D7CFE]" : "text-[#6E6E73] hover:text-[#1F1F1F] hover:bg-[#F1F1EF]"
          }`}>
          {t.label}
        </button>
      ))}
    </div>
  );

  if (orgTab === "docs") {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TabBar />
        <div className="flex-1 overflow-hidden"><DocumentsView /></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TabBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <OrgSidebar
          projects={projects} folders={folders} lists={lists}
          selectedProject={selectedProject} selectedFolder={selectedFolder} selectedList={selectedList}
          onSelectProject={(p) => { setSelectedProject(p); setSelectedFolder(null); setSelectedList(null); }}
          onSelectFolder={(f) => { setSelectedFolder(f); setSelectedList(null); }}
          onSelectList={(l) => {
            setSelectedList(l);
            setSelectedFolder(folders.find(f => f.id === l.folder_id) || selectedFolder);
            setSelectedProject(projects.find(p => p.id === l.project_id) || selectedProject);
          }}
          onAddProject={() => setAddDialog({ type: "project" })}
          onAddFolder={(project) => setAddDialog({ type: "folder", parent: project })}
          onAddList={(folder) => setAddDialog({ type: "list", parent: folder })}
          onRename={handleRename}
          onDelete={handleDelete}
          onCustomize={handleCustomize}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="p-6">
            {breadcrumb.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                {breadcrumb.map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="w-3 h-3" />}
                    <span className={i === breadcrumb.length - 1 ? "text-foreground font-medium" : ""}>{b}</span>
                  </span>
                ))}
              </div>
            )}

            {!selectedList && !selectedFolder && !selectedProject && (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                  <FolderKanban className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Organização de Tarefas</h2>
                <p className="text-muted-foreground text-sm max-w-sm">Crie seu primeiro projeto na barra lateral para começar a organizar suas turmas, tarefas e conteúdos.</p>
                <Button onClick={() => setAddDialog({ type: "project" })} className="mt-6 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" /> Criar Projeto
                </Button>
              </div>
            )}

            {selectedProject && !selectedList && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
                    style={{ background: selectedProject.color }}>
                    {selectedProject.image_url
                      ? <img src={selectedProject.image_url} alt="" className="w-full h-full object-cover" />
                      : <span className="text-white font-bold text-sm">{selectedProject.name.charAt(0)}</span>}
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{selectedProject.name}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folders.filter(f => f.project_id === selectedProject.id).map(folder => {
                    const folderLists = lists.filter(l => l.folder_id === folder.id);
                    const folderTasks = tasks.filter(t => folderLists.some(l => l.id === t.list_id));
                    return (
                      <motion.div key={folder.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }}
                        className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-blue-500/30 transition-all"
                        onClick={() => setSelectedFolder(folder)}>
                        <div className="flex items-center gap-2 mb-3">
                          <Folder className="w-5 h-5 text-amber-400" />
                          <h3 className="font-semibold text-foreground">{folder.name}</h3>
                        </div>
                        <div className="space-y-1.5">
                          {folderLists.slice(0, 4).map(l => (
                            <div key={l.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <List className="w-3 h-3 text-emerald-400" />
                              <span>{l.name}</span>
                              <span className="ml-auto">{tasks.filter(t => t.list_id === l.id).length}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                          {folderLists.length} lista{folderLists.length !== 1 ? "s" : ""} · {folderTasks.length} tarefa{folderTasks.length !== 1 ? "s" : ""}
                        </div>
                      </motion.div>
                    );
                  })}
                  <motion.div whileHover={{ y: -2 }} onClick={() => setAddDialog({ type: "folder", parent: selectedProject })}
                    className="bg-secondary/30 border-2 border-dashed border-border rounded-2xl p-5 cursor-pointer hover:border-blue-500/40 transition-all flex flex-col items-center justify-center gap-2 min-h-32">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Nova Pasta</span>
                  </motion.div>
                </div>
              </div>
            )}

            {selectedList && (
              <TasksView tasks={currentTasks} listName={selectedList.name} onAdd={openAddTask} onEdit={openEditTask} onDelete={handleDeleteTask} />
            )}
          </div>
        </div>

        {/* Add dialog */}
        <Dialog open={!!addDialog} onOpenChange={() => { setAddDialog(null); setAddName(""); }}>
          <DialogContent className="bg-card border-border rounded-2xl max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {addDialog?.type === "project" ? "Novo Projeto" : addDialog?.type === "folder" ? "Nova Pasta" : "Nova Lista"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input autoFocus placeholder="Nome..." value={addName} onChange={e => setAddName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddItem()} className="bg-secondary border-border rounded-xl" />
              <div className="flex gap-3">
                <Button onClick={handleAddItem} className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:opacity-90">Criar</Button>
                <Button variant="outline" onClick={() => { setAddDialog(null); setAddName(""); }} className="rounded-xl border-border">Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <TaskModal
          open={taskModal}
          onClose={() => { setTaskModal(false); setEditingTask(null); }}
          onSave={handleSaveTask}
          task={editingTask}
          lists={lists.filter(l => l.folder_id === selectedFolder?.id)}
        />
      </div>
    </div>
  );
}

function randomColor() {
  const colors = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899"];
  return colors[Math.floor(Math.random() * colors.length)];
}