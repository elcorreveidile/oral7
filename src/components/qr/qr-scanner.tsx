"use client"

import { useState, useEffect } from "react"
import { QrCode, Keyboard, Check, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface QRScannerProps {
  sessionId?: string
  onSuccess?: () => void
}

export function QRScanner({ sessionId, onSuccess }: QRScannerProps) {
  const [manualCode, setManualCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scannerActive, setScannerActive] = useState(false)
  const [result, setResult] = useState<"success" | "error" | null>(null)
  const [message, setMessage] = useState("")
  const { toast } = useToast()

  const handleSubmitCode = async (code: string) => {
    if (!code || code.length < 6) {
      toast({
        variant: "destructive",
        title: "Código inválido",
        description: "Introduce un código de 6 caracteres",
      })
      return
    }

    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await fetch("/api/attendance/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase(),
          sessionId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult("success")
        setMessage("¡Asistencia registrada correctamente!")
        toast({
          title: "Éxito",
          description: "Tu asistencia ha sido registrada",
        })
        onSuccess?.()
      } else {
        setResult("error")
        setMessage(data.error || "Error al registrar asistencia")
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "No se pudo registrar la asistencia",
        })
      }
    } catch (error) {
      setResult("error")
      setMessage("Error de conexión")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error de conexión. Inténtalo de nuevo.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmitCode(manualCode)
  }

  // Simulated QR scan result handler
  const handleScan = (data: string | null) => {
    if (data) {
      // Extract code from URL format oral7://attendance/XXXXXX
      const match = data.match(/oral7:\/\/attendance\/([A-Z0-9]+)/)
      if (match) {
        handleSubmitCode(match[1])
        setScannerActive(false)
      }
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Registrar asistencia</CardTitle>
        <CardDescription>
          Escanea el código QR o introduce el código manualmente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className={`text-center py-8 space-y-4 ${
            result === "success" ? "text-green-600" : "text-red-600"
          }`}>
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
              result === "success" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
            }`}>
              {result === "success" ? (
                <Check className="h-8 w-8" />
              ) : (
                <AlertCircle className="h-8 w-8" />
              )}
            </div>
            <p className="font-medium text-lg">{message}</p>
            <Button
              variant="outline"
              onClick={() => {
                setResult(null)
                setManualCode("")
              }}
            >
              Cerrar
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">
                <Keyboard className="h-4 w-4 mr-2" />
                Código manual
              </TabsTrigger>
              <TabsTrigger value="scan">
                <QrCode className="h-4 w-4 mr-2" />
                Escanear QR
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="mt-6">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="XXXXXX"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-center text-2xl font-mono tracking-widest uppercase"
                    disabled={isSubmitting}
                    autoComplete="off"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Introduce el código de 6 caracteres que muestra el profesor
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || manualCode.length < 6}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Registrar asistencia
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="scan" className="mt-6">
              <div className="space-y-4">
                {scannerActive ? (
                  <div className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm">
                      Cámara activa - Apunta al código QR
                    </p>
                    {/* Note: In production, integrate react-qr-reader here */}
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center gap-4 p-4">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                    <p className="text-center text-muted-foreground text-sm">
                      Activa la cámara para escanear el código QR del profesor
                    </p>
                    <Button onClick={() => setScannerActive(true)}>
                      Activar cámara
                    </Button>
                  </div>
                )}

                {scannerActive && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setScannerActive(false)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
