import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Eye } from "lucide-react"

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-clm-50 via-white to-granada-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Política de Privacidad</h1>
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
                <Eye className="h-6 w-6 text-primary" />
                1. Responsable del Tratamiento
              </h2>
              <p>
                El responsable del tratamiento de los datos personales recogidos en la plataforma
                PIO-7 es:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-2">
                <p className="font-semibold">Centro de Lenguas Modernas</p>
                <p>Universidad de Granada</p>
                <p>Contacto: benitezl@go.ugr.es</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Datos que Recogemos</h2>
              <h3 className="text-xl font-semibold mt-4 mb-2">2.1. Datos de Carácter Personal</h3>
              <p>Recopilamos los siguientes datos personales:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  <strong>Nombre y apellidos:</strong> Para identificar al usuario en la plataforma
                </li>
                <li>
                  <strong>Correo electrónico:</strong> Para comunicación y acceso al sistema
                </li>
                <li>
                  <strong>Contraseña:</strong> Cifrada y almacenada de forma segura
                </li>
                <li>
                  <strong>Rol académico:</strong> Estudiante, profesor o administrador
                </li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-2">2.2. Datos Académicos</h3>
              <p>Adicionalmente, recopilamos:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Asistencia a clases (registro mediante código QR)</li>
                <li>Progreso en las actividades y ejercicios</li>
                <li>Resultados de autoevaluaciones</li>
                <li>Participación en actividades interactivas</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-2">2.3. Datos de Navegación</h3>
              <p>Recopilamos automáticamente:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Dirección IP</li>
                <li>Tipo de navegador y dispositivo</li>
                <li>Páginas visitadas y tiempo de navegación</li>
                <li>Fecha y hora de acceso</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Finalidad del Tratamiento</h2>
              <p>Los datos recogidos se utilizan para:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  <strong>Gestión académica:</strong> Control de asistencia y seguimiento del progreso
                </li>
                <li>
                  <strong>Mejora educativa:</strong> Personalización del aprendizaje y adaptación de
                  contenidos
                </li>
                <li>
                  <strong>Comunicación:</strong> Envío de notificaciones importantes sobre el curso
                </li>
                <li>
                  <strong>Seguridad:</strong> Protección de la plataforma y prevención de fraudes
                </li>
                <li>
                  <strong>Mejora del servicio:</strong> Análisis de uso para optimizar la plataforma
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Base Legal</h2>
              <p>El tratamiento de datos se fundamenta en:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  <strong>Consentimiento del interesado:</strong> Al aceptar estos términos y
                  registrarse en la plataforma
                </li>
                <li>
                  <strong>Ejecución de un contrato:</strong> Para la prestación del servicio
                  educativo
                </li>
                <li>
                  <strong>Interés legítimo:</strong> Para la seguridad y mejora de la plataforma
                </li>
                <li>
                  <strong>Obligación legal:</strong> Para el cumplimiento de obligaciones académicas
                  y fiscales
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Destinatarios de los Datos</h2>
              <p>
                Los datos solo serán comunicados a:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  <strong>Personal docente:</strong> Profesores del curso para seguimiento académico
                </li>
                <li>
                  <strong>Administración universitaria:</strong> Para gestión académica y
                  administrativa
                </li>
                <li>
                  <strong>Prestadores de servicios:</strong> Empresas que prestan servicios
                  técnicos (hosting, mantenimiento, etc.) bajo estrictos acuerdos de
                  confidencialidad
                </li>
              </ul>
              <p className="mt-2">
                <strong>No cedemos datos a terceros con fines comerciales.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Derechos del Usuario</h2>
              <p>El usuario tiene los siguientes derechos:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  <strong>Acceso:</strong> Solicitar información sobre sus datos tratados
                </li>
                <li>
                  <strong>Rectificación:</strong> Modificar datos inexactos o incompletos
                </li>
                <li>
                  <strong>Supresión:</strong> Solicitar el borrado de sus datos ("derecho al olvido")
                </li>
                <li>
                  <strong>Limitación:</strong> Solicitar que limitemos el tratamiento de sus datos
                </li>
                <li>
                  <strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado
                </li>
                <li>
                  <strong>Oposición:</strong> Oponerse al tratamiento por motivos legítimos
                </li>
                <li>
                  <strong>Revocación:</strong> Retirar el consentimiento en cualquier momento
                </li>
              </ul>
              <p className="mt-2">
                Para ejercer estos derechos, contacte en benitezl@go.ugr.es
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Conservación de Datos</h2>
              <p>Los datos se conservarán:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  <strong>Datos académicos:</strong> Durante el curso y hasta 5 años después para
                  fines históricos y estadísticos
                </li>
                <li>
                  <strong>Datos de navegación:</strong> Máximo 2 años según normativa vigente
                </li>
                <li>
                  <strong>Datos de contacto:</strong> Hasta que el usuario solicite su supresión
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Seguridad de los Datos</h2>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas apropiadas para
                proteger los datos personales contra acceso no autorizado, alteración, divulgación
                o destrucción. Estas incluyen:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Cifrado de contraseñas (algoritmos seguros)</li>
                <li>Conexiones HTTPS (cifrado SSL/TLS)</li>
                <li>Autenticación segura</li>
                <li>Actualizaciones regulares del sistema</li>
                <li>Control de acceso a la información</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Cookies y Tecnologías Similares</h2>
              <p>
                La plataforma utiliza cookies esenciales para el funcionamiento del sistema
                (sesión de usuario, preferencias, etc.). No utilizamos cookies de publicidad o
                seguimiento de terceros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Menores de Edad</h2>
              <p>
                Los servicios de la plataforma están dirigidos a estudiantes universitarios
                adultos. No recopilamos intencionalmente datos de menores de 18 años sin
                consentimiento parental.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Transferencias Internacionales</h2>
              <p>
                Los datos se almacenan en servidores ubicados en la Unión Europea. No se
                realizan transferencias internacionales de datos fuera del Espacio Económico
                Europeo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Modificaciones</h2>
              <p>
                Esta política puede ser modificada para adaptarse a cambios legislativos o en
                nuestros servicios. Los cambios serán notificados en la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">13. Reclamaciones</h2>
              <p>
                Si considera que sus derechos no han sido respetados, puede presentar una
                reclamación ante la Agencia Española de Protección de Datos (AEPD).
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
