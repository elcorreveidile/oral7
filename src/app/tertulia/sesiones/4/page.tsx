import { Breadcrumb } from "../../_components/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const BLOQUES = [
  {
    tiempo: "0 – 5 min",
    titulo: "Recordatorio de la estructura",
    detalle: "Repaso de los 16 minutos y los avisos del cronómetro.",
  },
  {
    tiempo: "5 – 21 min",
    titulo: "Debate 1 ensayado",
    detalle: "Primer tema del grupo. Todos los roles activos.",
  },
  {
    tiempo: "21 – 22 min",
    titulo: "Feedback rápido del profesor",
    detalle: "",
  },
  {
    tiempo: "22 – 38 min",
    titulo: "Debate 2 ensayado",
    detalle: "Segundo tema del grupo. Todos los roles activos.",
  },
  {
    tiempo: "38 – 39 min",
    titulo: "Feedback",
    detalle: "",
  },
  {
    tiempo: "39 – 55 min",
    titulo: "Repaso dirigido",
    detalle: "Vuelta a las fases que más costaron (cruce, cierre). Opcional: intercambio de roles.",
  },
  {
    tiempo: "55 – 60 min",
    titulo: "Tarea",
    detalle: "Refinar argumentación, vestuario opcional para La Tertulia, traer libreta para el debate final.",
  },
]

export default function Sesion4Page() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Breadcrumb items={[{ label: "Sesiones", href: "/tertulia/sesiones" }, { label: "Sesión 4" }]} />

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">Sesión 4</Badge>
          <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">Miércoles 13 de mayo · 60 min</Badge>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Ensayo de los debates</h1>
        <p className="text-stone-600">Miércoles 13 de mayo de 2026, 60 minutos. PIO 7 a las 10:00 · PIO 8 a las 13:00.</p>
      </div>

      <Separator className="mb-8 bg-amber-200/60" />

      <div className="flex flex-col gap-3">
        {BLOQUES.map((b, i) => (
          <div key={i} className="flex gap-4 rounded-lg border border-stone-200 bg-white p-4 hover:border-amber-200 transition-colors">
            <div className="shrink-0 w-24 font-mono text-xs text-amber-700 font-semibold pt-0.5">
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
