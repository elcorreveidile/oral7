import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin-auth"
import { getAdminStats } from "@/lib/admin-stats"
import Link from "next/link"
import {
  Users,
  BookOpen,
  QrCode,
  BarChart3,
  Calendar,
  Settings,
  AlertCircle,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getGreeting, formatDateSpanish } from "@/lib/utils"
import { Suspense } from "react"

// Loading component for stats
function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cargando...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <div className="animate-pulse">--</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function AdminDashboardPage() {
  // Server-side authentication check - redirects if not admin
  const session = await requireAdmin()

  const currentDate = new Date()

  // Check if course has started (Feb 3, 2026)
  const courseStartDate = new Date("2026-02-03T00:00:00")
  const hasStarted = currentDate >= courseStartDate

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
              Generar QR de clase
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsWrapper hasStarted={hasStarted} />
      </Suspense>

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
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Sin actividad todavía</p>
            <p className="text-sm">La actividad aparecerá aquí cuando comience el curso</p>
          </div>
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

// Separate component to handle stats rendering
async function StatsWrapper({ hasStarted }: { hasStarted: boolean }) {
  const stats = await getAdminStats()

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Pendiente de matriculación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de completitud</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <Progress value={0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesión actual</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <Progress value={0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En riesgo</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Estudiantes que requieren atención
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalStudents ?? "--"}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.totalStudents > 0
              ? "Estudiantes registrados"
              : "Pendiente de matriculación"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de asistencia</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {hasStarted ? `${stats.averageAttendance ?? 0}%` : "--"}
          </div>
          <Progress value={stats.averageAttendance ?? 0} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sesión actual</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.currentSession ?? 1}/{stats.totalSessions ?? 27}
          </div>
          <Progress
            value={((stats.currentSession / stats.totalSessions) * 100)}
            className="mt-2"
          />
        </CardContent>
      </Card>

      <Link href="/admin/estudiantes?filter=atrisk" className="block">
        <Card className={(stats.studentsAtRisk ?? 0) > 0 ? "border-red-200 dark:border-red-800 cursor-pointer hover:shadow-md transition-shadow" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En riesgo</CardTitle>
            <AlertCircle className={`h-4 w-4 ${(stats.studentsAtRisk ?? 0) > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(stats.studentsAtRisk ?? 0) > 0 ? "text-red-500" : ""}`}>
              {stats.studentsAtRisk ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {(stats.studentsAtRisk ?? 0) > 0 ? "Click para ver detalles" : "Estudiantes que requieren atención"}
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
