"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Calendar, BookOpen, GraduationCap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Course schedule data - Updated from sessions.ts (Feb 3 to May 14, 2026)
const courseSchedule = [
  { date: "2026-02-03", sessionNumber: 1, title: 'Presentación del curso y dinámicas de integración', block: 1 },
  { date: "2026-02-05", sessionNumber: 2, title: 'Conectores de la argumentación oral', block: 1 },
  { date: "2026-02-10", sessionNumber: 3, title: 'Expresar opiniones, actitudes y conocimientos', block: 1 },
  { date: "2026-02-12", sessionNumber: 4, title: 'El registro formal', block: 1 },
  { date: "2026-02-17", sessionNumber: 5, title: 'Acuerdo y desacuerdo', block: 1 },
  { date: "2026-02-19", sessionNumber: 6, title: 'La contraargumentación', block: 1 },
  { date: "2026-03-03", sessionNumber: 9, title: 'Análisis y feedback del debate', block: 1 },
  { date: "2026-03-05", sessionNumber: 10, title: 'Narrar en el pasado', block: 2 },
  { date: "2026-03-10", sessionNumber: 11, title: 'Indicadores temporales precisos', block: 2 },
  { date: "2026-03-12", sessionNumber: 12, title: 'Relatar acontecimientos históricos', block: 2 },
  { date: "2026-03-17", sessionNumber: 13, title: 'La hipótesis (Presente y Futuro)', block: 2 },
  { date: "2026-03-19", sessionNumber: 14, title: 'La hipótesis (Pasado)', block: 2 },
  { date: "2026-03-24", sessionNumber: 15, title: 'Preparación para el parcial', block: 2 },
  { date: "2026-04-07", sessionNumber: 17, title: 'Bienvenida post-vacaciones', block: 2 },
  { date: "2026-04-09", sessionNumber: 18, title: 'La entrevista', block: 2 },
  { date: "2026-04-14", sessionNumber: 19, title: 'Estrategias de interacción', block: 2 },
  { date: "2026-04-16", sessionNumber: 20, title: 'El estilo indirecto', block: 2 },
  { date: "2026-04-21", sessionNumber: 21, title: 'Estrategias de influencia', block: 2 },
  { date: "2026-04-23", sessionNumber: 22, title: 'Lenguaje persuasivo', block: 2 },
  { date: "2026-04-28", sessionNumber: 23, title: 'La Conferencia (I)', block: 2 },
  { date: "2026-04-30", sessionNumber: 24, title: 'La Conferencia (II)', block: 2 },
  { date: "2026-05-05", sessionNumber: 25, title: 'Diferencias entre registro coloquial y formal', block: 3 },
  { date: "2026-05-07", sessionNumber: 26, title: '"Los tacos"', block: 3 },
  { date: "2026-05-12", sessionNumber: 27, title: 'Vocabulario abstracto', block: 3 },
  { date: "2026-05-14", sessionNumber: 28, title: 'Última clase: Presentaciones finales', block: 3 },
]

const importantDates = [
  { date: "2026-03-26", title: "Examen parcial", description: "Evaluación oral individual", type: "exam" },
  { date: "2026-03-30", title: "Semana Santa", description: "Sin clase hasta el 3 de abril", type: "holiday" },
  { date: "2026-05-21", title: "Examen final", description: "Evaluación oral final", type: "exam" },
]

export default function CalendarioPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00")
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  const getMonthName = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00")
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  // Group sessions by month
  const sessionsByMonth = courseSchedule.reduce((acc, session) => {
    const month = getMonthName(session.date)
    if (!acc[month]) acc[month] = []
    acc[month].push(session)
    return acc
  }, {} as Record<string, typeof courseSchedule>)

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Calendario del curso</h1>
        <p className="text-muted-foreground mt-2">
          Producción e interacción oral en español · Nivel C1
        </p>
      </div>

      {/* Important dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Fechas importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {importantDates.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  item.type === "exam"
                    ? "bg-granada-50 dark:bg-granada-950/30"
                    : "bg-gray-50 dark:bg-gray-800/50"
                }`}
              >
                <div className="w-16 text-center">
                  <div className={`text-lg font-bold ${item.type === "exam" ? "text-granada-600" : ""}`}>
                    {new Date(item.date + "T12:00:00").getDate()}
                  </div>
                  <div className={`text-xs ${item.type === "exam" ? "text-granada-500" : "text-muted-foreground"}`}>
                    {new Date(item.date + "T12:00:00").toLocaleDateString("es-ES", { month: "short" }).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Badge variant={item.type === "exam" ? "granada" : "secondary"}>
                  {item.type === "exam" ? "Examen" : "Festivo"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sessions by month */}
      {Object.entries(sessionsByMonth).map(([month, sessions]) => (
        <Card key={month}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              <Calendar className="h-5 w-5" />
              {month}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessions.map((s) => (
                <div
                  key={s.sessionNumber}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/sesiones/${s.sessionNumber}`)}
                >
                  <div className="w-20 text-sm text-muted-foreground">
                    {formatDate(s.date).split(",")[0]}
                  </div>
                  <Badge variant="outline" className="w-20 justify-center">
                    Sesión {s.sessionNumber}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">{s.title}</p>
                  </div>
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    Bloque {s.block}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
