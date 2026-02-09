"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Users,
  BookOpen,
  QrCode,
  BarChart3,
  Calendar,
  Settings,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getGreeting, formatDateSpanish } from "@/lib/utils"

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageAttendance: 0,
    currentSession: 1,
    totalSessions: 27,
    studentsAtRisk: 0,
    todayAttendance: 0,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
    setCurrentDate(new Date())
  }, [status, session, router])

  useEffect(() => {
    if (!mounted) return

    // Cargar estadísticas reales
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats((prev) => ({
          ...prev,
          totalStudents: data.totalStudents,
          currentSession: data.currentSession,
          totalSessions: data.totalSessions,
        }))
      })
      .catch(() => {
        // Si falla, mantener valores por defecto
      })
  }, [mounted])

  if (status === "loading" || session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!currentDate || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const quickActions = [
    {
      title: "Generar QR",
      description: "Crear código de asistencia",
      icon: QrCode,
      href: "/admin/asistencia",
      variant: "clm" as const,
    },
    {
      title: "Códigos de registro",
      description: "Gestionar registros",
      icon: Users,
      href: "/admin/codigos",
      variant: "outline" as const,
    },
    {
      title: "Ver estudiantes",
      description: "Lista y progreso",
      icon: Users,
      href: "/admin/estudiantes",
      variant: "outline" as const,
    },
    {
      title: "Gestionar sesiones",
      description: "Editar contenidos",
      icon: BookOpen,
      href: "/admin/sesiones",
      variant: "outline" as const,
    },
    {
      title: "Estadísticas",
      description: "Análisis del curso",
      icon: BarChart3,
      href: "/admin/estadisticas",
      variant: "outline" as const,
    },
  ]

  const recentActivity = [
    { student: "María Chen", action: "registró asistencia", time: "hace 5 min", session: 5 },
    { student: "John Smith", action: "completó checklist", time: "hace 12 min", session: 4 },
    { student: "Li Wei", action: "registró asistencia", time: "hace 15 min", session: 5 },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {getGreeting()}, Profesor
          </h1>
          <p className="text-muted-foreground">
            {formatDateSpanish(currentDate)} · Panel de control
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild size="lg" variant="outline">
            <Link href="/admin/mantenimiento">
              <Settings className="mr-2 h-5 w-5" />
              Mantenimiento
            </Link>
          </Button>
          <Button asChild size="lg" variant="clm">
            <Link href="/admin/qr">
              <QrCode className="mr-2 h-5 w-5" />
              Generar código QR
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Matriculados en el curso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia media</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
            <Progress value={stats.averageAttendance} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesión actual</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.currentSession}/{stats.totalSessions}
            </div>
            <Progress
              value={(stats.currentSession / stats.totalSessions) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card className={stats.studentsAtRisk > 0 ? "border-red-200 dark:border-red-800" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En riesgo</CardTitle>
            <AlertCircle className={`h-4 w-4 ${stats.studentsAtRisk > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.studentsAtRisk > 0 ? "text-red-500" : ""}`}>
              {stats.studentsAtRisk}
            </div>
            <p className="text-xs text-muted-foreground">
              Estudiantes bajo 80% asistencia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Acciones rápidas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      action.variant === "clm"
                        ? "bg-clm-100 text-clm-600 dark:bg-clm-900/30 dark:text-clm-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Today's class and recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's attendance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Asistencia de hoy</CardTitle>
              <Badge variant="success">
                {stats.todayAttendance}/{stats.totalStudents}
              </Badge>
            </div>
            <CardDescription>
              Sesión {stats.currentSession} - Registros de asistencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress
                value={(stats.todayAttendance / stats.totalStudents) * 100}
                className="h-4"
              />
              <p className="text-sm text-muted-foreground">
                {stats.totalStudents - stats.todayAttendance} estudiantes sin registrar
              </p>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/admin/asistencia">
                Ver detalle
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>
              Últimas acciones de los estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{activity.student}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.action} · Sesión {activity.session}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Próximas fechas importantes</CardTitle>
            <CardDescription>Exámenes y días festivos</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/calendario">
              <Calendar className="mr-2 h-4 w-4" />
              Ver calendario
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-granada-50 dark:bg-granada-950/30">
              <div className="w-12 text-center">
                <div className="text-lg font-bold text-granada-600">26</div>
                <div className="text-xs text-granada-500">MAR</div>
              </div>
              <div>
                <p className="font-medium">Examen parcial</p>
                <p className="text-sm text-muted-foreground">Evaluación oral individual</p>
              </div>
              <Badge variant="granada" className="ml-auto">Examen</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="w-12 text-center">
                <div className="text-lg font-bold">30</div>
                <div className="text-xs text-muted-foreground">MAR</div>
              </div>
              <div>
                <p className="font-medium">Semana Santa</p>
                <p className="text-sm text-muted-foreground">Sin clase hasta el 3 de abril</p>
              </div>
              <Badge variant="secondary" className="ml-auto">Festivo</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-granada-50 dark:bg-granada-950/30">
              <div className="w-12 text-center">
                <div className="text-lg font-bold text-granada-600">21</div>
                <div className="text-xs text-granada-500">MAY</div>
              </div>
              <div>
                <p className="font-medium">Examen final</p>
                <p className="text-sm text-muted-foreground">Evaluación oral final</p>
              </div>
              <Badge variant="granada" className="ml-auto">Examen</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
