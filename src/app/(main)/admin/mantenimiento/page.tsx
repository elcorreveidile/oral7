"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, RefreshCw, ExternalLink, Database, HardDrive, Wrench } from "lucide-react"

type ApiResult = {
  ok: boolean
  status: number
  body: any
}

async function callApi(path: string): Promise<ApiResult> {
  const res = await fetch(path, { method: "GET" })
  let body: any = null
  try {
    body = await res.json()
  } catch {
    body = await res.text().catch(() => null)
  }
  return { ok: res.ok, status: res.status, body }
}

export default function AdminMaintenancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [loadingKey, setLoadingKey] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  const run = async (key: string, path: string) => {
    setLoadingKey(key)
    try {
      const result = await callApi(path)
      toast({
        variant: result.ok ? undefined : "destructive",
        title: result.ok ? "OK" : `Error (${result.status})`,
        description:
          typeof result.body === "string"
            ? result.body
            : result.body?.message || result.body?.error || "Respuesta recibida",
      })
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e?.message || "No se pudo completar la operación",
      })
    } finally {
      setLoadingKey(null)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mantenimiento</h1>
          <p className="text-muted-foreground">
            Herramientas puntuales para diagnosticar o ajustar la plataforma.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Sincronizar sesiones</CardTitle>
            </div>
            <CardDescription>
              Si tu despliegue antiguo dependía de un `sessions.ts`, esta operación ahora es un no-op seguro.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              onClick={() => run("sync", "/api/admin/sync-sessions")}
              disabled={loadingKey !== null}
            >
              {loadingKey === "sync" && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Sincronizar
            </Button>
            <Button asChild variant="outline">
              <a href="/api/admin/sync-sessions" target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir API
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Verificar Blob Storage</CardTitle>
            </div>
            <CardDescription>
              Comprueba que `BLOB_READ_WRITE_TOKEN` está configurado y tiene un formato válido.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              onClick={() => run("blob", "/api/admin/check-blob")}
              disabled={loadingKey !== null}
            >
              {loadingKey === "blob" && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Verificar
            </Button>
            <Button asChild variant="outline">
              <a href="/api/admin/check-blob" target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir API
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Probar subida de archivos</CardTitle>
            </div>
            <CardDescription>
              Validación rápida de configuración. No sube nada permanente.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              onClick={() => run("upload", "/api/admin/test-upload")}
              disabled={loadingKey !== null}
            >
              {loadingKey === "upload" && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Probar
            </Button>
            <Button asChild variant="outline">
              <a href="/api/admin/test-upload" target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir API
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Migrar base de datos</CardTitle>
            </div>
            <CardDescription>
              Solo para casos excepcionales. Actualmente, `DOCUMENT_UPLOAD` ya está contemplado en el esquema.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              onClick={() => run("migrate", "/api/admin/migrate-tasktype")}
              disabled={loadingKey !== null}
            >
              {loadingKey === "migrate" && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Ejecutar
            </Button>
            <Button asChild variant="outline">
              <a href="/api/admin/migrate-tasktype" target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir API
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
