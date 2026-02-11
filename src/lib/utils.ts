import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isBefore, isAfter, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { randomInt } from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatear fecha en español (solo primera letra mayúscula)
export function formatDateSpanish(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  // Formato: "martes, 3 de febrero de 2026"
  const formatted = format(d, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
  // Asegurar que solo la primera letra sea mayúscula
  return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase()
}

// Formatear fecha corta
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "d MMM", { locale: es })
}

// Verificar si una fecha es hoy
export function isDateToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isToday(d)
}

// Verificar si la sesión ya pasó (requiere fecha de referencia para evitar hydration issues)
export function isSessionPast(date: Date | string, referenceDate: Date = new Date()): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  const today = new Date(referenceDate)
  today.setHours(0, 0, 0, 0)
  return isBefore(d, today)
}

// Verificar si la sesión es futura (requiere fecha de referencia para evitar hydration issues)
export function isSessionFuture(date: Date | string, referenceDate: Date = new Date()): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  const today = new Date(referenceDate)
  today.setHours(23, 59, 59, 999)
  return isAfter(d, today)
}

// Obtener el día de la semana en español
export function getDayOfWeek(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  const day = format(d, "EEEE", { locale: es })
  return day.charAt(0).toUpperCase() + day.slice(1)
}

// Generar código QR aleatorio (criptográficamente seguro)
export function generateQRCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sin caracteres confusos
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(randomInt(0, chars.length))
  }
  return code
}

// Capitalización española (solo primera letra mayúscula)
export function capitalizeSpanish(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// Calcular porcentaje de asistencia
export function calculateAttendancePercentage(attended: number, total: number): number {
  if (total === 0) return 0
  return Math.round((attended / total) * 100)
}

// Verificar si cumple requisito mínimo de asistencia (80%)
export function meetsAttendanceRequirement(attended: number, total: number): boolean {
  return calculateAttendancePercentage(attended, total) >= 80
}

// Formatear tiempo en minutos/horas
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${mins}min`
}

// Obtener saludo según hora del día
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Buenos días"
  if (hour < 20) return "Buenas tardes"
  return "Buenas noches"
}

// Copiar texto al portapapeles
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
