"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { QRGenerator } from "@/components/qr/qr-generator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateSpanish } from "@/lib/utils"
import { Users, Clock } from "lucide-react"

export default function AdminQRPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [attendanceCount, setAttendanceCount] = useState(0)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  if (status === "loading" || session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  // Mock current session data
  const currentSession = {
    id: "session-5",
    sessionNumber: 5,
    title: "Recursos de atenuación: suavizar el mensaje",
    date: new Date(),
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Control de asistencia</h1>
        <p className="text-muted-foreground mt-2">
          Genera el código QR para que los estudiantes registren su asistencia
        </p>
      </div>

      {/* Current session info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Sesión actual</CardTitle>
            <Badge variant="clm">Sesión {currentSession.sessionNumber}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{currentSession.title}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDateSpanish(currentSession.date)}
          </p>
        </CardContent>
      </Card>

      {/* QR Generator */}
      <QRGenerator
        sessionId={currentSession.id}
        sessionNumber={currentSession.sessionNumber}
        onCodeGenerated={() => {
          // Could refresh attendance count here
        }}
      />

      {/* Attendance stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <Users className="h-5 w-5" />
                <span className="text-2xl font-bold">{attendanceCount}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Registrados hoy
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="h-5 w-5" />
                <span className="text-2xl font-bold">15</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total estudiantes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <h3 className="font-medium mb-2">Instrucciones:</h3>
        <ol className="space-y-1 list-decimal list-inside text-muted-foreground">
          <li>Genera un código QR pulsando el botón</li>
          <li>Proyecta el código en la pantalla del aula</li>
          <li>Los estudiantes escanean con su móvil o introducen el código</li>
          <li>El código expira automáticamente en 15 minutos</li>
          <li>Puedes generar un nuevo código en cualquier momento</li>
        </ol>
      </div>
    </div>
  )
}
