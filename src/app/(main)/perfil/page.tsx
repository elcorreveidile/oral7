"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { User, Mail, GraduationCap, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function PerfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Mi perfil</h1>
        <p className="text-muted-foreground mt-2">
          Información de tu cuenta
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {getInitials(session?.user?.name || "U")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{session?.user?.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {session?.user?.email}
              </CardDescription>
              <Badge variant={isAdmin ? "granada" : "clm"} className="mt-2">
                {isAdmin ? "Profesor" : "Estudiante"}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Información del curso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Curso</p>
              <p className="font-medium">Producción e interacción oral en español</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Nivel</p>
              <p className="font-medium">C1 (MCER)</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Centro</p>
              <p className="font-medium">Centro de Lenguas Modernas</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Universidad</p>
              <p className="font-medium">Universidad de Granada</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Período académico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Inicio del curso</p>
              <p className="font-medium">3 de febrero de 2026</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Fin del curso</p>
              <p className="font-medium">14 de mayo de 2026</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Horario</p>
              <p className="font-medium">Martes y jueves</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total de sesiones</p>
              <p className="font-medium">27 sesiones</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
