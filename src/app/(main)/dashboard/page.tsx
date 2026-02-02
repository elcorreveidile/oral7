"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  QrCode,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatDateSpanish } from "@/lib/utils"

interface DashboardStats {
  totalStudents: number
  totalSessions: number
  currentSession: number
}

interface SessionInfo {
  id: string
  sessionNumber: number
  title: string
  date: Date
}

// Mock data - se reemplazará con datos reales de la API
const mockCurrentSession: SessionInfo = {
  id: "session-1",
  sessionNumber: 1,
  title: "Toma de contacto e interacción social",
  date: new Date("2026-02-03"),
}

const mockUpcomingSessions: SessionInfo[] = [
  {
    id: "session-2",
    sessionNumber: 2,
    title: "Socialización y registro: tutear vs. usted",
    date: new Date("2026-02-05"),
  },
  {
    id: "session-3",
    sessionNumber: 3,
    title: "Los bares como espacios de interacción",
    date: new Date("2026-02-10"),
  },
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    setCurrentDate(new Date())

    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    // Cargar estadísticas reales
    if (status === "authenticated") {
      fetch("/api/dashboard/stats")
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch(() => {
          // Si falla, usar valores por defecto
          setStats({
            totalStudents: 0,
            totalSessions: 27,
            currentSession: 1,
          })
        })
    }
  }, [status])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!currentDate) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const getGreetingForDate = (date: Date) => {
    const hour = date.getHours()
    if (hour < 12) return "Buenos días"
    if (hour < 20) return "Buenas tardes"
    return "Buenas noches"
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          {getGreetingForDate(currentDate)}, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          {formatDateSpanish(currentDate)}
        </p>
      </div>

      {/* Quick stats - ahora muestra datos reales o "Sin datos" */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Registrados en el curso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.currentSession ?? 1}/{stats?.totalSessions ?? 27}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Sesión actual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.currentSession ? Math.round((stats.currentSession / 27) * 100) : 0}%
            </div>
            <Progress
              value={stats?.currentSession ? (stats.currentSession / 27) * 100 : 0}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Del curso completado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-clm-500 to-clm-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Asistencia
            </CardTitle>
            <QrCode className="h-4 w-4 text-white/90" />
          </CardHeader>
          <CardContent>
            <p className="text-white/80 text-sm mb-3">
              Registra tu asistencia
            </p>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/asistencia">
                <QrCode className="mr-2 h-4 w-4" />
                Escanear QR
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Current/Today's session */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Sesión actual</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/sesiones">
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Card className="session-card today border-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="clm">Sesión {mockCurrentSession.sessionNumber}</Badge>
                  <Badge variant="success">Hoy</Badge>
                </div>
                <CardTitle className="text-xl">
                  {mockCurrentSession.title}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/sesiones/${mockCurrentSession.sessionNumber}`}>
                <BookOpen className="mr-2 h-4 w-4" />
                Ir a la sesión
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Upcoming sessions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Próximas sesiones</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {mockUpcomingSessions.map((sessionInfo) => (
            <Card key={sessionInfo.id} className="session-card future">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant="outline">Sesión {sessionInfo.sessionNumber}</Badge>
                    <CardTitle className="text-lg">{sessionInfo.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateSpanish(sessionInfo.date)}</span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
