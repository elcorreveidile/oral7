import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Términos y condiciones</h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Última actualización: febrero de 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Aceptación de los términos</h2>
            <p className="text-slate-600 mb-4">
              Al acceder y utilizar la plataforma PIO-7 (Producción e Interacción Oral),
              aceptas cumplir con estos términos y condiciones de uso. Si no estás de acuerdo
              con alguna parte de estos términos, no debes utilizar la plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Descripción del servicio</h2>
            <p className="text-slate-600 mb-4">
              PIO-7 es una plataforma educativa desarrollada para el Centro de Lenguas Modernas
              de la Universidad de Granada. Proporciona recursos y herramientas para el curso
              de Producción e Interacción Oral en Español nivel C1.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Registro y cuenta</h2>
            <p className="text-slate-600 mb-4">
              Para acceder a la plataforma necesitas crear una cuenta con información veraz.
              Eres responsable de mantener la confidencialidad de tus credenciales de acceso
              y de todas las actividades realizadas desde tu cuenta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Uso aceptable</h2>
            <p className="text-slate-600 mb-4">
              Te comprometes a utilizar la plataforma únicamente con fines educativos y de
              acuerdo con las normas del Centro de Lenguas Modernas. Está prohibido:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Compartir credenciales de acceso con terceros</li>
              <li>Copiar o distribuir contenido protegido</li>
              <li>Usar la plataforma para actividades ilegales</li>
              <li>Intentar acceder a áreas restringidas del sistema</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Propiedad intelectual</h2>
            <p className="text-slate-600 mb-4">
              Todo el contenido de la plataforma (textos, imágenes, vídeos, ejercicios)
              es propiedad del Centro de Lenguas Modernas de la Universidad de Granada
              o de sus respectivos autores. No está permitida su reproducción sin
              autorización expresa.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Asistencia y evaluación</h2>
            <p className="text-slate-600 mb-4">
              El sistema de control de asistencia mediante QR es obligatorio. Se requiere
              un mínimo del 80% de asistencia para poder presentarse a los exámenes.
              Las evaluaciones se realizarán según el calendario establecido.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Modificaciones</h2>
            <p className="text-slate-600 mb-4">
              Nos reservamos el derecho de modificar estos términos en cualquier momento.
              Los cambios serán notificados a través de la plataforma y entrarán en vigor
              desde su publicación.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Contacto</h2>
            <p className="text-slate-600 mb-4">
              Para cualquier consulta sobre estos términos, puedes contactarnos a través
              del <Link href="/contacto" className="text-orange-600 hover:underline">formulario de contacto</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
