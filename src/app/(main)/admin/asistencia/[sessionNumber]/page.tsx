"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, Calendar, RefreshCw, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDateSpanish } from "@/lib/utils"

type DetailResponse = {
  meta?: { state: "COMPLETED" | "TODAY" | "UPCOMING" | "CANCELLED" }
  session: {
    id: string
    sessionNumber: number
    date: string
    title: string
    subtitle?: string | null
    isExamDay: boolean
  }
  totals: {
    totalStudents: number
    present: number
    absent: number
  }
  present: Array<{
    id: string
    registeredAt: string
    method: string
    user: { id: string; name: string; email: string }
  }>
  absent: Array<{ id: string; name: string; email: string }>
}

type StudentRow = { id: string; name: string; email: string }

export default function AdminAttendanceDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const sessionNumber = params?.sessionNumber as string

  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<DetailResponse | null>(null)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [students, setStudents] = useState<StudentRow[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

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
      const res = await fetch(`/api/admin/attendance/${sessionNumber}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Error al cargar asistencia")
      setData(json)
    } catch (e: any) {
      setError(e?.message || "Error al cargar asistencia")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN" && sessionNumber) {
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.role, sessionNumber])

  const present = useMemo(() => data?.present || [], [data])
  const absent = useMemo(() => data?.absent || [], [data])
  const state = data?.meta?.state
  const isCancelled = state === "CANCELLED"

  if (status === "loading" || session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Detalle de asistencia</h1>
          <p className="text-muted-foreground">
            Sesión {sessionNumber}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/asistencia">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <Button onClick={load} variant="outline" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6 text-destructive">{error}</CardContent>
        </Card>
      )}

      {data && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={data.session.isExamDay ? "granada" : "clm"}>
                    {data.session.isExamDay ? "Examen" : `Sesión ${data.session.sessionNumber}`}
                  </Badge>
                  {state && state === "CANCELLED" ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      Cancelada
                    </Badge>
                  ) : state && state !== "COMPLETED" && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Pendiente
                    </Badge>
                  )}
                </div>
                <CardTitle className="truncate">{data.session.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDateSpanish(new Date(data.session.date))}
                </CardDescription>
                {data.session.subtitle && (
                  <p className="text-sm text-muted-foreground">{data.session.subtitle}</p>
                )}
                {state && state !== "COMPLETED" && state !== "CANCELLED" && (
                  <p className="text-sm text-muted-foreground">
                    Nota: los ausentes solo se calculan cuando la sesión ya se ha impartido.
                  </p>
                )}
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center justify-end gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {data.totals.present}/{data.totals.totalStudents}{" "}
                    {state === "COMPLETED" ? "presentes" : "registrados"}
                  </span>
                </div>
                <div>
                  {state === "COMPLETED" ? `${data.totals.absent} ausentes` : "Ausentes: --"}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Edición manual</CardTitle>
            <CardDescription>
              Marca o desmarca estudiantes presentes. Útil si hubo incidencias (p. ej. sesión cancelada).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  if (!data) return
                  const currentSubtitle = data.session.subtitle || ""
                  const alreadyCancelled = currentSubtitle.toLowerCase().includes("cancelad")

                  setIsSaving(true)
                  setError("")
                  try {
                    let nextSubtitle: string | null
                    if (alreadyCancelled) {
                      const cleaned = currentSubtitle.replace(/^\s*\[CANCELADA\]\s*/i, "").trim()
                      nextSubtitle = cleaned.length > 0 ? cleaned : null
                    } else {
                      const reason = window.prompt(
                        "Motivo de cancelación (se mostrará en la sesión):",
                        "Clase cancelada por aviso meteorológico"
                      )
                      if (reason === null) return
                      nextSubtitle = `[CANCELADA] ${reason}`.trim()
                    }

                    const res = await fetch(`/api/sessions/${sessionNumber}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ subtitle: nextSubtitle }),
                    })
                    const json = await res.json()
                    if (!res.ok) throw new Error(json?.error || "Error al actualizar la sesión")
                    await load()
                  } catch (e: any) {
                    setError(e?.message || "Error al actualizar la sesión")
                  } finally {
                    setIsSaving(false)
                  }
                }}
                disabled={!data || isSaving}
              >
                {data.session.subtitle?.toLowerCase().includes("cancelad") ? "Quitar cancelación" : "Marcar cancelada"}
              </Button>

              <Button
                variant="outline"
                onClick={async () => {
                  if (isEditing) {
                    setIsEditing(false)
                    setStudents([])
                    setSelectedIds(new Set())
                    return
                  }
                  setError("")
                  setIsEditing(true)
                  try {
                    const res = await fetch("/api/students")
                    const json = await res.json()
                    if (!res.ok) throw new Error(json?.error || "No se pudieron cargar los estudiantes")
                    setStudents(Array.isArray(json) ? json.map((s: any) => ({ id: s.id, name: s.name, email: s.email })) : [])
                    setSelectedIds(new Set(present.map((a) => a.user.id)))
                  } catch (e: any) {
                    setError(e?.message || "Error al preparar edición")
                    setIsEditing(false)
                  }
                }}
                disabled={isLoading || isSaving}
              >
                {isEditing ? "Salir de edición" : "Editar asistencia"}
              </Button>

              {isEditing && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedIds(new Set(students.map((s) => s.id)))}
                    disabled={isSaving}
                  >
                    Marcar todos
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedIds(new Set())}
                    disabled={isSaving}
                  >
                    Desmarcar todos
                  </Button>
                  <Button
                    onClick={async () => {
                      setIsSaving(true)
                      setError("")
                      try {
                        const res = await fetch(`/api/admin/attendance/${sessionNumber}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ presentStudentIds: Array.from(selectedIds) }),
                        })
                        const json = await res.json()
                        if (!res.ok) throw new Error(json?.error || "Error al guardar asistencia")
                        await load()
                        setIsEditing(false)
                        setStudents([])
                        setSelectedIds(new Set())
                      } catch (e: any) {
                        setError(e?.message || "Error al guardar asistencia")
                      } finally {
                        setIsSaving(false)
                      }
                    }}
                    disabled={isSaving}
                  >
                    {isSaving ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </>
              )}
            </div>

            {isEditing && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[90px] text-center">Presente</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-muted-foreground">
                          Cargando estudiantes...
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((s) => {
                        const checked = selectedIds.has(s.id)
                        return (
                          <TableRow key={s.id}>
                            <TableCell className="text-center">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  setSelectedIds((prev) => {
                                    const next = new Set(prev)
                                    if (e.target.checked) next.add(s.id)
                                    else next.delete(s.id)
                                    return next
                                  })
                                }}
                                disabled={isSaving}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{s.name}</TableCell>
                            <TableCell className="text-muted-foreground">{s.email}</TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Presentes</CardTitle>
            <CardDescription>{present.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Método</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">Cargando...</TableCell>
                  </TableRow>
                ) : present.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">Sin registros todavía.</TableCell>
                  </TableRow>
                ) : (
                  present.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{a.user.email}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {new Date(a.registeredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{a.method}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ausentes</CardTitle>
            <CardDescription>{absent.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">Cargando...</TableCell>
                  </TableRow>
                ) : state && state !== "COMPLETED" ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      {isCancelled
                        ? "Cancelada (no se calcula asistencia)."
                        : "Pendiente (se calculará tras impartir la sesión)."}
                    </TableCell>
                  </TableRow>
                ) : absent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">Nadie (perfecto).</TableCell>
                  </TableRow>
                ) : (
                  absent.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground">{s.email}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
