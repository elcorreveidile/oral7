"use client"

import { Badge } from "@/components/ui/badge"
import { formatDateSpanish, isDateToday, isSessionPast } from "@/lib/utils"
import { Calendar, Clock, BookOpen, Target } from "lucide-react"
import { SessionData } from "@/types"
import { useState, useEffect } from "react"

interface SessionHeaderProps {
  session: SessionData
}

export function SessionHeader({ session }: SessionHeaderProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentDate(new Date())
  }, [])

  // Prevent hydration mismatch by not rendering until client-side
  if (!currentDate) {
    return null
  }

  const isToday = isDateToday(session.date)
  const isPast = isSessionPast(session.date, currentDate)

  return (
    <div className="space-y-4">
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="clm">Sesión {session.sessionNumber}</Badge>
        <Badge variant="outline">Bloque {session.blockNumber}: {session.blockTitle}</Badge>
        {isToday && (
          <Badge variant="success" className="animate-pulse-soft">
            Hoy
          </Badge>
        )}
        {isPast && !isToday && (
          <Badge variant="secondary">Completada</Badge>
        )}
        {session.isExamDay && (
          <Badge variant="granada">
            {session.examType === "PARTIAL" ? "Examen parcial" : "Examen final"}
          </Badge>
        )}
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {session.title}
        </h1>
        {session.subtitle && (
          <p className="text-lg text-muted-foreground mt-1">{session.subtitle}</p>
        )}
      </div>

      {/* Date and info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{formatDateSpanish(session.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span>Nivel C1</span>
        </div>
      </div>

      {/* Objectives */}
      <div className="bg-gradient-to-r from-clm-50 to-blue-50 dark:from-clm-950/30 dark:to-blue-950/30 rounded-lg p-4 border border-clm-200 dark:border-clm-800">
        <div className="flex items-start gap-3">
          <Target className="h-5 w-5 text-clm-600 dark:text-clm-400 mt-0.5" />
          <div>
            <h2 className="font-semibold text-clm-800 dark:text-clm-200 mb-2">
              Objetivos de la sesión
            </h2>
            <ul className="space-y-1.5">
              {session.objectives.map((objective, index) => (
                <li key={objective.id || index} className="flex items-start gap-2 text-sm">
                  <span className="text-clm-500 mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300">{objective.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
