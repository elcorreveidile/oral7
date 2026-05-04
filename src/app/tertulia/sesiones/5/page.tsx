import { Breadcrumb } from "../../_components/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const BLOQUES = [
  {
    tiempo: "0 – 16 min",
    titulo: "Debate pendiente (si procede)",
    detalle: "Si en la sesión 4 no dio tiempo a repasar algún debate, se ensaya aquí.",
  },
  {
    tiempo: "16 – 35 min",
    titulo: "Preparación del debate final",
    detalle: "Trabajo en grupos pequeños sobre subtemas del debate sobre La Tertulia y Granada 2031, incluida la cuestión de la asociación cultural (¿con salario o socios voluntarios?). Cada grupo elabora 2 preguntas concretas para lanzar en el debate final.",
  },
  {
    tiempo: "35 – 50 min",
    titulo: "Banco común de preguntas",
    detalle: "Votación rápida de las mejores preguntas. Designación del moderador rotativo para el debate final.",
  },
  {
    tiempo: "50 – 58 min",
    titulo: "Logística",
    detalle: "Punto de encuentro, hora, ropa, móviles cargados para el reportero, recordatorio de respeto al espacio.",
  },
  {
    tiempo: "58 – 60 min",
    titulo: "Cierre y ánimos",
    detalle: "Mañana es el día.",
  },
]

export default function Sesion5Page() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Breadcrumb items={[{ label: "Sesiones", href: "/tertulia/sesiones" }, { label: "Sesión 5" }]} />

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-rose-100 text-rose-800 border-rose-200">Sesión 5 · Víspera</Badge>
          <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">Martes 19 de mayo · 60 min</Badge>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Debate pendiente + preparación del final + logística</h1>
        <p className="text-stone-600">Martes 19 de mayo de 2026, 60 minutos. Víspera del debate. PIO 7 a las 10:00 · PIO 8 a las 13:00.</p>
      </div>

      <Separator className="mb-8 bg-amber-200/60" />

      <div className="flex flex-col gap-3">
        {BLOQUES.map((b, i) => (
          <div key={i} className="flex gap-4 rounded-lg border border-stone-200 bg-white p-4 hover:border-rose-200 transition-colors">
            <div className="shrink-0 w-24 font-mono text-xs text-rose-700 font-semibold pt-0.5">
              {b.tiempo}
            </div>
            <div>
              <p className="font-medium text-stone-800 mb-1">{b.titulo}</p>
              {b.detalle && <p className="text-sm text-stone-500 leading-relaxed">{b.detalle}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
