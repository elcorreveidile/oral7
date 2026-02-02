"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, BookOpen, CheckCircle, Clock, Search, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateSpanish, formatDateShort, isDateToday, isSessionPast } from "@/lib/utils"

// Demo session data - using ISO strings to avoid hydration issues
const demoSessions = [
  {
    id: "1",
    sessionNumber: 1,
    date: "2026-02-03" as unknown as Date,
    title: "Toma de contacto e interacción social",
    blockNumber: 1,
    blockTitle: "La argumentación formal",
    isExamDay: false,
  },
  {
    id: "2",
    sessionNumber: 2,
    date: "2026-02-05" as unknown as Date,
    title: "Socialización y registro: tutear vs. usted",
    blockNumber: 1,
    blockTitle: "La argumentación formal",
    isExamDay: false,
  },
  {
    id: "3",
    sessionNumber: 3,
    date: "2026-02-10" as unknown as Date,
    title: "Los bares como espacios de interacción",
    blockNumber: 1,
    blockTitle: "La argumentación formal",
    isExamDay: false,
  },
  {
    id: "4",
    sessionNumber: 4,
    date: "2026-02-12" as unknown as Date,
    title: "Recursos de intensificación en español",
    blockNumber: 1,
    blockTitle: "La argumentación formal",
    isExamDay: false,
  },
  {
    id: "5",
    sessionNumber: 5,
    date: "2026-02-17" as unknown as Date,
    title: "Recursos de atenuación: suavizar el mensaje",
    blockNumber: 1,
    blockTitle: "La argumentación formal",
    isExamDay: false,
  },
  {
    id: "6",
    sessionNumber: 6,
    date: "2026-02-19" as unknown as Date,
    title: "Conectores para organizar el discurso",
    blockNumber: 1,
    blockTitle: "La argumentación formal",
    isExamDay: false,
  },
  {
    id: "7",
    sessionNumber: 7,
    date: "2026-02-24" as unknown as Date,
    title: "El humor en español: chistes y estereotipos",
    blockNumber: 1,
    blockTitle: "La argumentación formal",
    isExamDay: false,
  },
  {
    id: "8",
    sessionNumber: 8,
    date: "2026-02-26" as unknown as Date,
    title: "Explicar y analizar el humor",
    blockNumber: 1,
    blockTitle: "La argumentación formal",
    isExamDay: false,
  },
  {
    id: "exam-partial",
    sessionNumber: 15,
    date: "2026-03-26" as unknown as Date,
    title: "Examen parcial",
    blockNumber: 2,
    blockTitle: "La conferencia y la entrevista",
    isExamDay: true,
    examType: "PARTIAL",
  },
]

export default function SesionesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeBlock, setActiveBlock] = useState("all")
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentDate(new Date())
  }, [])

  // Prevent hydration mismatch
  if (!currentDate) {
    return null
  }

  const filteredSessions = demoSessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.sessionNumber.toString().includes(searchQuery)
    const matchesBlock =
      activeBlock === "all" || session.blockNumber.toString() === activeBlock
    return matchesSearch && matchesBlock
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sesiones del curso</h1>
          <p className="text-muted-foreground">
            Producción e interacción oral en español · Nivel C1
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar sesiones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={activeBlock} onValueChange={setActiveBlock}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="1">Bloque 1</TabsTrigger>
            <TabsTrigger value="2">Bloque 2</TabsTrigger>
            <TabsTrigger value="3">Bloque 3</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Sessions grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSessions.map((session) => {
          const isToday = isDateToday(session.date)
          const isPast = isSessionPast(session.date, currentDate)

          return (
            <Link key={session.id} href={`/sesiones/${session.sessionNumber}`}>
              <Card
                className={`session-card h-full transition-all hover:shadow-lg ${
                  isToday ? "today ring-2 ring-primary" : ""
                } ${isPast ? "past opacity-80" : ""} ${
                  session.isExamDay ? "bg-granada-50 dark:bg-granada-950/30" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={session.isExamDay ? "granada" : "clm"}>
                        {session.isExamDay ? "Examen" : `Sesión ${session.sessionNumber}`}
                      </Badge>
                      {isToday && <Badge variant="success">Hoy</Badge>}
                      {isPast && !isToday && (
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completada
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {session.title}
                  </CardTitle>
                  <CardDescription>
                    Bloque {session.blockNumber}: {session.blockTitle}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateSpanish(session.date)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No se encontraron sesiones</h3>
          <p className="text-muted-foreground">
            Prueba con otra búsqueda o filtro
          </p>
        </div>
      )}
    </div>
  )
}
