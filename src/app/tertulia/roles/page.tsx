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
import { Info } from "lucide-react"

const ROLES = [
  {
    rol: "Tertulianos a favor",
    num: "2",
    funcion: "Defienden la tesis",
  },
  {
    rol: "Tertulianos en contra",
    num: "2",
    funcion: "Defienden la antítesis",
  },
  {
    rol: "Moderador",
    num: "1",
    funcion: "Presenta, da turnos, sintetiza",
  },
  {
    rol: "Cronometrador",
    num: "1",
    funcion: "Marca los tiempos de cada fase",
  },
  {
    rol: "Reportero",
    num: "1",
    funcion: "Vídeo y fotografía, en silencio",
  },
  {
    rol: "Público activo",
    num: "4",
    funcion: "Preguntas en la fase de público",
  },
]

export default function RolesPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Breadcrumb items={[{ label: "Reparto de roles" }]} />

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
            11 por grupo
          </Badge>
          <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">
            Rotación entre debates
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Reparto de roles</h1>
        <p className="text-stone-600 leading-relaxed max-w-2xl">
          Cada grupo tiene 11 estudiantes. En cada uno de los cuatro debates participan: 4 tertulianos (2 a favor, 2 en contra), 1 moderador, 1 cronometrador, 1 reportero (vídeo-foto) y 4 personas desde el público. Los roles rotan entre debates para que todos sean tertulianos al menos una vez.
        </p>
      </div>

      <Separator className="mb-8 bg-amber-200/60" />

      <div className="rounded-xl border border-stone-200 overflow-hidden mb-8">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50 hover:bg-stone-50">
              <TableHead className="font-semibold text-stone-700">Rol</TableHead>
              <TableHead className="w-16 text-center font-semibold text-stone-700">Nº</TableHead>
              <TableHead className="font-semibold text-stone-700">Función</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROLES.map((row, i) => (
              <TableRow key={i} className={i % 2 === 0 ? "bg-white hover:bg-amber-50/30" : "bg-stone-50/50 hover:bg-amber-50/30"}>
                <TableCell className="font-medium text-stone-800">{row.rol}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="border-amber-200 text-amber-800 bg-amber-50 font-mono">
                    {row.num}
                  </Badge>
                </TableCell>
                <TableCell className="text-stone-600 text-sm">{row.funcion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
        <Info className="h-4 w-4 text-stone-500 mt-0.5 shrink-0" />
        <p>El reparto nominativo final se trabaja en la sesión 1.</p>
      </div>
    </div>
  )
}
