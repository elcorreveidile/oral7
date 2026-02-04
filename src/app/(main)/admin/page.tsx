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
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState("")
  const [checkingBlob, setCheckingBlob] = useState(false)
  const [blobMessage, setBlobMessage] = useState("")

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
    setCurrentDate(new Date())
  }, [status, session, router])

  const handleSyncSessions = async () => {
    setSyncing(true)
    setSyncMessage("")

    try {
      const response = await fetch("/api/admin/sync-sessions", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setSyncMessage(data.message)
      } else {
        setSyncMessage("Error al sincronizar")
      }
    } catch (error) {
      setSyncMessage("Error al sincronizar")
    } finally {
      setSyncing(false)
    }
  }

  const handleCheckBlob = async () => {
    setCheckingBlob(true)
    setBlobMessage("")

    try {
      const response = await fetch("/api/admin/check-blob")

      if (response.ok) {
        const data = await response.json()
        setBlobMessage(data.configured
          ? `✅ ${data.message}`
          : `❌ ${data.message}`)
      } else {
        setBlobMessage("❌ Error al verificar Blob storage")
      }
    } catch (error) {
      setBlobMessage("❌ Error al verificar Blob storage")
    } finally {
      setCheckingBlob(false)
    }
  }

  if (status === "loading" || session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!currentDate) {
    return null // Prevents hydration mismatch
  }

  // Check if course has started (Feb 3, 2026)
  const courseStartDate = new Date("2026-02-03T00:00:00")
  const hasStarted = currentDate >= courseStartDate

  // Stats - will be fetched from API in production
  // Initial state - course starts Feb 3, 2026
  const stats = {
    totalStudents: 15,
    averageAttendance: hasStarted ? 0 : 0,
    currentSession: hasStarted ? 1 : 0,
    totalSessions: 27,
    studentsAtRisk: 0,
    todayAttendance: 0,
  }

  const quickActions = [
    {
      title: "Generar QR",
      description: "Generar código QR de clase",
      icon: QrCode,
      href: "/admin/qr",
      variant: "clm" as const,
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

  // Recent activity - will be fetched from API
  // Empty for now until course starts and we have real data
  const recentActivity: Array<{ student: string; action: string; time: string; session: number }> = []

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
        <Button asChild size="lg" variant="clm">
          <Link href="/admin/qr">
            <QrCode className="mr-2 h-5 w-5" />
            Generar QR de clase
          </Link>
        </Button>
      </div>

      {/* Sync sessions banner */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Sincronizar sesiones</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Actualiza la base de datos con las sesiones de sessions.ts
                </p>
              </div>
              <Button
                onClick={handleSyncSessions}
                disabled={syncing}
                variant="clm"
              >
                {syncing ? "Sincronizando..." : "Sincronizar ahora"}
              </Button>
            </div>
            {syncMessage && (
              <p className="text-sm text-green-700 dark:text-green-300">{syncMessage}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Blob storage check banner */}
      <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">Verificar Blob Storage</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Verifica que Vercel Blob Storage está configurado correctamente
                </p>
              </div>
              <Button
                onClick={handleCheckBlob}
                disabled={checkingBlob}
                variant="outline"
              >
                {checkingBlob ? "Verificando..." : "Verificar"}
              </Button>
            </div>
            {blobMessage && (
              <p className={`text-sm ${blobMessage.startsWith("✅") ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                {blobMessage}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Pendiente de matriculación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de completitud</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasStarted ? `${stats.averageAttendance}%` : "--"}
            </div>
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
              Estudiantes que requieren atención
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

      {/* Recent activity - Takes full width since attendance is removed */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
          <CardDescription>
            Últimas acciones de los estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Sin actividad todavía</p>
              <p className="text-sm">La actividad aparecerá aquí cuando comience el curso</p>
            </div>
          )}
        </CardContent>
      </Card>

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
