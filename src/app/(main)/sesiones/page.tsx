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
import { getAllSessions } from "@/data/sessions"

// Obtener todas las sesiones del archivo de datos
const allSessions = getAllSessions()

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

  const filteredSessions = allSessions.filter((session) => {
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
