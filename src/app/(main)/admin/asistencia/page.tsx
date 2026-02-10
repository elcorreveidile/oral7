"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Calendar, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDateSpanish } from "@/lib/utils"

type SessionRow = {
  id: string
  sessionNumber: number
  date: string
  title: string
  subtitle?: string | null
  isExamDay: boolean
  _count?: { attendances: number }
}

export default function AdminAttendanceOverviewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [totalStudents, setTotalStudents] = useState<number>(0)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  const load = async () => {
    setIsLoading(true)
    setError("")
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        fetch("/api/sessions"),
        fetch("/api/admin/stats"),
      ])

      if (!sessionsRes.ok) throw new Error("No se pudieron cargar las sesiones")
      if (!statsRes.ok) throw new Error("No se pudieron cargar las estadísticas")

      const sessionsJson = await sessionsRes.json()
      const statsJson = await statsRes.json()

      setSessions((sessionsJson.sessions || []).map((s: any) => ({
        id: s.id,
        sessionNumber: s.sessionNumber,
        date: s.date,
        title: s.title,
        subtitle: s.subtitle ?? null,
        isExamDay: !!s.isExamDay,
        _count: s._count,
      })))
      setTotalStudents(statsJson.totalStudents || 0)
    } catch (e: any) {
      setError(e?.message || "Error al cargar la asistencia")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.role])

  const rows = useMemo(() => {
    return [...sessions].sort((a, b) => a.sessionNumber - b.sessionNumber)
  }, [sessions])

  const todayStart = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])

  if (status === "loading" || session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Asistencia</h1>
          <p className="text-muted-foreground">
            Resumen por sesión (clic en una sesión para ver el detalle).
          </p>
        </div>
        <Button onClick={load} variant="outline" disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6 text-destructive">{error}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Asistencia por sesión</CardTitle>
          <CardDescription>
            {totalStudents > 0 ? `${totalStudents} estudiantes` : "Sin estudiantes todavía"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sesión</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="text-center">Asistencias</TableHead>
                <TableHead className="text-center">%</TableHead>
                <TableHead className="text-right">Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No hay sesiones.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((s) => {
                  const count = s._count?.attendances ?? 0
                  const sessionDate = new Date(s.date)
                  const sessionStart = new Date(
                    sessionDate.getFullYear(),
                    sessionDate.getMonth(),
                    sessionDate.getDate()
                  )
                  const isCancelled = (s.subtitle || "").toLowerCase().includes("cancelad")
                  const isCompleted = sessionStart < todayStart && !isCancelled

                  const pct =
                    isCompleted && totalStudents > 0 ? Math.round((count / totalStudents) * 100) : null

                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Badge variant={s.isExamDay ? "granada" : "clm"}>
                            {s.isExamDay ? "Examen" : `Sesión ${s.sessionNumber}`}
                          </Badge>
                          {isCancelled ? (
                            <Badge variant="outline" className="text-muted-foreground">
                              Cancelada
                            </Badge>
                          ) : !isCompleted && (
                            <Badge variant="outline" className="text-muted-foreground">
                              Pendiente
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateSpanish(new Date(s.date))}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[420px]">
                        <span className="line-clamp-1">{s.title}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {isCancelled ? "--" : `${count}/${totalStudents || "--"}`}
                      </TableCell>
                      <TableCell className="text-center min-w-[160px]">
                        <div className="flex items-center gap-2 justify-center">
                          <span className="text-xs text-muted-foreground w-10 text-right">
                            {pct === null ? "--" : `${pct}%`}
                          </span>
                          <div className="w-24">
                            <Progress value={pct ?? 0} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/asistencia/${s.sessionNumber}`}>Ver</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
