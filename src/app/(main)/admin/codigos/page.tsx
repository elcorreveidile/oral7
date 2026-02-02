"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Copy, Trash2, Plus, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

interface RegistrationCode {
  id: string
  code: string
  isActive: boolean
  maxUses: number
  usedCount: number
  description: string | null
  createdAt: string
  expiresAt: string | null
  _count: {
    registrations: number
  }
}

export default function RegistrationCodesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [codes, setCodes] = useState<RegistrationCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newCode, setNewCode] = useState({
    maxUses: "1",
    description: "",
  })

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchCodes()
    }
  }, [status, session])

  const fetchCodes = async () => {
    try {
      const response = await fetch("/api/registration-codes")
      if (response.ok) {
        const data = await response.json()
        setCodes(data)
      }
    } catch (error) {
      console.error("Error fetching codes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const response = await fetch("/api/registration-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxUses: parseInt(newCode.maxUses),
          description: newCode.description || undefined,
        }),
      })

      if (response.ok) {
        const createdCode = await response.json()
        setCodes((prev) => [createdCode, ...prev])
        setNewCode({ maxUses: "1", description: "" })
        toast({
          title: "Código creado",
          description: `El código ${createdCode.code} ha sido generado`,
        })
      } else {
        const data = await response.json()
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el código",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleToggleActive = async (codeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/registration-codes/${codeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        setCodes((prev) =>
          prev.map((code) =>
            code.id === codeId ? { ...code, isActive: !code.isActive } : code
          )
        )
        toast({
          title: "Código actualizado",
          description: !currentStatus ? "Código activado" : "Código desactivado",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el código",
      })
    }
  }

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm("¿Estás seguro de eliminar este código?")) {
      return
    }

    try {
      const response = await fetch(`/api/registration-codes/${codeId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCodes((prev) => prev.filter((code) => code.id !== codeId))
        toast({
          title: "Código eliminado",
          description: "El código ha sido eliminado",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el código",
      })
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copiado",
        description: "Código copiado al portapapeles",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo copiar el código",
      })
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Códigos de Registro</h1>
          <p className="text-muted-foreground">
            Genera códigos para que los estudiantes puedan registrarse
          </p>
        </div>
        <Button onClick={fetchCodes} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generar nuevo código</CardTitle>
          <CardDescription>
            Los estudiantes necesitarán este código para crear su cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCode} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxUses">Número máximo de usos</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  max="100"
                  value={newCode.maxUses}
                  onChange={(e) => setNewCode({ ...newCode, maxUses: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Ej: C1 - Grupo A (Marzo 2026)"
                  value={newCode.description}
                  onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" disabled={isCreating} className="w-full sm:w-auto">
              {isCreating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Generar código
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Códigos existentes</CardTitle>
          <CardDescription>
            Lista de todos los códigos de registro generados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
            </div>
          ) : codes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay códigos generados aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {codes.map((code) => {
                const isExpired = code.expiresAt && new Date(code.expiresAt) < new Date()
                const isFullyUsed = code.usedCount >= code.maxUses
                const isDisabled = !code.isActive || isExpired || isFullyUsed

                return (
                  <div
                    key={code.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isDisabled
                        ? "border-gray-200 bg-gray-50 opacity-60"
                        : "border-granada-200 bg-granada-50/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <code className="text-lg font-bold bg-white px-3 py-1 rounded border font-mono">
                            {code.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(code.code)}
                            className="h-8 w-8"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Badge variant={code.isActive ? "success" : "secondary"}>
                            {code.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                          {isExpired && <Badge variant="destructive">Expirado</Badge>}
                          {isFullyUsed && <Badge variant="destructive">Agotado</Badge>}
                        </div>

                        {code.description && (
                          <p className="text-sm text-muted-foreground">{code.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm">
                          <span>
                            Uso: <strong>{code.usedCount}</strong> / {code.maxUses}
                          </span>
                          <span>·</span>
                          <span>
                            Creado: {format(new Date(code.createdAt), "dd MMM yyyy", { locale: es })}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleActive(code.id, code.isActive)}
                          disabled={isExpired || isFullyUsed}
                          title={code.isActive ? "Desactivar" : "Activar"}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteCode(code.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">
            📚 ¿Cómo funcionan los códigos?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
          <p>
            <strong>1. Genera un código:</strong> Usa el formulario de arriba para crear un código único.
          </p>
          <p>
            <strong>2. Comparte el código:</strong> Envíalo a tus estudiantes (por email, en clase, etc.).
          </p>
          <p>
            <strong>3. Registro:</strong> Los estudiantes usan el código para crear su cuenta en{" "}
            <Link href="/register" className="font-medium hover:underline">
              /register
            </Link>
          </p>
          <p>
            <strong>4. Control:</strong> Puedes configurar cuántos estudiantes pueden usar cada código.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
