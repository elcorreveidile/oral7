import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Scale } from "lucide-react"

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-clm-50 via-white to-granada-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Términos y Condiciones de Uso</h1>
          </div>
          <p className="text-muted-foreground">
            Plataforma PIO-7 · Centro de Lenguas Modernas · Universidad de Granada
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Última actualización: Febrero 2026
          </p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-6 prose dark:prose-invert max-w-none">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                1. Aceptación de Términos
              </h2>
              <p>
                El acceso y uso de la plataforma PIO-7 (en adelante, "la Plataforma") proporcionada por
                el Centro de Lenguas Modernas de la Universidad de Granada implica la aceptación
                completa de estos términos y condiciones. Si no está de acuerdo con estos términos,
                por favor no utilice la Plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Descripción del Servicio</h2>
              <p>
                La Plataforma PIO-7 es un sistema educativo diseñado para el curso de Producción
                e Interacción Oral (nivel C1) del Centro de Lenguas Modernas. El servicio incluye:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Acceso a materiales didácticos y recursos para el aprendizaje de español</li>
                <li>Seguimiento del progreso académico y asistencia</li>
                <li>Interactividad con contenidos y ejercicios prácticos</li>
                <li>Comunicación con profesores y compañeros</li>
                <li>Gestión de evaluaciones y autoevaluaciones</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Responsabilidades del Usuario</h2>
              <p>El usuario se compromete a:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Proporcionar información veraz y actualizada al registrarse</li>
                <li>Mantener la confidencialidad de sus credenciales de acceso</li>
                <li>Utilizar la Plataforma únicamente con fines educativos</li>
                <li>Respetar a profesores y compañeros en todas las interacciones</li>
                <li>No compartir contenidos de la Plataforma sin autorización</li>
                <li>No realizar actividades que puedan dañar el funcionamiento de la Plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Propiedad Intelectual</h2>
              <p>
                Todos los contenidos de la Plataforma (textos, imágenes, videos, ejercicios,
                materiales didácticos, etc.) son propiedad del Centro de Lenguas Modernas o de
                terceros que han autorizado su uso. Queda prohibida su reproducción, distribución
                o modificación sin autorización expresa.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Privacidad y Protección de Datos</h2>
              <p>
                Los datos personales proporcionados por los usuarios serán tratados conforme a
                lo establecido en la Política de Privacidad de la Plataforma y en la normativa
                vigente en materia de protección de datos (RGPD). Para más información, consulte
                nuestra Política de Privacidad.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Asistencia y Evaluación</h2>
              <p>
                El curso requiere una asistencia mínima del 80% para poder ser evaluado. La
                plataforma permite registrar la asistencia mediante código QR. La falsificación
                de asistencia puede conllevar sanciones académicas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Contenido del Usuario</h2>
              <p>
                El usuario es responsable de todo el contenido que publique en la Plataforma.
                Se reserva el derecho a eliminar cualquier contenido que se considere inapropiado,
                ofensivo o que viole estos términos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Disponibilidad del Servicio</h2>
              <p>
                Se esfuerza por mantener la Plataforma disponible en todo momento, pero no
                garantiza su funcionamiento continuo e ininterrumpido. Se reserves el derecho a
                suspender temporalmente el acceso por mantenimiento técnico o actualizaciones.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Contacto</h2>
              <p>
                Para cualquier pregunta, sugerencia o incidencia relacionada con la Plataforma,
                puede contactarnos a través del formulario de contacto disponible en{" "}
                <a href="/contacto" className="text-primary hover:underline">
                  esta página
                </a>
                {" "}o escribiendo a benitezl@go.ugr.es.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                El formulario de contacto permite enviar consultas directamente al equipo
                responsable del curso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Modificaciones de los Términos</h2>
              <p>
                El Centro de Lenguas Modernas se reserva el derecho de modificar estos términos
                en cualquier momento. Los cambios serán notificados a los usuarios a través de
                la Plataforma. El uso continuado de la Plataforma tras la notificación implica
                la aceptación de los nuevos términos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Legislación Aplicable</h2>
              <p>
                Estos términos se rigen por la legislación española. Para cualquier controversia,
                las partes se someten a los Juzgados y Tribunales de Granada.
              </p>
            </section>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline">
              ← Volver a la página principal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
