import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Users, Clock, ChevronRight, BookOpen, ListChecks, FileText, Mic2, Star } from "lucide-react"

const SECTIONS = [
  {
    href: "/tertulia/formato",
    icon: Clock,
    title: "Formato del debate",
    description: "Estructura de 16 minutos: fases, turnos y roles cronometrados.",
    badge: "16 min",
  },
  {
    href: "/tertulia/temas",
    icon: Star,
    title: "Los cuatro temas",
    description: "Seleccionados por votación en clase. Cada grupo trabaja dos.",
    badge: "4 debates",
  },
  {
    href: "/tertulia/sesiones",
    icon: BookOpen,
    title: "Sesiones de preparación",
    description: "Cinco clases (5–19 mayo) para argumentar, refutar y ensayar.",
    badge: "5 sesiones",
  },
  {
    href: "/tertulia/escaleta",
    icon: ListChecks,
    title: "Escaleta del 20 mayo",
    description: "Cronograma completo de la tarde en el escenario de La Tertulia.",
    badge: "18:30 h",
  },
  {
    href: "/tertulia/roles",
    icon: Users,
    title: "Reparto de roles",
    description: "Tertulianos, moderador, cronometrador, reportero y público activo.",
    badge: "Rotativo",
  },
  {
    href: "/tertulia/dosier",
    icon: FileText,
    title: "Dosier de prensa",
    description: "Artículos sobre el cierre de La Tertulia. Lectura previa obligatoria.",
    badge: "Lectura",
  },
]

export default function TertuliaPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
            PIO 7 + PIO 8 · B2
          </Badge>
          <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">
            CLM-UGR
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-3 leading-tight">
          Debates en La Tertulia
        </h1>
        <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
          La cultura granadina ante el cierre de un espacio histórico y la candidatura a Capital Europea de la Cultura 2031
        </p>
      </div>

      {/* Evento destacado */}
      <div className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-5 mb-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-3">Evento final</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-stone-500">Fecha</p>
              <p className="text-sm font-semibold text-stone-800">Miércoles 20 de mayo de 2026</p>
              <p className="text-sm text-stone-700">18:30 h</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-stone-500">Lugar</p>
              <p className="text-sm font-semibold text-stone-800">Bar Cultural La Tertulia</p>
              <p className="text-sm text-stone-700">Granada</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-stone-500">Participantes</p>
              <p className="text-sm font-semibold text-stone-800">22 estudiantes B2</p>
              <p className="text-sm text-stone-700">PIO 7 (10:00) + PIO 8 (13:00)</p>
              <p className="text-sm text-stone-700">+ 5 cronistas (PE)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Intro */}
      <div className="prose prose-stone max-w-none mb-10">
        <p className="text-stone-700 leading-relaxed mb-4">
          La Tertulia, fundada en 1980, cierra a finales de mayo de 2026 tras cuarenta y seis años como referente cultural de Granada. Por sus mesas y escenario pasaron Mario Benedetti, Rafael Alberti, José Saramago, Enrique Morente, Ángel González, Joaquín Sabina o Javier Egea. Este proyecto académico convierte ese cierre, y la candidatura de Granada a Capital Europea de la Cultura 2031, en materia de debate.
        </p>
        <p className="text-stone-700 leading-relaxed">
          A lo largo de cinco sesiones de aula prepararemos cuatro debates cronometrados de dieciséis minutos, más un debate final colectivo, que se celebrarán en el escenario de La Tertulia. La crónica de la jornada se publicará en la revista cultural <em>Olvidos de Granada</em>.
        </p>
      </div>

      <Separator className="mb-10 bg-amber-200/60" />

      {/* Nav cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon
          return (
            <Link key={section.href} href={section.href} className="group">
              <Card className="h-full border-stone-200 hover:border-amber-300 hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2 rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors">
                      <Icon className="h-4 w-4 text-amber-700" />
                    </div>
                    <Badge variant="outline" className="text-xs border-stone-200 text-stone-500 shrink-0">
                      {section.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-base text-stone-800 group-hover:text-amber-700 transition-colors">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-stone-500 text-sm leading-relaxed">
                    {section.description}
                  </CardDescription>
                  <div className="flex items-center gap-1 mt-3 text-xs text-amber-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver más <ChevronRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
