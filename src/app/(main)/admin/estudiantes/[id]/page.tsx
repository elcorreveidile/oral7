"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  User,
  BarChart3,
  BookOpen,
  FileText,
  Trophy,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StudentDetail {
  id: string
  name: string
  email: string
  createdAt: string
  attendances: Array<{
    id: string
    registeredAt: string
    method: string
    session: {
      sessionNumber: number
      title: string
      date: string
    }
  }>
  progress: Array<{
    id: string
    viewedAt: string | null
    timeSpent: number
    lastAccess: string
    modePreference: string
    session: {
      sessionNumber: number
      title: string
      date: string
    }
  }>
  checklistItems: Array<{
    id: string
    isCompleted: boolean
    completedAt: string | null
  }>
  submissions: Array<{
    id: string
    content: any
    score: number | null
    feedback: string | null
    task: {
      title: string
      session: {
        sessionNumber: number
        title: string
      }
    }
  }>
}

export default function StudentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchStudentDetail()
    }
  }, [status, session, params.id])

  const fetchStudentDetail = async () => {
    try {
      const response = await fetch(`/api/students/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setStudent(data)
      }
    } catch (error) {
      console.error("Error fetching student detail:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAttendancePercentage = () => {
    if (!student) return 0
    const totalSessions = 15 // Total sessions in the course
    return Math.round((student.attendances.length / totalSessions) * 100)
  }

  const calculateProgressPercentage = () => {
    if (!student) return 0
    const totalSessions = 15
    return Math.round((student.progress.length / totalSessions) * 100)
  }

  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const totalTimeSpent = () => {
    if (!student) return 0
    return student.progress.reduce((total, p) => total + p.timeSpent, 0)
  }

  const averageModePreference = () => {
    if (!student || student.progress.length === 0) return "N/A"
    const modeA = student.progress.filter((p) => p.modePreference === "A").length
    const modeB = student.progress.filter((p) => p.modePreference === "B").length
    if (modeA > modeB) return "Modo A (Integrador)"
    if (modeB > modeA) return "Modo B (Analítico)"
    return "Equilibrado"
  }

  if (status === "loading" || session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Estudiante no encontrado</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/admin/estudiantes">Volver a la lista</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/estudiantes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{student.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {student.email}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateAttendancePercentage()}%</div>
            <Progress value={calculateAttendancePercentage()} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {student.attendances.length} de 15 sesiones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateProgressPercentage()}%</div>
            <Progress value={calculateProgressPercentage()} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {student.progress.length} sesiones vistas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTimeSpent(totalTimeSpent())}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Tiempo en la plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preferencia</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{averageModePreference()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Modo de aprendizaje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detail Tabs */}
      <Tabs defaultValue="attendances" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendances">
            Asistencias ({student.attendances.length})
          </TabsTrigger>
          <TabsTrigger value="progress">
            Progreso ({student.progress.length})
          </TabsTrigger>
          <TabsTrigger value="submissions">
            Tareas ({student.submissions.length})
          </TabsTrigger>
          <TabsTrigger value="checklist">
            Checklist ({student.checklistItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Asistencias</CardTitle>
              <CardDescription>Registro de todas las asistencias del estudiante</CardDescription>
            </CardHeader>
            <CardContent>
              {student.attendances.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay registros de asistencia
                </p>
              ) : (
                <div className="space-y-3">
                  {student.attendances.map((attendance) => (
                    <div
                      key={attendance.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="w-12 text-center">
                        <div className="text-lg font-bold text-primary">
                          {attendance.session.sessionNumber}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{attendance.session.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(attendance.session.date).toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {attendance.method === "QR_SCAN" ? "QR" : attendance.method === "MANUAL_CODE" ? "Manual" : "Admin"}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {new Date(attendance.registeredAt).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progreso de Sesiones</CardTitle>
              <CardDescription>Sesiones vistas y tiempo dedicado</CardDescription>
            </CardHeader>
            <CardContent>
              {student.progress.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay registros de progreso
                </p>
              ) : (
                <div className="space-y-3">
                  {student.progress.map((prog) => (
                    <div
                      key={prog.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="w-12 text-center">
                        <div className="text-lg font-bold text-primary">
                          {prog.session.sessionNumber}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{prog.session.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Último acceso: {new Date(prog.lastAccess).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={prog.modePreference === "A" ? "default" : "secondary"}>
                          Modo {prog.modePreference}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatTimeSpent(prog.timeSpent)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tareas Entregadas</CardTitle>
              <CardDescription>Trabajos y ejercicios completados</CardDescription>
            </CardHeader>
            <CardContent>
              {student.submissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay tareas entregadas
                </p>
              ) : (
                <div className="space-y-3">
                  {student.submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{submission.task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Sesión {submission.task.session.sessionNumber}: {submission.task.session.title}
                        </p>
                      </div>
                      <div className="text-right">
                        {submission.score !== null ? (
                          <Badge variant="default">
                            {submission.score}%
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pendiente</Badge>
                        )}
                        {submission.feedback && (
                          <p className="text-sm text-muted-foreground mt-1 max-w-xs truncate">
                            "{submission.feedback}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Items de Checklist Completados</CardTitle>
              <CardDescription>Autoevaluaciones realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {student.checklistItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay items de checklist completados
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold">
                    {student.checklistItems.length} items completados
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Registration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Registro</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Fecha de registro</p>
              <p className="font-medium">
                {new Date(student.createdAt).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">ID de usuario</p>
              <p className="font-medium text-sm">{student.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
