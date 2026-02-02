import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, MessageSquare, Target, Users, Award, Zap, Clock, CheckCircle2, ArrowRight, GraduationCap, Mic } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-50">
      {/* Header/Nav */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Mic className="h-6 w-6 text-orange-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              PIO-7
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-slate-600 hover:text-orange-600 transition-colors">
              Características
            </a>
            <a href="#methodology" className="text-slate-600 hover:text-orange-600 transition-colors">
              Metodología
            </a>
            <a href="#syllabus" className="text-slate-600 hover:text-orange-600 transition-colors">
              Temario
            </a>
            <a href="#pricing" className="text-slate-600 hover:text-orange-600 transition-colors">
              Inscripción
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-600">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                Comenzar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-slate-200/[0.5] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">
              <GraduationCap className="mr-1 h-3 w-3" />
              Nivel C1 - Centro de Lenguas Modernas
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Producción e Interacción{' '}
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Oral en Español
              </span>
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-slate-600 sm:text-xl">
              Plataforma educativa innovadora para desarrollar competencias orales avanzadas en español.
              Metodología híbrida A/B con 16 sesiones prácticas y evaluación continua.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-lg px-8">
                  Comenzar curso
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#syllabus">
                <Button size="lg" variant="outline" className="text-lg px-8 border-2">
                  Ver temario
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              ✓ Acceso inmediato  ✓ Contenido C1 completo  ✓ Certificado UGR
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-white/50 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-600">16</div>
              <div className="text-sm text-slate-600">Sesiones prácticas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">C1</div>
              <div className="text-sm text-slate-600">Nivel MCER</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">8</div>
              <div className="text-sm text-slate-600">Tipos de tareas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">100%</div>
              <div className="text-sm text-slate-600">Materiales online</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Todo lo que necesitas para dominar el español oral
            </h2>
            <p className="text-lg text-slate-600">
              Plataforma integral con herramientas interactivas, seguimiento personalizado y contenido de calidad académica.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-orange-200 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Tareas Interactivas</CardTitle>
                <CardDescription>
                  8 tipos de ejercicios: selección múltiple, rellenar huecos, arrastrar y soltar, grabación de audio/vídeo
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-200 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Modo Pedagógico A/B</CardTitle>
                <CardDescription>
                  Enfoque integrador (A) o analítico (B) según tu estilo de aprendizaje. Cambia cuando quieras.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-200 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Asistencia QR</CardTitle>
                <CardDescription>
                  Sistema de control de asistencia con códigos QR dinámicos. Escanea desde tu móvil.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-200 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Autoevaluación</CardTitle>
                <CardDescription>
                  Checklists personalizados para monitorear tu progreso y identificar áreas de mejora.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-200 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Contenido Rico</CardTitle>
                <CardDescription>
                  Gramática, vocabulario, recursos descargables, vídeos y audios nativos en cada sesión.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-200 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle>Materiales siempre accesibles</CardTitle>
                <CardDescription>
                  Todos los contenidos del curso disponibles online. Mobile-first para consultar sobre la marcha.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="methodology" className="py-20 lg:py-28 bg-gradient-to-b from-white to-orange-50/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">
              Metodología Innovadora
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Aprendizaje Híbrido A/B
            </h2>
            <p className="text-lg text-slate-600">
              Elige el enfoque que mejor se adapte a tu estilo de aprendizaje en cada momento.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-orange-600 text-white">Modo A - Integrador</Badge>
                <CardTitle>Colaborativo y Espontáneo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                  <p className="text-slate-700">Debates y role-plays sin estructura rígida</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                  <p className="text-slate-700">Interacción fluida y natural</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                  <p className="text-slate-700">Aprendizaje a través de la conversación</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                  <p className="text-slate-700">Ideal para extrovertidos y conversadores</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-blue-600 text-white">Modo B - Analítico</Badge>
                <CardTitle>Estructurado con Apoyo Visual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-slate-700">Ejercicios guiados con ejemplos explícitos</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-slate-700">Organizadores gráficos y esquemas</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-slate-700">Feedback correctivo inmediato</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-slate-700">Perfecto para aprendices visuales</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-600">
              <Award className="inline h-5 w-5 mr-2 text-orange-600" />
              Cambia entre modos en cualquier momento según tus necesidades
            </p>
          </div>
        </div>
      </section>

      {/* Syllabus Section */}
      <section id="syllabus" className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">
              Temario Completo
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              16 Sesiones C1
            </h2>
            <p className="text-lg text-slate-600">
              Curso completo de producción e interacción oral organizado en 3 bloques temáticos
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Bloque 1 */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Bloque 1</CardTitle>
                    <CardDescription className="text-base">Fundamentos de la Expresión Oral C1</CardDescription>
                  </div>
                  <Badge className="text-sm">Sesiones 1-5</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-600"></span>
                    S1: Bienvenida y Evaluación Diagnóstica
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-600"></span>
                    S2: Estructuras de Argumentación
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-600"></span>
                    S3: Narración Avanzada y Descripción Detallada
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-600"></span>
                    S4: Técnicas de Exposición Oral
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-600"></span>
                    S5: <strong>Evaluación Parcial</strong>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Bloque 2 */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Bloque 2</CardTitle>
                    <CardDescription className="text-base">Interacción Avanzada y Contextos Profesionales</CardDescription>
                  </div>
                  <Badge className="text-sm">Sesiones 6-11</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    S6: Negociación y Mediación Intercultural
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    S7: El Debate Académico Formal
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    S8: La Entrevista Profesional
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    S9: Comunicación Intercultural
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    S10: Liderazgo y Comunicación de Equipos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-600"></span>
                    S11: <strong>Evaluación Parcial</strong>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Bloque 3 */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Bloque 3</CardTitle>
                    <CardDescription className="text-base">Perfeccionamiento y Maestría Comunicativa</CardDescription>
                  </div>
                  <Badge className="text-sm">Sesiones 12-16</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-600"></span>
                    S12: Precisión Léxica y Expresividad
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-600"></span>
                    S13: Pronunciación y Entonación Avanzadas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-600"></span>
                    S14: Coherencia y Cohesión Discursiva
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-600"></span>
                    S15: Ironía, Humor y Sutileza Pragmática
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-600"></span>
                    S16: <strong>Proyecto Final</strong>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing/CTA Section */}
      <section id="pricing" className="py-20 lg:py-28 bg-gradient-to-br from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
              Comienza tu viaje hacia la maestría del español oral
            </h2>
            <p className="mb-8 text-lg text-orange-50">
              Únete al curso Producción e Interacción Oral C1 de la Universidad de Granada.
              Acceso inmediato, certificado oficial y seguimiento personalizado.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold mb-2">16</div>
                  <div className="text-orange-100 text-sm">Sesiones completas</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold mb-2">∞</div>
                  <div className="text-orange-100 text-sm">Acceso ilimitado</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold mb-2">C1</div>
                  <div className="text-orange-100 text-sm">Certificado UGR</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" variant="secondary" className="text-lg px-8 bg-white text-orange-600 hover:bg-orange-50">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Registrarse ahora
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-orange-200">
              ✓ Sin compromiso  ✓ Soporte 24/7  ✓ Garantía de satisfacción
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-orange-600" />
                <span className="font-semibold">PIO-7</span>
                <span className="text-sm text-slate-500">| Centro de Lenguas Modernas · Universidad de Granada</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <Link href="/terminos" className="text-slate-600 hover:text-orange-600 transition-colors">
                  Términos
                </Link>
                <Link href="/privacidad" className="text-slate-600 hover:text-orange-600 transition-colors">
                  Privacidad
                </Link>
                <Link href="/contacto" className="text-slate-600 hover:text-orange-600 transition-colors">
                  Contacto
                </Link>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t">
              <div className="text-sm text-slate-600 text-center">
                Desarrollado por <span className="font-medium">Javier Benítez Láinez</span>
              </div>
              <div className="text-sm text-slate-500">
                © 2026 PIO-7. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
