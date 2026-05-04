import { Breadcrumb } from "../_components/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MapPin } from "lucide-react"

const ESCALETA = [
  { tramo: "18:30 – 18:40", bloque: "Llegada, recibimiento, ubicación" },
  { tramo: "18:40 – 18:45", bloque: "Bienvenida y presentación del proyecto" },
  { tramo: "18:45 – 19:01", bloque: "Debate 1 — Grupo A (tema 1)" },
  { tramo: "19:01 – 19:05", bloque: "Cambio de equipo" },
  { tramo: "19:05 – 19:21", bloque: "Debate 2 — Grupo B (tema 2)" },
  { tramo: "19:21 – 19:30", bloque: "Pausa breve" },
  { tramo: "19:30 – 19:46", bloque: "Debate 3 — Grupo A (tema 3)" },
  { tramo: "19:46 – 19:50", bloque: "Cambio" },
  { tramo: "19:50 – 20:06", bloque: "Debate 4 — Grupo B (tema 4)" },
  { tramo: "20:06 – 20:15", bloque: "Pausa y reorganización (todos al patio de butacas)" },
  { tramo: "20:15 – 20:45", bloque: "Debate final colectivo sobre La Tertulia y Granada 2031" },
  { tramo: "20:45 – 20:55", bloque: "Cierre, foto de grupo, agradecimiento al local" },
]

export default function EscaletaPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Breadcrumb items={[{ label: "Escaleta del 20 mayo" }]} />

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
            20 mayo · 18:30
          </Badge>
          <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">
            ~2 h 25 min
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Escaleta del 20 de mayo en La Tertulia</h1>
        <div className="flex items-center gap-1.5 text-stone-600">
          <MapPin className="h-4 w-4 text-amber-700" />
          <span>Bar Cultural La Tertulia, Granada · Inicio: 18:30 h</span>
        </div>
      </div>

      <Separator className="mb-8 bg-amber-200/60" />

      <div className="rounded-xl border border-stone-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50 hover:bg-stone-50">
              <TableHead className="w-40 font-semibold text-stone-700">Tramo</TableHead>
              <TableHead className="font-semibold text-stone-700">Bloque</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ESCALETA.map((row, i) => {
              const isDebate = row.bloque.startsWith("Debate") && !row.bloque.includes("final")
              const isFinal = row.bloque.includes("final colectivo")
              const isPausa = row.bloque.toLowerCase().includes("pausa") || row.bloque.includes("Cambio")
              const isCierre = row.bloque.includes("Cierre")

              const rowClass = isFinal
                ? "bg-amber-50 hover:bg-amber-100/60 font-medium"
                : isDebate
                ? "bg-sky-50/50 hover:bg-sky-50"
                : isPausa
                ? "bg-stone-50/80 hover:bg-stone-100/60 text-stone-500"
                : isCierre
                ? "bg-emerald-50/50 hover:bg-emerald-50"
                : "bg-white hover:bg-stone-50/50"

              return (
                <TableRow key={i} className={rowClass}>
                  <TableCell className="font-mono text-sm text-amber-700 font-medium whitespace-nowrap">
                    {row.tramo}
                  </TableCell>
                  <TableCell className="text-stone-800">{row.bloque}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
