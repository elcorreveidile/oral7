"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ShieldCheck, KeyRound, ArrowLeft, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

type TwoFactorStatus = {
  enabled: boolean
  configured: boolean
}

export default function Admin2FAPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [statusData, setStatusData] = useState<TwoFactorStatus | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [manualEntryKey, setManualEntryKey] = useState<string | null>(null)
  const [token, setToken] = useState("")

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  const loadStatus = async () => {
    try {
      const res = await fetch("/api/admin/2fa/enable")
      if (!res.ok) return
      const data = await res.json()
      setStatusData({ enabled: !!data.enabled, configured: !!data.configured })
    } catch {
      // Ignore UI-only fetch failures.
    }
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      loadStatus()
    }
  }, [status, session])

  const startSetup = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/2fa/enable", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "No se pudo iniciar 2FA")
      }
      setQrCodeDataUrl(data.qrCodeDataUrl || null)
      setManualEntryKey(data.manualEntryKey || null)
      setStatusData({ enabled: false, configured: true })
      toast({ title: "Configuración iniciada", description: "Escanea el QR y verifica un código." })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo iniciar 2FA",
      })
    } finally {
      setLoading(false)
    }
  }

  const verifySetup = async () => {
    if (!token.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/admin/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Código 2FA inválido")
      }
      setToken("")
      setQrCodeDataUrl(null)
      setManualEntryKey(null)
      await loadStatus()
      toast({ title: "2FA activado", description: "El segundo factor ya está habilitado." })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de verificación",
        description: error instanceof Error ? error.message : "Código inválido",
      })
    } finally {
      setLoading(false)
    }
  }

  const disable2FA = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/2fa/enable", { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "No se pudo desactivar 2FA")
      }
      setQrCodeDataUrl(null)
      setManualEntryKey(null)
      setToken("")
      await loadStatus()
      toast({ title: "2FA desactivado" })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo desactivar 2FA",
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">2FA de administrador</h1>
          <p className="text-muted-foreground mt-2">
            Protege tu cuenta con autenticación de dos factores (TOTP).
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Estado de seguridad
          </CardTitle>
          <CardDescription>
            Estado actual de autenticación en dos pasos para tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            2FA activado:{" "}
            <span className={statusData?.enabled ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
              {statusData?.enabled ? "Sí" : "No"}
            </span>
          </p>
          {!statusData?.enabled ? (
            <Button onClick={startSetup} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generar QR de configuración
            </Button>
          ) : (
            <Button variant="destructive" onClick={disable2FA} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Desactivar 2FA
            </Button>
          )}
        </CardContent>
      </Card>

      {(qrCodeDataUrl || statusData?.configured) && !statusData?.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Activar 2FA
            </CardTitle>
            <CardDescription>
              Escanea el código QR con Google Authenticator, 1Password o Authy y verifica el código de 6 dígitos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {qrCodeDataUrl && (
              <div className="flex justify-center">
                <Image
                  src={qrCodeDataUrl}
                  alt="QR 2FA"
                  width={224}
                  height={224}
                  unoptimized
                  className="h-56 w-56 rounded-lg border bg-white p-2"
                />
              </div>
            )}

            {manualEntryKey && (
              <div className="rounded-md border bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Clave manual (si no puedes escanear QR)</p>
                <p className="font-mono text-sm break-all">{manualEntryKey}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="token2fa">Código 2FA</Label>
              <Input
                id="token2fa"
                inputMode="numeric"
                placeholder="123456"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button onClick={verifySetup} disabled={loading || !token.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verificar y activar 2FA
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
