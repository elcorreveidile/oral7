"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TaskSubmission } from "@/components/upload/task-submission"
import { formatDateSpanish } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface Submission {
  id: string
  content: { files: Array<{ url: string; name: string; type: string; size: number }> }
  feedback?: string | null
  score?: number | null
}

interface SessionAssignment {
  sessionId: string
  sessionNumber: number
  sessionTitle: string
  sessionDate: string
  taskId: string
  taskType: "DOCUMENT_UPLOAD"
}

export default function EntregasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<SessionAssignment[]>([])
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({})
  const [selectedAssignment, setSelectedAssignment] = useState<SessionAssignment | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetch("/api/session-submissions")
      .then((res) => res.json())
      .then((data) => {
        if (data.assignments) {
          setAssignments(data.assignments)
        }
        if (data.submissions) {
          const subsMap: Record<string, Submission> = {}
          data.submissions.forEach((sub: any) => {
            subsMap[sub.taskId] = sub
          })
          setSubmissions(subsMap)
        }
      })
  }, [])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const handleSubmit = async (files: any[]) => {

    // Save submission
    if (!selectedAssignment) {
      return
    }

    const sessionNumber = selectedAssignment.sessionNumber

    try {
      const response = await fetch("/api/session-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionNumber, files }),
      })

      if (!response.ok) {
        const error = await response.json()

        toast({
          variant: "destructive",
          title: "Error al guardar la entrega",
          description: error.details || error.error || "Inténtalo de nuevo",
        })
        return
      }

      const data = await response.json()

      setDialogOpen(false)

      // Reload submissions
      setSubmissions((prev) => ({
        ...prev,
        [selectedAssignment.taskId]: data.submission,
      }))

      toast({
        title: "Entrega guardada",
        description: `${files.length} archivo(s) subido(s) correctamente`,
      })
    } catch (error) {

      toast({
        variant: "destructive",
        title: "Error al guardar la entrega",
        description: error instanceof Error ? error.message : "Inténtalo de nuevo",
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Mis Entregas</h1>
        <p className="text-muted-foreground mt-2">
          Sube tus grabaciones y documentos por sesión
        </p>
      </div>

      <div className="grid gap-4">
        {assignments.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No hay entregas designadas en este momento.
            </CardContent>
          </Card>
        )}
        {assignments.map((assignment) => {
          const taskId = assignment.taskId
          const hasSubmission = submissions[taskId]

          return (
            <Card key={assignment.sessionId} className={hasSubmission ? "border-green-200 dark:border-green-800" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>Sesión {assignment.sessionNumber}</span>
                      {hasSubmission && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription>{assignment.sessionTitle}</CardDescription>
                  </div>
                  <Badge variant="outline">
                    {formatDateSpanish(new Date(assignment.sessionDate))}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {hasSubmission ? (
                      <span>{hasSubmission.content.files.length} archivo(s) subido(s)</span>
                    ) : (
                      <span>Pendiente de entrega</span>
                    )}
                  </div>

                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => setSelectedAssignment(assignment)}
                        variant={hasSubmission ? "outline" : "default"}
                      >
                        {hasSubmission ? (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Añadir más
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Subir entrega
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Subir entrega - Sesión {selectedAssignment?.sessionNumber}</DialogTitle>
                        <DialogDescription>
                          {selectedAssignment?.sessionTitle}
                        </DialogDescription>
                      </DialogHeader>

                      <TaskSubmission
                        taskId={selectedAssignment?.taskId || ""}
                        taskType="ANY"
                        onSubmit={handleSubmit}
                        submitLabel="Guardar entrega"
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                {hasSubmission?.feedback && (
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-900/60 dark:bg-emerald-950/30">
                    <p className="font-medium text-emerald-700 dark:text-emerald-300">Feedback del profesor</p>
                    <p className="mt-1 text-emerald-800 dark:text-emerald-200">{hasSubmission.feedback}</p>
                    {typeof hasSubmission.score === "number" && (
                      <p className="mt-2 text-emerald-700 dark:text-emerald-300">
                        Puntuación: {hasSubmission.score}%
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
