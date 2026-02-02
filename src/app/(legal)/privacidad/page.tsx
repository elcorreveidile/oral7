import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Política de privacidad</h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Última actualización: febrero de 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Responsable del tratamiento</h2>
            <p className="text-slate-600 mb-4">
              El responsable del tratamiento de tus datos personales es el Centro de Lenguas
              Modernas de la Universidad de Granada, con domicilio en Placeta del Hospicio
              Viejo, s/n, 18009 Granada, España.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Datos que recopilamos</h2>
            <p className="text-slate-600 mb-4">
              Recopilamos los siguientes datos personales:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Nombre completo</li>
              <li>Dirección de correo electrónico</li>
              <li>Registros de asistencia</li>
              <li>Progreso en actividades y autoevaluaciones</li>
              <li>Datos de acceso (fecha, hora, dispositivo)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Finalidad del tratamiento</h2>
            <p className="text-slate-600 mb-4">
              Utilizamos tus datos para:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Gestionar tu cuenta y acceso a la plataforma</li>
              <li>Registrar y verificar tu asistencia a las clases</li>
              <li>Realizar seguimiento de tu progreso académico</li>
              <li>Comunicarte información relevante sobre el curso</li>
              <li>Mejorar la plataforma y la experiencia de usuario</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Base legal</h2>
            <p className="text-slate-600 mb-4">
              El tratamiento de tus datos se basa en:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>La ejecución del contrato de matrícula en el curso</li>
              <li>El cumplimiento de obligaciones legales</li>
              <li>El interés legítimo en mejorar nuestros servicios educativos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Conservación de datos</h2>
            <p className="text-slate-600 mb-4">
              Tus datos se conservarán durante el período de impartición del curso y
              posteriormente durante el tiempo necesario para cumplir con obligaciones
              legales y para la defensa de posibles reclamaciones.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Tus derechos</h2>
            <p className="text-slate-600 mb-4">
              Tienes derecho a:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Acceder a tus datos personales</li>
              <li>Rectificar datos inexactos</li>
              <li>Solicitar la supresión de tus datos</li>
              <li>Oponerte al tratamiento</li>
              <li>Solicitar la portabilidad de tus datos</li>
              <li>Presentar una reclamación ante la AEPD</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Seguridad</h2>
            <p className="text-slate-600 mb-4">
              Implementamos medidas técnicas y organizativas para proteger tus datos
              contra accesos no autorizados, pérdida o destrucción. Las contraseñas
              se almacenan de forma cifrada y las comunicaciones se realizan mediante
              protocolos seguros (HTTPS).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Cookies</h2>
            <p className="text-slate-600 mb-4">
              La plataforma utiliza cookies técnicas necesarias para su funcionamiento
              y cookies de sesión para mantener tu acceso. No utilizamos cookies de
              terceros con fines publicitarios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contacto</h2>
            <p className="text-slate-600 mb-4">
              Para ejercer tus derechos o realizar consultas sobre privacidad,
              contacta con nosotros a través del{" "}
              <Link href="/contacto" className="text-orange-600 hover:underline">
                formulario de contacto
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
