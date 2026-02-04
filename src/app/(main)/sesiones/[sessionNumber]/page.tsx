"use client"

import { useParams } from "next/navigation"
import { SessionMiniweb } from "@/components/miniweb/session-miniweb"
import { getSessionData } from "@/data/sessions"

export default function SessionPage() {
  const params = useParams()
  const sessionNumber = params?.sessionNumber as string
  const sessionNum = parseInt(sessionNumber || "1")

  const sessionData = getSessionData(sessionNum)

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-destructive">Sesión no encontrada</p>
      </div>
    )
  }

  return <SessionMiniweb session={sessionData} />
}
