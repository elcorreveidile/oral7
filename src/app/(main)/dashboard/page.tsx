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
import { getAllSessions } from "@/data/sessions"

const allSessions = getAllSessions()

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

interface StudentStats {
  attendanceRate: number
  sessionsCompleted: number
  totalSessions: number
  checklistProgress: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const [stats, setStats] = useState<StudentStats>({
    attendanceRate: 0,
    sessionsCompleted: 0,
    totalSessions: 27,
    checklistProgress: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    setCurrentDate(new Date())
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role === "ADMIN") {
      router.push("/admin")
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "STUDENT") {
      fetch("/api/progress")
        .then((res) => res.json())
        .then((data) => {
          setStats(data)
          setStatsLoading(false)
        })
        .catch((error) => {

          setStatsLoading(false)
        })
    }
  }, [status, session])

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

  // Course dates
  const courseStartDate = new Date("2026-02-03T00:00:00")
  const hasStarted = currentDate >= courseStartDate

  const sessionsSorted = [...allSessions].sort((a, b) => a.date.getTime() - b.date.getTime())
  const today = startOfDay(currentDate)
  const currentOrNext =
    sessionsSorted.find((s) => startOfDay(s.date).getTime() >= today.getTime()) ||
    sessionsSorted[sessionsSorted.length - 1]
  const isTodaySession = currentOrNext ? isSameDay(currentOrNext.date, currentDate) : false
  const currentIndex = currentOrNext
    ? sessionsSorted.findIndex((s) => s.sessionNumber === currentOrNext.sessionNumber)
    : -1
  const upcomingSessions =
    currentIndex >= 0
      ? sessionsSorted.slice(currentIndex + 1, currentIndex + 3)
      : sessionsSorted.slice(0, 2)

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
            <div className="text-2xl font-bold">
              {hasStarted ? `${stats.attendanceRate}%` : "--"}
            </div>
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
            <div className="text-2xl font-bold">
              {hasStarted ? `${stats.checklistProgress}%` : "--"}
            </div>
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
          <h2 className="text-xl font-semibold">
            {hasStarted ? "Sesión actual" : "Primera sesión"}
          </h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/sesiones">
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {currentOrNext && (
          <Card className={`session-card border-primary ${isTodaySession ? "today" : "future"}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="clm">Sesión {currentOrNext.sessionNumber}</Badge>
                  {!hasStarted ? (
                    <Badge variant="outline">Próximamente</Badge>
                  ) : isTodaySession ? (
                    <Badge variant="success">Hoy</Badge>
                  ) : (
                    <Badge variant="outline">Próxima</Badge>
                  )}
                </div>
                <CardTitle className="text-xl">
                  {currentOrNext.title}
                </CardTitle>
                <CardDescription>
                  Bloque {currentOrNext.blockNumber}: {currentOrNext.blockTitle}
                </CardDescription>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateSpanish(currentOrNext.date)}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/sesiones/${currentOrNext.sessionNumber}`}>
                <BookOpen className="mr-2 h-4 w-4" />
                Ver contenidos
              </Link>
            </Button>
          </CardContent>
          </Card>
        )}
      </section>

      {/* Upcoming sessions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Próximas sesiones</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {upcomingSessions.map((session) => (
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
