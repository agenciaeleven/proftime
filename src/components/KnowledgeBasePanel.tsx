import { useCallback, useEffect, useRef, useState } from 'react'
import { BookOpen, FileText, Loader2, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
  deleteKnowledgeDocument,
  isKnowledgeApiAvailable,
  listKnowledgeDocuments,
  uploadKnowledgeDocument,
  type KnowledgeDocument,
} from '@/api/knowledge'
import { cn } from '@/lib/utils'

const STATUS_LABEL: Record<KnowledgeDocument['status'], string> = {
  processing: 'Indexando…',
  ready: 'Pronto',
  error: 'Erro',
}

export default function KnowledgeBasePanel() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [subject, setSubject] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    if (!isKnowledgeApiAvailable()) {
      setLoading(false)
      return
    }

    try {
      const docs = await listKnowledgeDocuments()
      setDocuments(docs)
    } catch {
      toast.error('Não foi possível carregar a base de conhecimento')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, 8000)
    return () => clearInterval(timer)
  }, [refresh])

  const handleUpload = async (file: File | undefined) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Envie apenas arquivos PDF')
      return
    }

    setUploading(true)
    try {
      await uploadKnowledgeDocument(file, {
        title: file.name.replace(/\.pdf$/i, ''),
        subject: subject.trim() || undefined,
      })
      toast.success('PDF enviado — indexação em andamento')
      setSubject('')
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar PDF')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteKnowledgeDocument(id)
      toast.success('Documento removido')
      await refresh()
    } catch {
      toast.error('Erro ao remover documento')
    }
  }

  if (!isKnowledgeApiAvailable()) {
    return (
      <div className="rounded-2xl border border-[#DDD9D3] bg-white p-4 text-xs text-[#A0A0A6]">
        Base de conhecimento disponível apenas com API remota configurada.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[#DDD9D3] bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-[#EEECE8] flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-[#4D7CFE]" />
        <div>
          <p className="text-sm font-semibold text-[#1F1F1F]">Base de Conhecimento</p>
          <p className="text-[11px] text-[#A0A0A6]">PDFs usados como contexto pela IA</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Disciplina (opcional)"
          className="w-full h-9 rounded-lg px-3 text-xs border border-[#DDD9D3] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20"
        />

        <label
          className={cn(
            'flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all',
            uploading ? 'border-[#DDD9D3] opacity-60' : 'border-[#DDD9D3] hover:border-[#4D7CFE]/40 hover:bg-[#F8FAFF]',
          )}
        >
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
          {uploading ? (
            <Loader2 className="w-4 h-4 text-[#4D7CFE] animate-spin" />
          ) : (
            <Upload className="w-4 h-4 text-[#4D7CFE]" />
          )}
          <div>
            <p className="text-xs font-medium text-[#1F1F1F]">
              {uploading ? 'Enviando PDF…' : 'Adicionar PDF'}
            </p>
            <p className="text-[11px] text-[#A0A0A6]">Planos, apostilas, materiais de referência</p>
          </div>
        </label>

        {loading ? (
          <div className="flex items-center gap-2 text-xs text-[#A0A0A6] py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Carregando…
          </div>
        ) : documents.length === 0 ? (
          <p className="text-xs text-[#A0A0A6] py-1">Nenhum PDF indexado ainda.</p>
        ) : (
          <ul className="space-y-2 max-h-52 overflow-y-auto">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-[#FAFAF8] border border-[#EEECE8]"
              >
                <FileText className="w-4 h-4 text-[#4D7CFE] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1F1F1F] truncate">{doc.title}</p>
                  <p className="text-[11px] text-[#A0A0A6]">
                    {STATUS_LABEL[doc.status]}
                    {doc.status === 'ready' && doc.chunk_count > 0 ? ` · ${doc.chunk_count} trechos` : ''}
                    {doc.subject ? ` · ${doc.subject}` : ''}
                  </p>
                  {doc.status === 'error' && doc.error_message && (
                    <p className="text-[11px] text-red-500 mt-0.5">{doc.error_message}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  className="p-1 rounded-md hover:bg-red-50 text-[#A0A0A6] hover:text-red-500"
                  aria-label="Remover documento"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
