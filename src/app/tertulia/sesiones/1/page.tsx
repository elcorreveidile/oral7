import { Breadcrumb } from "../../_components/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const BLOQUES = [
  {
    tiempo: "0 – 10 min",
    titulo: "Presentación del proyecto",
    detalle: "Por qué La Tertulia, por qué ahora.",
  },
  {
    tiempo: "10 – 25 min",
    titulo: "Lectura del dosier de prensa",
    detalle: "Anotación individual: “¿qué te ha sorprendido?”",
  },
  {
    tiempo: "25 – 40 min",
    titulo: "Presentación del formato de debate",
    detalle: "Comparación entre el competitive debate estadounidense y el classroom discussion. Pregunta abierta al grupo: “¿habéis hecho debates en vuestra universidad? ¿cómo eran?”",
  },
  {
    tiempo: "40 – 55 min",
    titulo: "Asignación de temas y reparto de roles",
    detalle: "Asignación de los 4 temas a cada grupo. Reparto de roles para los 4 debates (tertulianos, moderadores, cronometradores, reporteros, público).",
  },
  {
    tiempo: "55 – 60 min",
    titulo: "Tarea para casa",
    detalle: "Leer el dosier completo y empezar a pensar argumentos del tema asignado.",
  },
]

export default function Sesion1Page() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Breadcrumb items={[{ label: "Sesiones", href: "/tertulia/sesiones" }, { label: "Sesión 1" }]} />

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-sky-100 text-sky-800 border-sky-200">Sesión 1</Badge>
          <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">Martes 5 de mayo · 60 min</Badge>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Inmersión y formato</h1>
        <p className="text-stone-600">Martes 5 de mayo de 2026, 60 minutos.</p>
      </div>

      <Separator className="mb-8 bg-amber-200/60" />

      <div className="flex flex-col gap-3">
        {BLOQUES.map((b, i) => (
          <div key={i} className="flex gap-4 rounded-lg border border-stone-200 bg-white p-4 hover:border-sky-200 transition-colors">
            <div className="shrink-0 w-24 font-mono text-xs text-sky-700 font-semibold pt-0.5">
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
