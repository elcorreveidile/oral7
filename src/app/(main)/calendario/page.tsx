"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Calendar, BookOpen, GraduationCap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Course schedule data - Feb 3 to May 14, 2026 (Tue/Thu)
const courseSchedule = [
  { date: "2026-02-03", sessionNumber: 1, title: "Toma de contacto e interacción social", block: 1 },
  { date: "2026-02-05", sessionNumber: 2, title: "Socialización y registro: tutear vs. usted", block: 1 },
  { date: "2026-02-10", sessionNumber: 3, title: "Los bares como espacios de interacción", block: 1 },
  { date: "2026-02-12", sessionNumber: 4, title: "El arte de la conversación informal", block: 1 },
  { date: "2026-02-17", sessionNumber: 5, title: "Quedar con amigos: propuestas y negociación", block: 1 },
  { date: "2026-02-19", sessionNumber: 6, title: "Contar anécdotas y experiencias", block: 2 },
  { date: "2026-02-24", sessionNumber: 7, title: "Expresar opiniones y reaccionar", block: 2 },
  { date: "2026-02-26", sessionNumber: 8, title: "El debate informal", block: 2 },
  { date: "2026-03-03", sessionNumber: 9, title: "Hablar de actualidad y noticias", block: 2 },
  { date: "2026-03-05", sessionNumber: 10, title: "La argumentación en contextos formales", block: 2 },
  { date: "2026-03-10", sessionNumber: 11, title: "Presentaciones orales: estructura", block: 3 },
  { date: "2026-03-12", sessionNumber: 12, title: "Presentaciones orales: recursos", block: 3 },
  { date: "2026-03-17", sessionNumber: 13, title: "Repaso y preparación examen parcial", block: 3 },
  { date: "2026-03-19", sessionNumber: 14, title: "Repaso y preparación examen parcial", block: 3 },
  { date: "2026-03-24", sessionNumber: 15, title: "Repaso general", block: 3 },
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
