"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Shield, ArrowLeft, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type AuditLog = {
  id: string
  action: string
  entityType: string
  entityId: string | null
  metadata: any
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  admin: {
    id: string
    email: string
    name: string
  }
}

export default function AdminAuditPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/audit-logs?limit=200")
      if (!res.ok) {
        setLogs([])
        return
      }
      const data = await res.json()
      setLogs(Array.isArray(data.logs) ? data.logs : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      loadLogs()
    }
  }, [status, session])

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
          <h1 className="text-3xl font-bold">Auditoría administrativa</h1>
          <p className="text-muted-foreground">
            Registro de acciones sensibles realizadas por administradores.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadLogs} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Recargar
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Eventos recientes
          </CardTitle>
          <CardDescription>
            Últimos {logs.length} eventos de auditoría.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {logs.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground">No hay eventos de auditoría para mostrar.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-4 text-left font-medium">Fecha</th>
                  <th className="py-2 pr-4 text-left font-medium">Admin</th>
                  <th className="py-2 pr-4 text-left font-medium">Acción</th>
                  <th className="py-2 pr-4 text-left font-medium">Entidad</th>
                  <th className="py-2 pr-4 text-left font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("es-ES")}
                    </td>
                    <td className="py-2 pr-4">
                      <div className="font-medium">{log.admin?.name || "—"}</div>
                      <div className="text-muted-foreground">{log.admin?.email || "—"}</div>
                    </td>
                    <td className="py-2 pr-4 font-mono">{log.action}</td>
                    <td className="py-2 pr-4">
                      {log.entityType}
                      {log.entityId ? ` (${log.entityId.slice(0, 8)}…)` : ""}
                    </td>
                    <td className="py-2 pr-4">{log.ipAddress || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
