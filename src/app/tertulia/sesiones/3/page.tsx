import { Breadcrumb } from "../../_components/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const BLOQUES = [
  {
    tiempo: "0 – 10 min",
    titulo: "Repaso: fórmulas para refutar",
    detalle: "Me permito discrepar / ese argumento no se sostiene porque / acepto su punto pero…",
  },
  {
    tiempo: "10 – 35 min",
    titulo: "Simulacro de cruce",
    detalle: "Dos parejas debaten 5 minutos sobre uno de los temas, sin preparación previa. Las otras observan. Se repite con otra pareja.",
  },
  {
    tiempo: "35 – 50 min",
    titulo: "Trabajo de moderadores y cronometradores",
    detalle: "Los moderadores redactan una mini-introducción de su tema (un minuto) y preparan preguntas para reactivar el debate si decae. Los cronometradores ensayan los avisos.",
  },
  {
    tiempo: "50 – 60 min",
    titulo: "Tarea para casa",
    detalle: "Cada tertuliano trae escritos en casa su apertura (2 min) y su cierre (45 seg).",
  },
]

export default function Sesion3Page() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Breadcrumb items={[{ label: "Sesiones", href: "/tertulia/sesiones" }, { label: "Sesión 3" }]} />

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-violet-100 text-violet-800 border-violet-200">Sesión 3</Badge>
          <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">Martes 12 de mayo · 60 min</Badge>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Refutación y discurso espontáneo</h1>
        <p className="text-stone-600">Martes 12 de mayo de 2026, 60 minutos.</p>
      </div>

      <Separator className="mb-8 bg-amber-200/60" />

      <div className="flex flex-col gap-3">
        {BLOQUES.map((b, i) => (
          <div key={i} className="flex gap-4 rounded-lg border border-stone-200 bg-white p-4 hover:border-violet-200 transition-colors">
            <div className="shrink-0 w-24 font-mono text-xs text-violet-700 font-semibold pt-0.5">
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
