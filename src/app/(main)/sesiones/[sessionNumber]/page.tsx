"use client"

import { useParams } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { SessionMiniweb } from "@/components/miniweb/session-miniweb"
import { getSessionData } from "@/data/sessions"
import { Mic2 } from "lucide-react"

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

  return (
    <>
      {sessionNum === 28 && (
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <Link
            href="/tertulia"
            className="flex items-center gap-3 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <div className="p-2 rounded-lg bg-amber-100 group-hover:bg-amber-200 transition-colors shrink-0">
              <Mic2 className="h-4 w-4 text-amber-700" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-800 leading-tight">Debates en La Tertulia</p>
              <p className="text-xs text-amber-700/80 truncate">Dossier del proyecto · 20 mayo · Bar Cultural La Tertulia, Granada</p>
            </div>
            <span className="ml-auto text-amber-600 text-xs font-medium shrink-0 group-hover:underline">Ver →</span>
          </Link>
        </div>
      )}
      <SessionMiniweb session={sessionData} />
    </>
  )
}
