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
  TrendingUp,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getGreeting, formatDateSpanish } from "@/lib/utils"

// Mock data for demonstration
const mockCurrentSession = {
  id: "session-1",
  sessionNumber: 1,
  title: "Toma de contacto e interacción social",
  date: new Date(2026, 1, 3), // Feb 3, 2026
  blockNumber: 1,
  blockTitle: "La argumentación formal",
}

const mockUpcomingSessions = [
  {
    id: "session-2",
    sessionNumber: 2,
    title: "Socialización y registro: tutear vs. usted",
    date: new Date(2026, 1, 5),
  },
  {
    id: "session-3",
    sessionNumber: 3,
    title: "Los bares como espacios de interacción",
    date: new Date(2026, 1, 10),
  },
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentDate(new Date())
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!currentDate) {
    return null // Prevent hydration mismatch
  }

  // Calculate greeting based on current date
  const getGreetingForDate = (date: Date) => {
    const hour = date.getHours()
    if (hour < 12) return "Buenos días"
    if (hour < 20) return "Buenas tardes"
    return "Buenas noches"
  }

  // Stats (mock data)
  const stats = {
    attendanceRate: 85,
    sessionsCompleted: 5,
    totalSessions: 27,
    checklistProgress: 72,
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

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <Progress value={stats.attendanceRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Mínimo requerido: 80%
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
              {stats.sessionsCompleted}/{stats.totalSessions}
            </div>
            <Progress
              value={(stats.sessionsCompleted / stats.totalSessions) * 100}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Progreso del curso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Autoevaluación</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checklistProgress}%</div>
            <Progress value={stats.checklistProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Objetivos completados
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
                <CardDescription>
                  Bloque {mockCurrentSession.blockNumber}: {mockCurrentSession.blockTitle}
                </CardDescription>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateSpanish(mockCurrentSession.date)}</span>
                </div>
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
          {mockUpcomingSessions.map((session) => (
            <Card key={session.id} className="session-card future">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant="outline">Sesión {session.sessionNumber}</Badge>
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatDateSpanish(session.date)}</span>
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
