"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { SessionMiniweb } from "@/components/miniweb/session-miniweb"
import { SessionData } from "@/types"
import { Loader2 } from "lucide-react"

export default function SessionPage() {
  const params = useParams()
  const sessionNumber = params?.sessionNumber as string
  const sessionNum = parseInt(sessionNumber || "1")

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSession() {
      try {
        setLoading(true)
        const response = await fetch(`/api/sessions/${sessionNum}`)

        if (!response.ok) {
          throw new Error("Error al cargar la sesión")
        }

        const data = await response.json()
        const session = data.session

        // Transform database data to SessionData format
        const transformedData: SessionData = {
          id: session.id,
          sessionNumber: session.sessionNumber,
          date: session.date,
          title: session.title,
          subtitle: session.subtitle,
          blockNumber: session.blockNumber,
          blockTitle: session.blockTitle,
          isExamDay: session.isExamDay,
          examType: session.examType,
          objectives: Array.isArray(session.objectives)
            ? session.objectives.map((obj: string | { text: string }, i: number) => ({
                id: `obj-${i}`,
                text: typeof obj === 'string' ? obj : obj.text,
              }))
            : [],
          timing: Array.isArray(session.timing)
            ? session.timing.map((t: any, i: number) => ({
                id: `t-${i}`,
                duration: t.duration,
                activity: t.phase || t.activity,
                description: t.description,
              }))
            : [],
          dynamics: Array.isArray(session.dynamics)
            ? session.dynamics.map((d: any, i: number) => ({
                id: `d-${i}`,
                step: i + 1,
                title: d.title,
                instructions: d.description ? [d.description] : [],
                groupType: d.mode === 'A' ? 'pairs' : 'individual',
                isModeB: d.mode === 'B',
                duration: d.duration,
              }))
            : [],
          grammarContent: session.grammarContent,
          vocabularyContent: session.vocabularyContent,
          modeAContent: session.modeAContent,
          modeBContent: session.modeBContent,
          tasks: session.tasks?.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            type: task.type,
            content: task.content,
            order: task.order,
            isModeBOnly: task.isModeBOnly,
          })) || [],
          checklistItems: session.checklistItems?.map((item: any) => ({
            id: item.id,
            text: item.text,
          })) || [],
          resources: session.resources?.map((res: any) => ({
            id: res.id,
            title: res.title,
            type: res.type,
            url: res.url,
            order: res.order,
          })) || [],
        }

        setSessionData(transformedData)
      } catch (err) {
        console.error("Error fetching session:", err)
        setError("No se pudo cargar la sesión")
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionNum])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando sesión...</span>
      </div>
    )
  }

  if (error || !sessionData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-destructive">{error || "Sesión no encontrada"}</p>
      </div>
    )
  }

  return <SessionMiniweb session={sessionData} />
}
