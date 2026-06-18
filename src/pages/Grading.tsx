import { db } from '@/api/client'
import { asObject } from '@/lib/ai'
import type { AnswerKey, GradingResults } from '@/types'

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileCheck, Upload, CheckCircle, XCircle, BarChart3, Sparkles, FileText, AlertCircle, X, Save, BookOpen, ChevronDown, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const { AnswerKey } = db.entities;

const ALTERNATIVES = ["A", "B", "C", "D"];
const NUM_QUESTIONS = 10;
const initialAnswerKey = Array(NUM_QUESTIONS).fill("");

export default function Grading() {
  const [savedKeys, setSavedKeys] = useState<AnswerKey[]>([])
  const [showSaved, setShowSaved] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveSubject, setSaveSubject] = useState("");

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState("");
  const [answerKey, setAnswerKey] = useState(initialAnswerKey);
  const [maxScore, setMaxScore] = useState("");
  const [step, setStep] = useState("form");
  const [results, setResults] = useState<GradingResults | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const ACCEPTED = ["application/pdf","image/jpeg","image/jpg","image/png"];

  useEffect(() => { AnswerKey.list("-created_date").then(setSavedKeys); }, []);

  const handleSaveKey = async () => {
    if (!saveName.trim()) { toast.error("Informe um nome para o gabarito."); return; }
    if (answerKey.some(a => !a)) { toast.error("Preencha todas as respostas antes de salvar."); return; }
    const created = await AnswerKey.create({ name: saveName, answers: answerKey, max_score: Number(maxScore) || null, subject: saveSubject });
    setSavedKeys(prev => [created, ...prev]);
    setSaveModalOpen(false); setSaveName(""); setSaveSubject("");
    toast.success("Gabarito salvo!");
  };

  const handleLoadKey = (key) => {
    setAnswerKey(key.answers.slice(0, NUM_QUESTIONS).concat(Array(Math.max(0, NUM_QUESTIONS - key.answers.length)).fill("")));
    if (key.max_score) setMaxScore(String(key.max_score));
    setShowSaved(false);
    toast.success(`Gabarito "${key.name}" carregado!`);
  };

  const handleDeleteKey = async (key) => {
    await AnswerKey.delete(key.id);
    setSavedKeys(prev => prev.filter(k => k.id !== key.id));
    toast.success("Gabarito excluído.");
  };

  const handleFileSelect = (selectedFile) => {
    setFileError("");
    if (!selectedFile) return;
    if (!ACCEPTED.includes(selectedFile.type)) { setFileError("Formato inválido. Aceitos: PDF, JPG, PNG."); return; }
    setFile(selectedFile);
  };

  const handleAnswerKey = (index, value) => {
    const updated = [...answerKey]; updated[index] = value; setAnswerKey(updated);
  };

  const validate = () => {
    if (!file) { toast.error("Envie a prova antes de corrigir."); return false; }
    if (answerKey.some(a => !a)) { toast.error("Preencha todas as respostas do gabarito."); return false; }
    if (!maxScore || isNaN(Number(maxScore)) || Number(maxScore) <= 0) { toast.error("Informe uma nota máxima válida."); return false; }
    return true;
  };

  const handleGrade = async () => {
    if (!validate()) return;
    setStep("loading");
    const { file_url } = await db.integrations.Core.UploadFile({ file: file! })
    const result = asObject<{ student_answers?: string[] }>(await db.integrations.Core.InvokeLLM({
      prompt: `Analise a prova do aluno e identifique as respostas para as questões 1 a ${NUM_QUESTIONS}. Gabarito: ${answerKey.map((a,i) => `Q${i+1}:${a}`).join(", ")}. Retorne JSON com student_answers (array de 10 strings A/B/C/D ou ?).`,
      file_urls: [file_url],
      response_json_schema: { type: "object", properties: { student_answers: { type: "array", items: { type: "string" } } } }
    }))
    const studentAnswers = result.student_answers || Array(NUM_QUESTIONS).fill("?")
    let hits = 0;
    const comparison = answerKey.map((correct, i) => {
      const student = studentAnswers[i] || "?";
      const isCorrect = student.toUpperCase() === correct.toUpperCase();
      if (isCorrect) hits++;
      return { question: i + 1, correct, student, isCorrect };
    });
    const max = Number(maxScore);
    setResults({ hits, misses: NUM_QUESTIONS - hits, maxScore: max, finalScore: (hits / NUM_QUESTIONS) * max, comparison });
    setStep("results");
  };

  const reset = () => { setFile(null); setFileError(""); setAnswerKey(initialAnswerKey); setMaxScore(""); setResults(null); setStep("form"); };

  return (
    <div className="min-h-full" style={{ background: "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)" }}>
      <div className="px-6 lg:px-10 py-8 max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-4" style={{ background: "#ECFDF5", border: "1px solid rgba(16,185,129,0.25)" }}>
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs text-emerald-700 font-medium">Correção com IA</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1F1F1F] tracking-tight">Correção de Provas</h1>
          <p className="text-[#6E6E73] text-sm mt-1.5">Envie a prova, configure o gabarito e a IA corrige instantaneamente.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Upload */}
              <div className="rounded-2xl border border-[#DDD9D3] p-6 bg-white shadow-sm">
                <h3 className="text-sm font-semibold text-[#1F1F1F] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-200">1</span>
                  Upload da Prova
                </h3>
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => handleFileSelect(e.target.files[0])} />
                {!file ? (
                  <div
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
                    className={cn("border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer",
                      dragOver ? "border-blue-400 bg-blue-50" : "border-[#DDD9D3] hover:border-[#A0A0A6] hover:bg-[#FAFAF8]"
                    )}
                  >
                    <Upload className={cn("w-9 h-9 mx-auto mb-3 transition-colors", dragOver ? "text-blue-500" : "text-[#A0A0A6]")} />
                    <p className="text-[#1F1F1F] font-medium">Arraste aqui ou clique para selecionar</p>
                    <p className="text-xs text-[#A0A0A6] mt-2">PDF · JPG · PNG</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <FileText className="w-8 h-8 text-emerald-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1F1F1F] truncate">{file.name}</p>
                      <p className="text-xs text-[#A0A0A6]">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={() => setFile(null)} className="p-1.5 rounded-lg hover:bg-[#F1F1EF]"><X className="w-4 h-4 text-[#A0A0A6]" /></button>
                  </div>
                )}
                {fileError && <div className="flex items-center gap-2 mt-3 text-red-500 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{fileError}</div>}
              </div>

              {/* Answer Key */}
              <div className="rounded-2xl border border-[#DDD9D3] p-6 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#1F1F1F] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold border border-violet-200">2</span>
                    Gabarito
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button onClick={() => setShowSaved(s => !s)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-[#DDD9D3] bg-[#FAFAF8] text-[#6E6E73] hover:text-[#1F1F1F] hover:bg-[#F1F1EF] transition-all">
                        <BookOpen className="w-3.5 h-3.5" />
                        Gabaritos salvos ({savedKeys.length})
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <AnimatePresence>
                        {showSaved && (
                          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                            className="absolute right-0 top-9 w-64 rounded-2xl border border-[#DDD9D3] shadow-xl z-20 overflow-hidden bg-white">
                            {savedKeys.length === 0 ? (
                              <p className="text-xs text-[#A0A0A6] text-center py-6">Nenhum gabarito salvo ainda.</p>
                            ) : savedKeys.map(key => (
                              <div key={key.id} className="flex items-center gap-2 px-3 py-2.5 hover:bg-[#FAFAF8] group border-b border-[#F0EDE8] last:border-0">
                                <div className="flex-1 cursor-pointer" onClick={() => handleLoadKey(key)}>
                                  <p className="text-xs font-semibold text-[#1F1F1F]">{key.name}</p>
                                  <p className="text-xs text-[#A0A0A6]">{key.subject || "Sem disciplina"}{key.max_score ? ` · Máx ${key.max_score}pts` : ""}</p>
                                </div>
                                <button onClick={() => handleDeleteKey(key)}
                                  className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-[#A0A0A6] hover:text-red-500 transition-all">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button onClick={() => setSaveModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100 transition-all">
                      <Save className="w-3.5 h-3.5" /> Salvar
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {answerKey.map((value, i) => (
                    <div key={i} className="bg-[#FAFAF8] rounded-xl p-3 border border-[#DDD9D3]">
                      <p className="text-xs text-[#A0A0A6] font-medium mb-2 text-center">Q{i + 1}</p>
                      <div className="grid grid-cols-4 gap-1">
                        {ALTERNATIVES.map(alt => (
                          <button key={alt} onClick={() => handleAnswerKey(i, alt)}
                            className={cn("h-8 rounded-lg text-xs font-bold transition-all",
                              value === alt ? "bg-violet-500 text-white shadow-sm" : "bg-white hover:bg-violet-50 text-[#A0A0A6] hover:text-violet-600 border border-[#DDD9D3]"
                            )}>{alt}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Max Score */}
              <div className="rounded-2xl border border-[#DDD9D3] p-6 bg-white shadow-sm">
                <h3 className="text-sm font-semibold text-[#1F1F1F] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold border border-emerald-200">3</span>
                  Nota Máxima
                </h3>
                <div className="flex items-center gap-4 max-w-xs">
                  <Input type="number" min="1" placeholder="Ex: 10" value={maxScore} onChange={e => setMaxScore(e.target.value)}
                    className="bg-[#FAFAF8] border-[#DDD9D3] rounded-xl text-2xl font-bold text-center text-[#1F1F1F] h-12" />
                  <p className="text-sm text-[#A0A0A6] whitespace-nowrap">pontos no total</p>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleGrade}
                className="w-full h-12 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                style={{ background: "#059669" }}>
                <FileCheck className="w-4 h-4" /> Corrigir com IA
              </motion.button>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-32">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
                  <Sparkles className="w-9 h-9 text-white animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-ping" />
              </div>
              <p className="text-lg font-semibold text-[#1F1F1F] mt-8">Corrigindo prova...</p>
              <p className="text-sm text-[#A0A0A6] mt-1">A IA está analisando as respostas</p>
              <div className="flex gap-1.5 mt-5">
                {[0,1,2].map(i => <motion.div key={i} className="w-2 h-2 rounded-full bg-emerald-500" animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25 }} />)}
              </div>
            </motion.div>
          )}

          {step === "results" && results && (
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Acertos", value: `${results.hits}/${NUM_QUESTIONS}`, color: "#059669", icon: CheckCircle },
                  { label: "Erros", value: `${results.misses}/${NUM_QUESTIONS}`, color: "#ef4444", icon: XCircle },
                  { label: "Nota Máxima", value: results.maxScore, color: "#4D7CFE", icon: BarChart3 },
                  { label: "Nota Final", value: results.finalScore % 1 === 0 ? results.finalScore : results.finalScore.toFixed(1), color: "#a78bfa", icon: Sparkles },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="rounded-2xl border border-[#DDD9D3] p-5 text-center bg-white shadow-sm">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                      <s.icon className="w-5 h-5" style={{ color: s.color }} />
                    </div>
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs text-[#A0A0A6] mt-1">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="rounded-2xl border border-[#DDD9D3] overflow-hidden bg-white shadow-sm">
                <div className="px-5 py-4 border-b border-[#E8E6E1]">
                  <h3 className="font-semibold text-[#1F1F1F]">Comparação com Gabarito</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E8E6E1] bg-[#FAFAF8]">
                        {["Questão","Resposta","Gabarito","Resultado"].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.comparison.map(row => (
                        <motion.tr key={row.question} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: row.question * 0.03 }}
                          className="border-b border-[#F0EDE8] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                          <td className="px-5 py-3.5 text-sm font-medium text-[#1F1F1F]">Q{row.question}</td>
                          <td className="px-5 py-3.5">
                            <span className={cn("text-sm font-bold px-2.5 py-1 rounded-lg", row.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600")}>
                              {row.student || "?"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm font-bold text-[#A0A0A6]">{row.correct}</td>
                          <td className="px-5 py-3.5">
                            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                              row.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600")}>
                              {row.isCorrect ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {row.isCorrect ? "Acerto" : "Erro"}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button onClick={reset} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[#6E6E73] text-sm font-medium border border-[#DDD9D3] bg-white hover:bg-[#F1F1EF] transition-all">
                Nova Correção
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Modal */}
        <AnimatePresence>
          {saveModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSaveModalOpen(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="relative w-80 rounded-2xl border border-[#DDD9D3] p-5 z-10 shadow-xl bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4 text-violet-500" />
                    <h3 className="font-semibold text-[#1F1F1F] text-sm">Salvar Gabarito</h3>
                  </div>
                  <button onClick={() => setSaveModalOpen(false)} className="p-1 rounded-lg hover:bg-[#F1F1EF]"><X className="w-3.5 h-3.5 text-[#A0A0A6]" /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Nome *</label>
                    <input autoFocus value={saveName} onChange={e => setSaveName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSaveKey()}
                      placeholder="Ex: Prova 1 - Matemática"
                      className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none focus:ring-2 focus:ring-[#4D7CFE]/20" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#A0A0A6] uppercase tracking-wider mb-1.5 block">Disciplina</label>
                    <input value={saveSubject} onChange={e => setSaveSubject(e.target.value)}
                      placeholder="Ex: Matemática, Física..."
                      className="w-full h-10 bg-[#FAFAF8] border border-[#DDD9D3] rounded-xl px-3 text-sm text-[#1F1F1F] placeholder:text-[#A0A0A6] focus:outline-none" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleSaveKey}
                    className="flex-1 h-9 rounded-xl text-white text-sm font-semibold"
                    style={{ background: "#4D7CFE" }}>
                    Salvar
                  </button>
                  <button onClick={() => setSaveModalOpen(false)}
                    className="px-4 h-9 rounded-xl text-sm text-[#6E6E73] border border-[#DDD9D3] hover:bg-[#F1F1EF]">Cancelar</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}