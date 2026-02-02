"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Mail, MessageSquare, Send } from "lucide-react"
import Link from "next/link"

export default function ContactoPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Mensaje enviado",
          description: "Tu mensaje ha sido enviado correctamente. Te responderemos lo antes posible.",
        })
        setFormData({ name: "", email: "", subject: "", message: "" })
      } else {
        throw new Error("Error al enviar mensaje")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-clm-50 via-white to-granada-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Contacto</h1>
          <p className="text-muted-foreground">
            Centro de Lenguas Modernas · Universidad de Granada
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Envíanos un mensaje
            </CardTitle>
            <CardDescription>
              Rellena el formulario y te responderemos lo antes posible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu.correo@ugr.es"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Asunto *</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="¿En qué podemos ayudarte?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensaje *</Label>
                <Textarea
                  id="message"
                  placeholder="Escribe tu mensaje aquí..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  disabled={isSubmitting}
                  rows={6}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar mensaje
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Información de contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <p>
              <strong>Email:</strong> benitezl@go.ugr.es
            </p>
            <p>
              <strong>Centro:</strong> Centro de Lenguas Modernas
            </p>
            <p>
              <strong>Universidad:</strong> Universidad de Granada
            </p>
            <p className="text-xs mt-4">
              También puedes visitar el{" "}
              <Link href="/" className="underline hover:text-blue-900">
                sitio web del curso
              </Link>
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline">
              ← Volver a la página principal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
