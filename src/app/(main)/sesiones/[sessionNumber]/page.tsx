"use client"

import { useParams } from "next/navigation"
import { useEffect } from "react"
import { SessionMiniweb } from "@/components/miniweb/session-miniweb"
import { getSessionData } from "@/data/sessions"

export default function SessionPage() {
  const params = useParams()
  const sessionNumber = params?.sessionNumber as string
  const sessionNum = parseInt(sessionNumber || "1")

  const sessionData = getSessionData(sessionNum)

  useEffect(() => {
    if (!Number.isFinite(sessionNum) || sessionNum <= 0) return

    let lastSentAt = Date.now()
    let stopped = false

    const send = async (secondsSpent: number) => {
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionNumber: sessionNum, secondsSpent }),
          // Allows the browser to try sending while navigating away.
          keepalive: true,
        })
        if (!res.ok) {
          const text = await res.text().catch(() => "")

        }
      } catch {
        // Non-blocking; progress tracking should never break the session view.
      }
    }

    // Mark as viewed immediately.
    send(0)

    const interval = window.setInterval(() => {
      if (stopped) return
      const now = Date.now()
      const deltaSeconds = Math.floor((now - lastSentAt) / 1000)
      if (deltaSeconds <= 0) return
      lastSentAt = now
      send(deltaSeconds)
    }, 30_000)

    const onBeforeUnload = () => {
      if (stopped) return
      stopped = true
      const now = Date.now()
      const deltaSeconds = Math.floor((now - lastSentAt) / 1000)
      if (deltaSeconds > 0) {
        // Fire-and-forget (best effort).
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
          navigator.sendBeacon(
            "/api/progress",
            new Blob([JSON.stringify({ sessionNumber: sessionNum, secondsSpent: deltaSeconds })], {
              type: "application/json",
            })
          )
        } else {
          send(deltaSeconds)
        }
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener("beforeunload", onBeforeUnload)
      if (stopped) return
      stopped = true
      const now = Date.now()
      const deltaSeconds = Math.floor((now - lastSentAt) / 1000)
      if (deltaSeconds > 0) send(deltaSeconds)
    }
  }, [sessionNum])

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-destructive">Sesión no encontrada</p>
      </div>
    )
  }

  return <SessionMiniweb session={sessionData} />
}
