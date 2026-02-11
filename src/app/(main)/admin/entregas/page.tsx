"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Download, FileText, User, Calendar, Loader2, MessageSquare, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { formatDateSpanish } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface Submission {
  id: string
  taskId: string
  userId: string
  userName: string
  userEmail: string
  sessionNumber: number
  sessionTitle: string
  sessionDate: Date
  files: Array<{ url: string; name: string; type: string; size: number }>
  score: number | null
  feedback: string | null
  canPurgeFiles: boolean
  filesPurged: boolean
  createdAt: Date
  updatedAt: Date
}

export default function AdminEntregasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({})
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({})
  const [savingById, setSavingById] = useState<Record<string, boolean>>({})
  const [purgingById, setPurgingById] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  const hydrateDrafts = (items: Submission[]) => {
    const nextFeedback: Record<string, string> = {}
    const nextScore: Record<string, string> = {}

    items.forEach((submission) => {
      nextFeedback[submission.id] = submission.feedback || ""
      nextScore[submission.id] = submission.score !== null ? String(submission.score) : ""
    })

    setFeedbackDrafts(nextFeedback)
    setScoreDrafts(nextScore)
  }

  const loadSubmissions = useCallback(() => {
    setLoading(true)
    fetch("/api/admin/submissions")
      .then((res) => res.json())
      .then((data) => {
        if (data.submissions) {
          setSubmissions(data.submissions)
          hydrateDrafts(data.submissions)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      loadSubmissions()
    }
  }, [status, session, loadSubmissions])

  const updateSubmission = (id: string, partial: Partial<Submission>) => {
    setSubmissions((prev) =>
      prev.map((submission) =>
        submission.id === id
          ? {
              ...submission,
              ...partial,
            }
          : submission
      )
    )
  }

  const saveFeedback = async (submissionId: string) => {
    const feedback = (feedbackDrafts[submissionId] || "").trim()
    const rawScore = (scoreDrafts[submissionId] || "").trim()

    if (!feedback) {
      toast({
        variant: "destructive",
        title: "Feedback requerido",
        description: "Debes escribir una respuesta para el estudiante.",
      })
      return
    }

    let score: number | null = null
    if (rawScore.length > 0) {
      const parsed = Number(rawScore)
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
        toast({
          variant: "destructive",
          title: "Puntuación inválida",
          description: "La puntuación debe estar entre 0 y 100.",
        })
        return
      }
      score = parsed
    }

    setSavingById((prev) => ({ ...prev, [submissionId]: true }))
    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback, score }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || "No se pudo guardar el feedback")
      }

      updateSubmission(submissionId, {
        feedback: data?.submission?.feedback ?? feedback,
        score: data?.submission?.score ?? score,
        canPurgeFiles: true,
      })

      toast({
        title: "Feedback guardado",
        description: "La respuesta al estudiante se guardó correctamente.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al guardar feedback",
        description: error instanceof Error ? error.message : "Inténtalo de nuevo",
      })
    } finally {
      setSavingById((prev) => ({ ...prev, [submissionId]: false }))
    }
  }

  const purgeFiles = async (submission: Submission) => {
    if (!submission.feedback || submission.feedback.trim().length === 0) {
      toast({
        variant: "destructive",
        title: "Feedback pendiente",
        description: "Primero responde al estudiante y guarda el feedback.",
      })
      return
    }

    if (submission.files.length === 0) {
      toast({
        title: "Sin archivos",
        description: "Esta entrega ya no tiene archivos para borrar.",
      })
      return
    }

    const confirmed = window.confirm(
      "¿Seguro que quieres borrar los archivos de esta entrega? Esta acción libera espacio y no se puede deshacer."
    )
    if (!confirmed) return

    setPurgingById((prev) => ({ ...prev, [submission.id]: true }))
    try {
      const response = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: "DELETE",
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || "No se pudieron borrar los archivos")
      }

      updateSubmission(submission.id, {
        files: [],
        filesPurged: true,
        canPurgeFiles: false,
      })

      toast({
        title: "Archivos eliminados",
        description: `Se liberó espacio de la entrega de ${submission.userName}.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al borrar archivos",
        description: error instanceof Error ? error.message : "Inténtalo de nuevo",
      })
    } finally {
      setPurgingById((prev) => ({ ...prev, [submission.id]: false }))
    }
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando entregas...</p>
        </div>
      </div>
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("audio/")) return "🎵"
    if (type.startsWith("video/")) return "🎬"
    if (type.includes("pdf")) return "📄"
    if (type.includes("word")) return "📝"
    return "📎"
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Entregas de Estudiantes</h1>
        <p className="text-muted-foreground mt-2">
          Revisa archivos, responde y limpia almacenamiento cuando proceda
        </p>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No hay entregas todavía
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{submission.userName}</span>
                      <span className="text-sm text-muted-foreground">{submission.userEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Sesión {submission.sessionNumber}: {submission.sessionTitle}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Entregado: {formatDateSpanish(new Date(submission.createdAt))}
                    </div>
                    {submission.feedback && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400">
                        Feedback enviado
                      </div>
                    )}
                  </div>
                  <Badge variant="outline">
                    {submission.files.length} archivo(s)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submission.files.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                      Archivos eliminados para liberar espacio.
                    </div>
                  ) : (
                    submission.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl">{getFileIcon(file.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(file.url, "_blank")}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                    ))
                  )}

                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <MessageSquare className="h-4 w-4" />
                      Respuesta al estudiante
                    </div>

                    <Textarea
                      value={feedbackDrafts[submission.id] ?? ""}
                      onChange={(event) =>
                        setFeedbackDrafts((prev) => ({
                          ...prev,
                          [submission.id]: event.target.value,
                        }))
                      }
                      placeholder="Escribe feedback para el estudiante"
                      rows={3}
                    />

                    <div className="max-w-[180px]">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={scoreDrafts[submission.id] ?? ""}
                        onChange={(event) =>
                          setScoreDrafts((prev) => ({
                            ...prev,
                            [submission.id]: event.target.value,
                          }))
                        }
                        placeholder="Puntuación (0-100)"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => saveFeedback(submission.id)}
                        disabled={savingById[submission.id] || purgingById[submission.id]}
                      >
                        {savingById[submission.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar feedback
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => purgeFiles(submission)}
                        disabled={
                          purgingById[submission.id] ||
                          savingById[submission.id] ||
                          submission.files.length === 0 ||
                          !(submission.feedback || feedbackDrafts[submission.id])?.trim()
                        }
                      >
                        {purgingById[submission.id] ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Borrar archivos
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
