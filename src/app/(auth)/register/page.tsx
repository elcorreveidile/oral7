"use client"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, UserPlus, GraduationCap, Key } from "lucide-react"
import { useState } from "react"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    registrationCode: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          registrationCode: formData.registrationCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada. Iniciando sesión...",
        })

        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.ok) {
          router.push("/dashboard")
          router.refresh()
        } else {
          router.push("/login")
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error en el registro",
          description: data.error || "No se pudo completar el registro",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ha ocurrido un error. Inténtalo de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clm-50 via-white to-granada-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-granada-500 to-clm-600 text-white">
            <GraduationCap className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Registro de Estudiantes</CardTitle>
          <CardDescription>
            Plataforma PIO-7 · Centro de Lenguas Modernas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="registrationCode">Código de Registro *</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="registrationCode"
                  name="registrationCode"
                  type="text"
                  placeholder="Ingresa el código proporcionado por tu profesor"
                  value={formData.registrationCode}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Debes obtener un código de registro con tu profesor
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Tu nombre completo"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu.correo@ugr.es"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-granada-500 to-clm-600 hover:from-granada-600 hover:to-clm-700"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Registrando..." : "Crear cuenta"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 text-center text-sm text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            ← Volver a la página principal
          </Link>
          <div className="border-t pt-3">
            <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
            <Link href="/login" className="font-medium text-primary hover:underline ml-1">
              Inicia sesión
            </Link>
          </div>
          <div className="border-t pt-3">
            <p>Centro de Lenguas Modernas</p>
            <p>Universidad de Granada · Curso 2025-2026</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
