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
import { Bell } from "lucide-react"

const FASES = [
  { tiempo: "0:00 – 1:00", fase: "Presentación del tema y de los tertulianos", quien: "Moderador" },
  { tiempo: "1:00 – 3:00", fase: "Apertura A FAVOR (2 min)", quien: "Tertulianos 1 y 2" },
  { tiempo: "3:00 – 5:00", fase: "Apertura EN CONTRA (2 min)", quien: "Tertulianos 3 y 4" },
  { tiempo: "5:00 – 8:00", fase: "Cruce 1: refutación (3 min)", quien: "Los 4 tertulianos" },
  { tiempo: "8:00 – 10:00", fase: "Preguntas del público (2 min)", quien: "Público" },
  { tiempo: "10:00 – 13:00", fase: "Cruce 2: réplica y contrarréplica (3 min)", quien: "Los 4 tertulianos" },
  { tiempo: "13:00 – 14:30", fase: "Cierre A FAVOR + EN CONTRA (45 seg cada lado)", quien: "Tertulianos" },
  { tiempo: "14:30 – 16:00", fase: "Síntesis y cierre del moderador", quien: "Moderador" },
]

export default function FormatoPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Breadcrumb items={[{ label: "Formato del debate" }]} />

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-amber-100 text-amber-800 border-amber-200" variant="secondary">
            16 minutos
          </Badge>
          <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">
            Formato académico
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Formato del debate</h1>
        <p className="text-stone-600 leading-relaxed max-w-2xl">
          Inspirado en el debate académico estadounidense, adaptado al espíritu de tertulia y al nivel B2.
        </p>
      </div>

      <Separator className="mb-8 bg-amber-200/60" />

      {/* Tabla de fases */}
      <div className="rounded-xl border border-stone-200 overflow-hidden mb-8">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50 hover:bg-stone-50">
              <TableHead className="w-32 font-semibold text-stone-700">Tiempo</TableHead>
              <TableHead className="font-semibold text-stone-700">Fase</TableHead>
              <TableHead className="w-44 font-semibold text-stone-700">Quién</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {FASES.map((row, i) => (
              <TableRow
                key={i}
                className={
                  i % 2 === 0
                    ? "bg-white hover:bg-amber-50/40"
                    : "bg-stone-50/50 hover:bg-amber-50/40"
                }
              >
                <TableCell className="font-mono text-sm text-amber-700 font-medium whitespace-nowrap">
                  {row.tiempo}
                </TableCell>
                <TableCell className="text-stone-800">{row.fase}</TableCell>
                <TableCell className="text-stone-600 text-sm">{row.quien}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Nota */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-stone-700">
        <Bell className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <p>
          El cronometrador avisa con campana o gesto a 30 segundos del fin de cada turno. El reportero (vídeo-foto) trabaja en silencio.
        </p>
      </div>
    </div>
  )
}
