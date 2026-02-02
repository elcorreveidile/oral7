"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, BookOpen, CheckCircle2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PerfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const isAdmin = session?.user?.role === "ADMIN"

  // Mock stats - in production, fetch from API
  const userStats = {
    sessionsAttended: 5,
    totalSessions: 27,
    attendanceRate: 85,
    checklistsCompleted: 12,
    totalChecklists: 15,
    lastLogin: new Date().toISOString(),
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Información de tu cuenta y progreso
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
          <CardDescription>
            Tus datos de cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-granada-500 to-clm-600 text-white text-xl font-bold">
              {session?.user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-xl font-semibold">{session?.user?.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {session?.user?.email}
              </p>
              <Badge variant={isAdmin ? "granada" : "clm"} className="w-fit mt-2">
                {isAdmin ? "Profesor (Admin)" : "Estudiante"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Rol</p>
              <p className="font-medium">{isAdmin ? "Profesor" : "Estudiante"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Curso</p>
              <p className="font-medium">Producción e Interacción Oral C1</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Stats - Students only */}
      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Mi Progreso
            </CardTitle>
            <CardDescription>
              Tu rendimiento en el curso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Asistencia</span>
                  <span className="text-sm font-medium">{userStats.attendanceRate}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${userStats.attendanceRate}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {userStats.sessionsAttended} de {userStats.totalSessions} sesiones
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Checklists</span>
                  <span className="text-sm font-medium">
                    {Math.round((userStats.checklistsCompleted / userStats.totalChecklists) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    style={{ width: `${(userStats.checklistsCompleted / userStats.totalChecklists) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {userStats.checklistsCompleted} de {userStats.totalChecklists} completados
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Progreso general</span>
                  <span className="text-sm font-medium">19%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-granada-500 to-clm-600" style={{ width: "19%" }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Sesión 5 de 27
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Último acceso: Hoy</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Info */}
      <Card className="bg-gradient-to-br from-clm-50 to-granada-50 dark:from-clm-950/30 dark:to-granada-950/30 border-clm-200 dark:border-clm-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Información del Curso
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <strong>Curso:</strong> Producción e Interacción Oral Nivel C1
          </p>
          <p>
            <strong>Centro:</strong> Centro de Lenguas Modernas
          </p>
          <p>
            <strong>Universidad:</strong> Universidad de Granada
          </p>
          <p>
            <strong>Curso académico:</strong> 2025-2026
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/configuracion">
              Configuración
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sesiones">
              Ver sesiones
            </Link>
          </Button>
          {!isAdmin && (
            <Button asChild variant="outline">
              <Link href="/asistencia">
                Registrar asistencia
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
