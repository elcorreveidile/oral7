"use client"

import { useState, useEffect } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { RefreshCw, Copy, Check, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { generateQRCode, copyToClipboard } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface QRGeneratorProps {
  sessionNumber: number
  onCodeGenerated?: (code: string) => void
}

export function QRGenerator({ sessionNumber, onCodeGenerated }: QRGeneratorProps) {
  const [code, setCode] = useState("")
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState("")
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const generateNewCode = async () => {
    const newCode = generateQRCode()
    setCode(newCode)

    // Code expires in 15 minutes
    const expiry = new Date(Date.now() + 15 * 60 * 1000)
    setExpiresAt(expiry)

    // Save to backend
    try {
      await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode,
          sessionNumber,
          expiresAt: expiry.toISOString(),
        }),
      })

      onCodeGenerated?.(newCode)

      toast({
        title: "Código generado",
        description: `El código ${newCode} expira en 15 minutos`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el código",
      })
    }
  }

  // Update countdown timer
  useEffect(() => {
    if (!expiresAt) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = expiresAt.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft("Expirado")
        setCode("")
        clearInterval(interval)
      } else {
        const minutes = Math.floor(diff / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  const handleCopyCode = async () => {
    const success = await copyToClipboard(code)
    if (success) {
      setCopied(true)
      toast({ title: "Código copiado" })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const qrValue = `oral7://attendance/${code}`

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Código de asistencia</CardTitle>
        <CardDescription>
          Sesión {sessionNumber} - Los estudiantes escanean para registrar asistencia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {code ? (
          <>
            {/* QR Code */}
            <div className="qr-container mx-auto">
              <QRCodeCanvas
                value={qrValue}
                size={200}
                level="H"
                includeMargin
                bgColor="#ffffff"
                fgColor="#1e3a8a"
              />
            </div>

            {/* Code display */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Código manual (para PC):
              </p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-3xl font-mono font-bold tracking-widest bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                  {code}
                </code>
                <Button variant="ghost" size="icon" onClick={handleCopyCode}>
                  {copied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {timeLeft === "Expirado" ? (
                  <span className="text-red-500">Código expirado</span>
                ) : (
                  <>Expira en: <span className="font-mono font-medium">{timeLeft}</span></>
                )}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Genera un código para comenzar a registrar asistencia
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center">
          <Button onClick={generateNewCode} className="w-full max-w-xs">
            <RefreshCw className="mr-2 h-4 w-4" />
            {code ? "Generar nuevo código" : "Generar código"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
