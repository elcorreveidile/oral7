"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { QRGenerator } from "@/components/qr/qr-generator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateSpanish } from "@/lib/utils"
import { Users, Calendar } from "lucide-react"
import { Label } from "@/components/ui/label"

export default function AdminQRPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [attendanceCount, setAttendanceCount] = useState(0)
  const [totalStudents, setTotalStudents] = useState<number>(0)
  const [sessions, setSessions] = useState<Array<{ id: string; sessionNumber: number; date: string; title: string }>>(
    []
  )
  const [selectedSessionNumber, setSelectedSessionNumber] = useState<number | null>(null)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  const todayStart = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => a.sessionNumber - b.sessionNumber)
  }, [sessions])

  const currentOrNext = useMemo(() => {
    const s =
      sortedSessions.find((x) => {
        const d = new Date(x.date)
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        return start.getTime() >= todayStart.getTime()
      }) || sortedSessions[sortedSessions.length - 1]
    return s || null
  }, [sortedSessions, todayStart])

  const isTodaySession = useMemo(() => {
    if (!currentOrNext) return false
    const d = new Date(currentOrNext.date)
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    return start.getTime() === todayStart.getTime()
  }, [currentOrNext, todayStart])

  const selectedSession = useMemo(() => {
    if (selectedSessionNumber == null) return currentOrNext
    return sortedSessions.find((s) => s.sessionNumber === selectedSessionNumber) || currentOrNext
  }, [sortedSessions, selectedSessionNumber, currentOrNext])

  const load = async () => {
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        fetch("/api/sessions"),
        fetch("/api/admin/stats"),
      ])

      if (sessionsRes.ok) {
        const json = await sessionsRes.json()
        const loaded = (json?.sessions || []).map((s: any) => ({
          id: s.id,
          sessionNumber: s.sessionNumber,
          date: s.date,
          title: s.title,
        }))
        setSessions(loaded)
      }

      if (statsRes.ok) {
        const stats = await statsRes.json()
        setTotalStudents(stats?.totalStudents || 0)
      }
    } catch {
      // Non-blocking; the QR generator can still work if the session number is selected.
    }
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.role])

  useEffect(() => {
    if (selectedSessionNumber == null && currentOrNext) {
      setSelectedSessionNumber(currentOrNext.sessionNumber)
    }
  }, [selectedSessionNumber, currentOrNext])

  useEffect(() => {
    if (!selectedSession) return
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/attendance/${selectedSession.sessionNumber}`)
        const json = await res.json()
        if (!res.ok) return
        setAttendanceCount(json?.totals?.present ?? 0)
      } catch {
        // Ignore
      }
    })()
  }, [selectedSession?.sessionNumber])

  if (status === "loading" || session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const defaultSessionNumber = selectedSession?.sessionNumber ?? 1

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Control de asistencia</h1>
        <p className="text-muted-foreground mt-2">
          Genera el código QR para que los estudiantes registren su asistencia
        </p>
      </div>

      {/* Current session info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Sesión</CardTitle>
            <div className="flex items-center gap-2">
              {currentOrNext && (
                <Badge variant="outline" className="text-muted-foreground">
                  {isTodaySession ? "Hoy" : "Próxima"}
                </Badge>
              )}
              <Badge variant="clm">Sesión {defaultSessionNumber}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedSessions.length > 0 ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 sm:items-center">
                <div className="min-w-0">
                  <p className="font-medium truncate">{selectedSession?.title}</p>
                  {selectedSession?.date && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDateSpanish(new Date(selectedSession.date))}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="sr-only">Seleccionar sesión</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={String(defaultSessionNumber)}
                    onChange={(e) => setSelectedSessionNumber(parseInt(e.target.value, 10))}
                  >
                    {sortedSessions.map((s) => (
                      <option key={s.id} value={String(s.sessionNumber)}>
                        Sesión {s.sessionNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No se pudieron cargar las sesiones. (El QR seguirá funcionando con el número por defecto.)
            </p>
          )}
        </CardContent>
      </Card>

      {/* QR Generator */}
      <QRGenerator
        sessionNumber={defaultSessionNumber}
        onCodeGenerated={() => {
          // Could refresh attendance count here
        }}
      />

      {/* Attendance stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <Users className="h-5 w-5" />
                <span className="text-2xl font-bold">{attendanceCount}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Registrados hoy
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="h-5 w-5" />
                <span className="text-2xl font-bold">{totalStudents || "--"}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total estudiantes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <h3 className="font-medium mb-2">Instrucciones:</h3>
        <ol className="space-y-1 list-decimal list-inside text-muted-foreground">
          <li>Genera un código QR pulsando el botón</li>
          <li>Proyecta el código en la pantalla del aula</li>
          <li>Los estudiantes escanean con su móvil o introducen el código</li>
          <li>El código expira automáticamente en 15 minutos</li>
          <li>Puedes generar un nuevo código en cualquier momento</li>
        </ol>
      </div>
    </div>
  )
}
