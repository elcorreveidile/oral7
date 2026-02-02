"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Settings, Moon, Sun, Monitor, Bell, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function ConfiguracionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading" || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-2">
          Personaliza tu experiencia en Oral-7
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Apariencia
          </CardTitle>
          <CardDescription>
            Personaliza el aspecto visual de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Tema</Label>
            <RadioGroup
              value={theme}
              onValueChange={setTheme}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="light"
                  id="light"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Sun className="mb-3 h-6 w-6" />
                  Claro
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="dark"
                  id="dark"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Moon className="mb-3 h-6 w-6" />
                  Oscuro
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="system"
                  id="system"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Monitor className="mb-3 h-6 w-6" />
                  Sistema
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Configura cómo quieres recibir las notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Recordatorios de sesión</Label>
              <p className="text-sm text-muted-foreground">
                Recibe un recordatorio antes de cada clase
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Avisos de asistencia</Label>
              <p className="text-sm text-muted-foreground">
                Notificación cuando se abra el registro de asistencia
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Nuevos materiales</Label>
              <p className="text-sm text-muted-foreground">
                Aviso cuando haya nuevos contenidos disponibles
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferencias de aprendizaje
          </CardTitle>
          <CardDescription>
            Ajusta tu experiencia de aprendizaje
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Modo A por defecto</Label>
              <p className="text-sm text-muted-foreground">
                Inicia siempre en modo colaborativo/comunicativo
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mostrar traducciones</Label>
              <p className="text-sm text-muted-foreground">
                Muestra equivalentes en inglés cuando estén disponibles
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
