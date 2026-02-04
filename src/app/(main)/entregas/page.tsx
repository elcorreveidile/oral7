"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Upload, FileText, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TaskSubmission } from "@/components/upload/task-submission"
import { formatDateSpanish } from "@/lib/utils"

interface Submission {
  id: string
  content: { files: Array<{ url: string; name: string; type: string; size: number }> }
}

export default function EntregasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({})
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    // Load sessions
    fetch("/api/sessions")
      .then((res) => res.json())
      .then((data) => {
        if (data.sessions) {
          setSessions(data.sessions)
        }
      })

    // Load submissions
    fetch("/api/submissions")
      .then((res) => res.json())
      .then((data) => {
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
    const taskId = `session-${selectedSession.sessionNumber}`

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, files }),
    })

    if (response.ok) {
      setDialogOpen(false)
      // Reload submissions
      const data = await response.json()
      setSubmissions((prev) => ({
        ...prev,
        [taskId]: data.submission,
      }))
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
        {sessions.map((session) => {
          const taskId = `session-${session.sessionNumber}`
          const hasSubmission = submissions[taskId]

          return (
            <Card key={session.id} className={hasSubmission ? "border-green-200 dark:border-green-800" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>Sesión {session.sessionNumber}</span>
                      {hasSubmission && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription>{session.title}</CardDescription>
                  </div>
                  <Badge variant="outline">
                    {formatDateSpanish(session.date)}
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
                        onClick={() => setSelectedSession(session)}
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
                        <DialogTitle>Subir entrega - Sesión {selectedSession?.sessionNumber}</DialogTitle>
                        <DialogDescription>
                          {selectedSession?.title}
                        </DialogDescription>
                      </DialogHeader>

                      <TaskSubmission
                        taskId={`session-${selectedSession?.sessionNumber}`}
                        taskType="ANY"
                        onSubmit={handleSubmit}
                        submitLabel="Guardar entrega"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
