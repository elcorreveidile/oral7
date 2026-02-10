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
  session: {
    id: string
    sessionNumber: number
    date: string
    title: string
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

export default function AdminAttendanceDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const sessionNumber = params?.sessionNumber as string

  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<DetailResponse | null>(null)
  const [error, setError] = useState("")

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
                </div>
                <CardTitle className="truncate">{data.session.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDateSpanish(new Date(data.session.date))}
                </CardDescription>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center justify-end gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {data.totals.present}/{data.totals.totalStudents} presentes
                  </span>
                </div>
                <div>
                  {data.totals.absent} ausentes
                </div>
              </div>
            </div>
          </CardHeader>
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

