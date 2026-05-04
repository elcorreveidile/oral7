import Link from "next/link"
import { Breadcrumb } from "../_components/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronRight } from "lucide-react"

const SESIONES = [
  {
    num: 1,
    fecha: "Martes 5 de mayo",
    titulo: "Inmersión en La Tertulia y formato del debate",
    desc: "Presentación del proyecto, lectura del dosier y reparto de roles.",
    color: "border-sky-200 hover:border-sky-400",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
  },
  {
    num: 2,
    fecha: "Jueves 7 de mayo",
    titulo: "Argumentación y léxico",
    desc: "Mini-taller de argumentación, trabajo en parejas y banco de léxico.",
    color: "border-emerald-200 hover:border-emerald-400",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    num: 3,
    fecha: "Martes 12 de mayo",
    titulo: "Refutación, réplica y discurso espontáneo",
    desc: "Simulacros de cruce, preparación de moderadores y cronometradores.",
    color: "border-violet-200 hover:border-violet-400",
    badge: "bg-violet-100 text-violet-800 border-violet-200",
  },
  {
    num: 4,
    fecha: "Miércoles 13 de mayo",
    titulo: "Ensayo de los debates",
    desc: "Debates 1, 2 y 3 ensayados con feedback del profesor.",
    color: "border-amber-200 hover:border-amber-400",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    num: 5,
    fecha: "Martes 19 de mayo",
    titulo: "Debate 4 + preparación del final + logística",
    desc: "Víspera del debate. Debate 4, preparación del final colectivo y logística.",
    color: "border-rose-200 hover:border-rose-400",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
  },
]

export default function SesionesIndexPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Breadcrumb items={[{ label: "Sesiones de preparación" }]} />

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
            5 sesiones
          </Badge>
          <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">
            5 – 19 mayo
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Las cinco sesiones de preparación</h1>
        <p className="text-stone-600 leading-relaxed">
          Del 5 al 19 de mayo. Cada sesión se imparte dos veces: PIO 7 a las 10:00 y PIO 8 a las 13:00.
        </p>
      </div>

      <Separator className="mb-8 bg-amber-200/60" />

      <div className="flex flex-col gap-4">
        {SESIONES.map((s) => (
          <Link key={s.num} href={`/tertulia/sesiones/${s.num}`} className="group">
            <Card className={`border transition-all duration-200 hover:shadow-md ${s.color}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 group-hover:bg-white transition-colors font-bold text-stone-700">
                      {s.num}
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 mb-0.5">{s.fecha}</p>
                      <CardTitle className="text-base text-stone-800 group-hover:text-amber-700 transition-colors leading-snug">
                        {s.titulo}
                      </CardTitle>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-stone-400 group-hover:text-amber-600 shrink-0 mt-1 transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-stone-500 pl-12">{s.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
