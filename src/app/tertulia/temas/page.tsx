import { Breadcrumb } from "../_components/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users } from "lucide-react"

const TEMAS = [
  {
    medal: "🥇",
    titulo: "Estereotipos con Study Abroad",
    subtitulo: "¿Qué rompemos, qué reforzamos?",
    votos: 14,
    categoria: "Reflexión",
    color: "from-amber-50 to-yellow-50 border-amber-200",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    medal: "🥈",
    titulo: "Español de España vs. Latinoamérica",
    subtitulo: "¿Qué español deberíamos aprender: el peninsular o el latino?",
    votos: 10,
    categoria: "Lengua",
    color: "from-sky-50 to-blue-50 border-sky-200",
    badgeClass: "bg-sky-100 text-sky-800 border-sky-200",
  },
  {
    medal: "🥉",
    titulo: "Experiencia en familia española",
    subtitulo: "¿Inmersión o choque cultural?",
    votos: 9,
    categoria: "Experiencia personal",
    color: "from-emerald-50 to-green-50 border-emerald-200",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    medal: "🏅",
    titulo: "Integración vs. Asimilación",
    subtitulo: "¿Debemos integrarnos o mantener nuestra identidad estadounidense?",
    votos: 9,
    categoria: "Identidad",
    color: "from-violet-50 to-purple-50 border-violet-200",
    badgeClass: "bg-violet-100 text-violet-800 border-violet-200",
  },
]

export default function TemasPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Breadcrumb items={[{ label: "Los cuatro temas" }]} />

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
            4 debates
          </Badge>
          <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">
            Votados en clase
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Los cuatro temas</h1>
        <p className="text-stone-600 leading-relaxed">
          Cada grupo de PIO trabaja dos de los cuatro.
        </p>
      </div>

      <Separator className="mb-8 bg-amber-200/60" />

      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        {TEMAS.map((tema, i) => (
          <Card key={i} className={`border bg-gradient-to-br ${tema.color}`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl">{tema.medal}</span>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className={`text-xs ${tema.badgeClass}`}>
                    {tema.categoria}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-stone-200 text-stone-500">
                    {tema.votos} votos
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-base text-stone-900 leading-snug mt-1">
                {tema.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-600 text-sm italic">{tema.subtitulo}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="mb-8 bg-amber-200/60" />

      {/* Debate final */}
      <div className="rounded-xl border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-amber-700" />
          <h2 className="text-lg font-semibold text-stone-900">
            Debate final colectivo (todos los participantes)
          </h2>
        </div>
        <p className="text-stone-700 leading-relaxed text-sm">
          Tras los cuatro debates, todo el grupo participará en un debate abierto sobre el cierre de La Tertulia y la candidatura de Granada a Capital Europea de la Cultura 2031. Incluirá, entre otros, el dilema sobre la iniciativa de transformar el local en asociación: ¿debe haber salario para quien lo gestione o lo sostienen socios voluntarios?
        </p>
      </div>
    </div>
  )
}
