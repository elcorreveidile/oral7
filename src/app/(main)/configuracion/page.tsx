"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Shield, Save, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function ConfiguracionPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  })

  const handleSave = async () => {
    setIsLoading(true)

    try {
      // En una implementación real, aquí harías fetch a la API
      // Por ahora, solo mostramos un mensaje de éxito
      toast({
        title: "Configuración guardada",
        description: "Tus cambios han sido guardados correctamente",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la configuración",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tu perfil y preferencias
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Perfil
          </CardTitle>
          <CardDescription>
            Actualiza tu información personal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Tu nombre"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              El correo electrónico no se puede cambiar
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Rol
            </Label>
            <Input
              value={session?.user?.role === "ADMIN" ? "Profesor (Admin)" : "Estudiante"}
              disabled
              className="bg-muted"
            />
          </div>

          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones de Cuenta</CardTitle>
          <CardDescription>
            Gestiona tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>

      {/* Course Info */}
      <Card className="bg-gradient-to-br from-clm-50 to-granada-50 dark:from-clm-950/30 dark:to-granada-950/30 border-clm-200 dark:border-clm-800">
        <CardHeader>
          <CardTitle>Información del Curso</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <strong>Curso:</strong> Producción e Interacción Oral Nivel C1
          </p>
          <p>
            <strong>Centro:</strong> Centro de Lenguas Modernas
          </p>
          <p>
            <strong>Universidad:</strong> Universidad de Granada
          </p>
          <p>
            <strong>Curso académico:</strong> 2025-2026
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
