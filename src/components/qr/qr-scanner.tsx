"use client"

import { useState, useEffect, useRef } from "react"
import { QrCode, Keyboard, Check, Loader2, AlertCircle, CameraOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Html5Qrcode } from "html5-qrcode"

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
  const [cameraError, setCameraError] = useState<string | null>(null)
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null)
  const scannerId = useRef("qr-scanner")
  const { toast } = useToast()

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (qrCodeScannerRef.current && scannerActive) {
        qrCodeScannerRef.current.stop().catch(console.error)
      }
    }
  }, [scannerActive])

  // Handle QR scan result
  const handleScanSuccess = (decodedText: string) => {
    // Extract code from URL format oral7://attendance/XXXXXX
    const match = decodedText.match(/oral7:\/\/attendance\/([A-Z0-9]+)/i)
    if (match) {
      handleSubmitCode(match[1])
      stopScanner()
    } else {
      // Try to use the text directly if it's a 6-character code
      if (decodedText.length === 6) {
        handleSubmitCode(decodedText)
        stopScanner()
      }
    }
  }

  // Handle camera errors
  const handleScanError = (errorMessage: string) => {
    setCameraError("No se pudo acceder a la cámara. Verifica los permisos.")
    stopScanner()
    toast({
      variant: "destructive",
      title: "Error de cámara",
      description: "No se pudo acceder a la cámara. Verifica los permisos del navegador.",
    })
  }

  // Start the scanner
  const startScanner = async () => {
    setCameraError(null)
    const html5QrCode = new Html5Qrcode(scannerId.current)
    qrCodeScannerRef.current = html5QrCode

    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleScanSuccess,
        handleScanError
      )
      setScannerActive(true)
    } catch (error) {
      setCameraError("No se pudo iniciar la cámara.")
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo iniciar la cámara. Verifica los permisos.",
      })
    }
  }

  // Stop the scanner
  const stopScanner = async () => {
    if (qrCodeScannerRef.current) {
      try {
        await qrCodeScannerRef.current.stop()
        qrCodeScannerRef.current.clear()
      } catch (error) {
      }
    }
    setScannerActive(false)
  }

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
                {cameraError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start gap-3">
                    <CameraOff className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                        Error de cámara
                      </p>
                      <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                        {cameraError}
                      </p>
                    </div>
                  </div>
                )}

                {scannerActive ? (
                  <div className="space-y-4">
                    <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                      <div id={scannerId.current} className="w-full h-full" />
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      Apunta al código QR del profesor
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => stopScanner()}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center gap-4 p-4">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                    <p className="text-center text-muted-foreground text-sm">
                      Activa la cámara para escanear el código QR del profesor
                    </p>
                    <Button onClick={() => startScanner()}>
                      <QrCode className="mr-2 h-4 w-4" />
                      Activar cámara
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
