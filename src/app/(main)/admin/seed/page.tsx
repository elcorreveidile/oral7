"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function AdminSeedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<{ type: "success" | "error", message: string, details?: any } | null>(null)
  const { toast } = useToast()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    router.push("/login")
    return null
  }

  const executeSeed = async () => {
    setIsExecuting(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/seed", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          type: "success",
          message: data.message,
          details: data.sessions,
        })
        toast({
          title: "Seed ejecutado correctamente",
          description: data.message,
        })
      } else {
        setResult({
          type: "error",
          message: data.error || "Error al ejecutar el seed",
          details: data.details,
        })
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "No se pudo ejecutar el seed",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error de conexión"
      setResult({
        type: "error",
        message: errorMessage,
      })
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Base de Datos - Seed</h1>
        <p className="text-muted-foreground mt-2">
          Inicializa la base de datos con las sesiones del curso
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Ejecutar Seed
          </CardTitle>
          <CardDescription>
            Crea las 15 sesiones del curso en la base de datos. Esta operación solo se debe ejecutar una vez.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <h3 className="font-medium mb-2">Qué hace este seed:</h3>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
              <li>Crea 15 sesiones (3 bloques temáticos)</li>
              <li>Configura la sesión actual (Sesión 1)</li>
              <li>Establece fechas del curso (Feb - May 2026)</li>
              <li>Si ya existen sesiones, no las sobrescribe</li>
            </ul>
          </div>

          <Button
            onClick={executeSeed}
            disabled={isExecuting}
            className="w-full"
            size="lg"
          >
            {isExecuting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ejecutando seed...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Ejecutar Seed
              </>
            )}
          </Button>

          {result && (
            <div className={`rounded-lg p-4 ${
              result.type === "success"
                ? "bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-100"
                : "bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-100"
            }`}>
              <div className="flex items-start gap-3">
                {result.type === "success" ? (
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 space-y-2">
                  <p className="font-medium">{result.message}</p>
                  {result.details && (
                    <div className="text-sm opacity-90">
                      <p className="font-medium mb-1">Sesiones creadas:</p>
                      <ul className="space-y-1">
                        {result.details.map((session: any) => (
                          <li key={session.id} className="text-xs">
                            Sesión {session.sessionNumber}: {session.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos pasos</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Ejecuta el seed en esta página</li>
            <li>Ve a <a href="/admin/qr" className="text-primary hover:underline">/admin/qr</a></li>
            <li>Genera un código QR</li>
            <li>Prueba registrar asistencia como estudiante</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
