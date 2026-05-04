import { Breadcrumb } from "../_components/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Users } from "lucide-react"

// Artículos encontrados sobre el cierre de La Tertulia (abril–mayo 2026)
const ARTICULOS = [
  {
    titulo: "Cierra el bar La Tertulia: historia y cultura de Granada",
    medio: "Ideal",
    fecha: "8 de abril de 2026",
    url: "https://www.ideal.es/granada/cierra-bar-tertulia-historia-cultura-granada-20260408205226-nt.html",
    resumen: "Reportaje sobre la historia del local fundado en 1980 y el anuncio de su cierre.",
  },
  {
    titulo: "El bar granadino La Tertulia, icono cultural desde la Transición, intenta evitar su cierre",
    medio: "Infobae / Agencias",
    fecha: "25 de abril de 2026",
    url: "https://www.infobae.com/espana/agencias/2026/04/25/el-bar-granadino-la-tertulia-icono-cultural-desde-la-transicion-intenta-evitar-su-cierre/",
    resumen: "La familia Rébora impulsa la creación de una asociación cultural con al menos 200 socios antes del 23 de mayo para evitar el cierre definitivo el 30 de mayo.",
  },
  {
    titulo: "El cierre del mítico pub La Tertulia de Granada, síntoma de la transformación de la noche española",
    medio: "El Diario",
    fecha: "Abril 2026",
    url: "https://www.eldiario.es/andalucia/lacajanegra/musica/cierre-mitico-pub-tertulia-granada-sintoma-transformacion-noche-espanola_1_13144770.html",
    resumen: "Análisis del cierre como reflejo de los cambios en el ocio nocturno y la vida cultural urbana en España.",
  },
  {
    titulo: "Adiós a este pub de Granada que ha vivido más de 45 años: su cierre evidencia que ya no se sale ni se convive como antes",
    medio: "OKDiario",
    fecha: "Abril 2026",
    url: "https://talent24h.okdiario.com/adios-a-este-pub-de-granada-que-ha-vivido-mas-de-45-anos-su-cierre-evidencia-que-ya-no-se-sale-ni-se-convive-como-antes/",
    resumen: "El caso de La Tertulia como ejemplo de la crisis de los espacios culturales de barrio frente a los cambios de hábitos sociales.",
  },
  {
    titulo: "El mítico Bar La Tertulia de Granada bajará definitivamente su persiana",
    medio: "101TV",
    fecha: "Abril 2026",
    url: "https://www.101tv.es/bar-tertulia-granada-cierre-cultura/",
    resumen: "Crónica del anuncio oficial del cierre y reacciones de la comunidad cultural granadina.",
  },
  {
    titulo: "La Tertulia, de Enrique Morente a Almudena Grandes: el bar de Granada donde ha vivido y bebido la cultura se despide",
    medio: "Poesía Castellana",
    fecha: "Abril 2026",
    url: "https://www.poesiacastellana.es/noticias/la-tertulia-de-enrique-morente-a-almudena-grandes-el-bar-de-granada-donde-ha-vivido-y-bebido-la-cultura-se-despide",
    resumen: "Repaso por las figuras literarias y artísticas que pasaron por La Tertulia a lo largo de sus 46 años de historia.",
  },
]

export default function DosierPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Breadcrumb items={[{ label: "Dosier de prensa" }]} />

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
            Lectura obligatoria
          </Badge>
          <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">
            Antes de la sesión 2
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Dosier de prensa: el cierre de La Tertulia</h1>
        <p className="text-stone-600 leading-relaxed">
          Lectura obligatoria antes de la sesión 2. Tomar notas para el debate.
        </p>
      </div>

      <Separator className="mb-8 bg-amber-200/60" />

      {/* Artículos */}
      <h2 className="text-lg font-semibold text-stone-800 mb-4">Artículos</h2>
      <div className="grid gap-3 sm:grid-cols-2 mb-10">
        {ARTICULOS.map((art, i) => (
          <a
            key={i}
            href={art.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Card className="h-full border-stone-200 hover:border-amber-300 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="outline" className="text-xs border-stone-200 text-stone-500">
                      {art.medio}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-stone-200 text-stone-400">
                      {art.fecha}
                    </Badge>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-stone-400 group-hover:text-amber-600 shrink-0 transition-colors" />
                </div>
                <CardTitle className="text-sm text-stone-800 group-hover:text-amber-700 transition-colors leading-snug font-medium mt-1">
                  {art.titulo}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-stone-500 leading-relaxed">{art.resumen}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      <Separator className="mb-8 bg-amber-200/60" />

      {/* Iniciativa asociación */}
      <div className="rounded-xl border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-amber-700" />
          <h2 className="text-lg font-semibold text-stone-900">La iniciativa de la asociación</h2>
        </div>
        <p className="text-stone-700 leading-relaxed text-sm">
          Una de las ideas en circulación es transformar La Tertulia en una asociación cultural cuyas cuotas de socios cubran el alquiler del local. La familia Rébora (Horacio y Elena) estima necesario alcanzar al menos 200 socios antes del 23 de mayo para garantizar la viabilidad del proyecto.
        </p>
        <p className="text-stone-700 leading-relaxed text-sm mt-3">
          Pregunta abierta para el debate final: ¿debe haber salario para quien gestione el espacio, o son los propios socios quienes se ocupen de su sostenimiento de forma voluntaria?
        </p>
      </div>
    </div>
  )
}
