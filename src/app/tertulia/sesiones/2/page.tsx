import { Breadcrumb } from "../../_components/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const BLOQUES = [
  {
    tiempo: "0 – 15 min",
    titulo: "Mini-taller de argumentación",
    detalle: "Tesis, premisa, evidencia, refutación. Conectores B2: por una parte / sin embargo / cabe matizar / desde mi punto de vista / lo cierto es que.",
  },
  {
    tiempo: "15 – 35 min",
    titulo: "Trabajo en parejas tertulianas",
    detalle: "Cada pareja prepara 3 argumentos sólidos con evidencia. El profesor rota entre mesas.",
  },
  {
    tiempo: "35 – 50 min",
    titulo: "Banco de léxico cultural",
    detalle: "Léxico específico para los 2 temas del grupo: estereotipos, gentrificación, asimilación vs. integración, variedades del español, etc.",
  },
  {
    tiempo: "50 – 60 min",
    titulo: "Exposición rápida",
    detalle: "Cada pareja dice su mejor argumento. Feedback grupal.",
  },
]

export default function Sesion2Page() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Breadcrumb items={[{ label: "Sesiones", href: "/tertulia/sesiones" }, { label: "Sesión 2" }]} />

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">Sesión 2</Badge>
          <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">Jueves 7 de mayo · 60 min</Badge>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Argumentación y léxico</h1>
        <p className="text-stone-600">Jueves 7 de mayo de 2026, 60 minutos.</p>
      </div>

      <Separator className="mb-8 bg-amber-200/60" />

      <div className="flex flex-col gap-3">
        {BLOQUES.map((b, i) => (
          <div key={i} className="flex gap-4 rounded-lg border border-stone-200 bg-white p-4 hover:border-emerald-200 transition-colors">
            <div className="shrink-0 w-24 font-mono text-xs text-emerald-700 font-semibold pt-0.5">
              {b.tiempo}
            </div>
            <div>
              <p className="font-medium text-stone-800 mb-1">{b.titulo}</p>
              <p className="text-sm text-stone-500 leading-relaxed">{b.detalle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
