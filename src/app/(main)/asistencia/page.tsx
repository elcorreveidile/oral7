"use client"

import { QRScanner } from "@/components/qr/qr-scanner"

export default function AsistenciaPage() {
  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Registrar asistencia</h1>
        <p className="text-muted-foreground mt-2">
          Escanea el código QR o introduce el código que muestra el profesor
        </p>
      </div>

      <QRScanner />

      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <h3 className="font-medium text-foreground mb-2">Importante:</h3>
        <ul className="space-y-1 list-disc list-inside">
          <li>El código cambia cada 15 minutos</li>
          <li>Solo puedes registrar asistencia durante la clase</li>
          <li>Si tienes problemas, avisa al profesor</li>
          <li>Recuerda: necesitas 80% de asistencia mínimo</li>
        </ul>
      </div>
    </div>
  )
}
