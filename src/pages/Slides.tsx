import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Presentation,
  Download,
  Edit3,
  ExternalLink,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  createSlidePresentation,
  deleteSlidePresentation,
  downloadSlidePresentation,
  getSlidePresentation,
  isSlidesApiAvailable,
  listSlidePresentations,
  regenerateSlidePresentation,
  updateSlidePresentation,
  type SlidePresentation,
  type SlideExportFormat,
} from '@/api/slides'

const EXPORT_OPTIONS: { key: SlideExportFormat; label: string }[] = [
  { key: 'pdf', label: 'PDF' },
  { key: 'pptx', label: 'PowerPoint' },
  { key: 'png', label: 'PNG (zip)' },
]

const STATUS_LABEL: Record<string, string> = {
  pending: 'Na fila…',
  processing: 'Gerando no Gamma…',
  completed: 'Pronto',
  failed: 'Erro',
}

export default function Slides() {
  const [presentations, setPresentations] = useState<SlidePresentation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const [form, setForm] = useState({
    title: '',
    topic: '',
    inputText: '',
    numCards: '10',
    exportAs: 'pdf' as SlideExportFormat,
  })

  const [editForm, setEditForm] = useState({
    title: '',
    topic: '',
    inputText: '',
  })

  const selected = presentations.find((p) => p.id === selectedId) ?? null

  const refreshList = useCallback(async () => {
    if (!isSlidesApiAvailable()) {
      setLoading(false)
      return
    }
    try {
      const list = await listSlidePresentations()
      setPresentations(list)
      if (!selectedId && list.length > 0) setSelectedId(list[0].id)
    } catch {
      toast.error('Não foi possível carregar as apresentações')
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => {
    void refreshList()
  }, [refreshList])

  useEffect(() => {
    if (!selected) return
    setEditForm({
      title: selected.title,
      topic: selected.topic || '',
      inputText: selected.input_text,
    })
  }, [selected])

  useEffect(() => {
    if (!selectedId || !isSlidesApiAvailable()) return
    const current = presentations.find((p) => p.id === selectedId)
    if (!current || current.status === 'completed' || current.status === 'failed') return

    const timer = setInterval(async () => {
      try {
        const updated = await getSlidePresentation(selectedId)
        setPresentations((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        )
        if (updated.status === 'completed') {
          toast.success('Apresentação gerada com sucesso!')
        }
        if (updated.status === 'failed') {
          toast.error(updated.error_message || 'Falha na geração')
        }
      } catch {
        /* ignore polling errors */
      }
    }, 5000)

    return () => clearInterval(timer)
  }, [selectedId, presentations])

  const handleCreate = async () => {
    if (!form.title.trim() || !form.inputText.trim()) {
      toast.error('Preencha título e conteúdo da aula.')
      return
    }

    setCreating(true)
    try {
      const created = await createSlidePresentation({
        title: form.title.trim(),
        topic: form.topic.trim() || undefined,
        inputText: form.inputText.trim(),
        numCards: Number(form.numCards) || 10,
        exportAs: form.exportAs,
        audience: 'estudantes brasileiros',
        tone: 'didático, claro e envolvente',
      })
      setPresentations((prev) => [created, ...prev])
      setSelectedId(created.id)
      setShowCreate(false)
      setForm({ title: '', topic: '', inputText: '', numCards: '10', exportAs: 'pdf' })
      toast.success('Geração iniciada no Gamma!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar slides')
    } finally {
      setCreating(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const updated = await updateSlidePresentation(selected.id, {
        title: editForm.title.trim(),
        topic: editForm.topic.trim() || undefined,
        input_text: editForm.inputText.trim(),
      })
      setPresentations((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setEditing(false)
      toast.success('Conteúdo atualizado!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerate = async () => {
    if (!selected) return
    setCreating(true)
    try {
      const updated = await regenerateSlidePresentation(selected.id)
      setPresentations((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      toast.success('Regeneração iniciada!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao regenerar')
    } finally {
      setCreating(false)
    }
  }

  const handleDownload = async () => {
    if (!selected) return
    setDownloading(true)
    try {
      await downloadSlidePresentation(selected.id, selected.title)
      toast.success('Download iniciado!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro no download')
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSlidePresentation(id)
      setPresentations((prev) => prev.filter((p) => p.id !== id))
      if (selectedId === id) setSelectedId(null)
      toast.success('Apresentação removida')
    } catch {
      toast.error('Erro ao remover')
    }
  }

  if (!isSlidesApiAvailable()) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 text-sm text-[#6E6E73]">
        Configure VITE_API_URL para usar o gerador de slides com Gamma.
      </div>
    )
  }

  return (
    <div
      className="min-h-full"
      style={{ background: 'linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)' }}
    >
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 lg:mb-8">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-4"
            style={{ background: '#F3F0FF', border: '1px solid rgba(167,139,250,0.25)' }}
          >
            <Presentation className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-xs text-violet-600 font-medium">Gamma · Gerador de Slides</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1F1F1F] tracking-tight">
                Apresentações
              </h1>
              <p className="text-[#6E6E73] text-sm mt-1.5">
                Crie, edite no Gamma e baixe PDF ou PowerPoint.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              <Plus className="w-4 h-4" /> Nova apresentação
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Lista */}
          <div className="lg:col-span-4 space-y-2">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-[#A0A0A6] p-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
              </div>
            ) : presentations.length === 0 ? (
              <div className="rounded-2xl border border-[#DDD9D3] bg-white p-6 text-sm text-[#6E6E73]">
                Nenhuma apresentação ainda. Clique em <strong>Nova apresentação</strong>.
              </div>
            ) : (
              presentations.map((p) => (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => { setSelectedId(p.id); setEditing(false) }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedId(p.id)
                      setEditing(false)
                    }
                  }}
                  className={cn(
                    'w-full rounded-xl border p-4 text-left transition-all bg-white cursor-pointer',
                    selectedId === p.id
                      ? 'border-violet-400/50 bg-violet-50'
                      : 'border-[#DDD9D3] hover:border-[#C8C4BE]',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1F1F1F] truncate">{p.title}</p>
                      {p.topic && (
                        <p className="text-xs text-[#A0A0A6] truncate mt-0.5">{p.topic}</p>
                      )}
                      <p className="text-[11px] text-violet-600 mt-2 font-medium">
                        {STATUS_LABEL[p.status] || p.status}
                        {p.status === 'processing' && (
                          <Loader2 className="inline w-3 h-3 ml-1 animate-spin" />
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); void handleDelete(p.id) }}
                      className="p-1 rounded-md hover:bg-red-50 text-[#A0A0A6] hover:text-red-500"
                      aria-label="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detalhe */}
          <div className="lg:col-span-8">
            {!selected ? (
              <div className="rounded-2xl border border-dashed border-[#DDD9D3] bg-white/60 p-12 text-center text-sm text-[#A0A0A6]">
                Selecione ou crie uma apresentação
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className="relative rounded-2xl overflow-hidden min-h-[320px] flex flex-col justify-center p-8 lg:p-12"
                  style={{
                    background: 'linear-gradient(135deg, #1a1f3c 0%, #0f172a 40%, #1a0d2e 100%)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-[0.12] bg-indigo-500" />
                  <div className="relative z-10">
                    <span className="text-xs uppercase tracking-widest text-slate-500 mb-3 block font-mono">
                      {selected.num_cards} slides · {selected.export_format.toUpperCase()}
                    </span>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">{selected.title}</h2>
                    {selected.topic && (
                      <p className="text-slate-300 mb-4">{selected.topic}</p>
                    )}
                    <p className="text-sm text-slate-400 line-clamp-4 whitespace-pre-wrap">
                      {selected.input_text}
                    </p>
                    {selected.status === 'processing' && (
                      <div className="mt-6 flex items-center gap-2 text-violet-300 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Gamma está gerando sua apresentação…
                      </div>
                    )}
                    {selected.status === 'failed' && selected.error_message && (
                      <p className="mt-4 text-sm text-red-300">{selected.error_message}</p>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-wrap gap-2">
                  {selected.gamma_url && (
                    <a
                      href={selected.gamma_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-violet-700 border border-violet-200 bg-violet-50 hover:bg-violet-100"
                    >
                      <ExternalLink className="w-4 h-4" /> Editar no Gamma
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditing((v) => !v)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-[#6E6E73] border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF]"
                  >
                    <Edit3 className="w-4 h-4" /> {editing ? 'Fechar edição' : 'Editar conteúdo'}
                  </button>
                  <button
                    type="button"
                    disabled={selected.status !== 'completed' || downloading}
                    onClick={() => void handleDownload()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-[#6E6E73] border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF] disabled:opacity-40"
                  >
                    {downloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Baixar {selected.export_format.toUpperCase()}
                  </button>
                  <button
                    type="button"
                    disabled={creating}
                    onClick={() => void handleRegenerate()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-[#6E6E73] border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF] disabled:opacity-40"
                  >
                    {creating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Regenerar
                  </button>
                </div>

                <AnimatePresence>
                  {editing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-2xl border border-[#DDD9D3] bg-white p-5 space-y-3 overflow-hidden"
                    >
                      <input
                        value={editForm.title}
                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-[#DDD9D3] text-sm"
                        placeholder="Título"
                      />
                      <input
                        value={editForm.topic}
                        onChange={(e) => setEditForm((f) => ({ ...f, topic: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-[#DDD9D3] text-sm"
                        placeholder="Tema / disciplina"
                      />
                      <textarea
                        value={editForm.inputText}
                        onChange={(e) => setEditForm((f) => ({ ...f, inputText: e.target.value }))}
                        rows={8}
                        className="w-full px-3 py-2 rounded-xl border border-[#DDD9D3] text-sm resize-y"
                        placeholder="Conteúdo da aula (outline, tópicos, texto base)…"
                      />
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void handleSaveEdit()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                        style={{ background: '#4D7CFE' }}
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar alterações
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal criar */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => !creating && setShowCreate(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-[#DDD9D3] bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-lg font-bold text-[#1F1F1F] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-500" />
                Nova apresentação
              </h2>
              <div className="space-y-3">
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Título da apresentação"
                  className="w-full h-10 px-3 rounded-xl border border-[#DDD9D3] text-sm"
                />
                <input
                  value={form.topic}
                  onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                  placeholder="Disciplina / tema (opcional)"
                  className="w-full h-10 px-3 rounded-xl border border-[#DDD9D3] text-sm"
                />
                <textarea
                  value={form.inputText}
                  onChange={(e) => setForm((f) => ({ ...f, inputText: e.target.value }))}
                  rows={6}
                  placeholder="Descreva o conteúdo da aula, tópicos, objetivos… A IA do Gamma transformará em slides."
                  className="w-full px-3 py-2 rounded-xl border border-[#DDD9D3] text-sm resize-y"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#A0A0A6] mb-1 block">Nº de slides</label>
                    <input
                      type="number"
                      min={3}
                      max={30}
                      value={form.numCards}
                      onChange={(e) => setForm((f) => ({ ...f, numCards: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl border border-[#DDD9D3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#A0A0A6] mb-1 block">Exportar como</label>
                    <select
                      value={form.exportAs}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, exportAs: e.target.value as SlideExportFormat }))
                      }
                      className="w-full h-10 px-3 rounded-xl border border-[#DDD9D3] text-sm bg-white"
                    >
                      {EXPORT_OPTIONS.map((o) => (
                        <option key={o.key} value={o.key}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  disabled={creating}
                  onClick={() => void handleCreate()}
                  className="flex-1 h-11 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Gerar com Gamma
                </button>
                <button
                  type="button"
                  disabled={creating}
                  onClick={() => setShowCreate(false)}
                  className="px-4 h-11 rounded-xl text-sm text-[#6E6E73] border border-[#DDD9D3]"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
