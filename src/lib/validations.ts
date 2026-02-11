import { z } from "zod"

// ============================================
// ESQUEMAS DE VALIDACIÓN ZOD
// Plataforma educativa PIO-7
// ============================================

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Valida datos contra un esquema Zod
 * @param schema Esquema Zod para validar
 * @param data Datos a validar
 * @returns Objeto con éxito y datos o mensaje de error en español
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Formatear errores en español
      const errorMessages = error.errors.map((err) => {
        const path = err.path.join(".")
        const field = path || "campo"
        return `${field}: ${err.message}`
      })
      return {
        success: false,
        error: `Error de validación: ${errorMessages.join(", ")}`,
      }
    }
    return {
      success: false,
      error: "Error de validación desconocido",
    }
  }
}

// ============================================
// VALIDADORES PERSONALIZADOS
// ============================================

/**
 * Valida la complejidad de una contraseña
 * Requisitos:
 * - Mínimo 12 caracteres
 * - Al menos 1 mayúscula
 * - Al menos 1 minúscula
 * - Al menos 1 número
 * - Al menos 1 carácter especial
 */
const passwordComplexity = (password: string): boolean => {
  if (password.length < 12) return false

  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
}

// ============================================
// ESQUEMAS DE AUTENTICACIÓN
// ============================================

/**
 * Esquema para registro de usuarios (estudiantes)
 * Incluye validación de contraseña con requisitos de complejidad
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim(),
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Formato de email inválido")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .min(12, "La contraseña debe tener al menos 12 caracteres")
    .refine(
      (password) => passwordComplexity(password),
      "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial"
    ),
  inviteCode: z
    .string()
    .min(1, "El código de invitación es obligatorio")
    .trim(),
})

export type RegisterInput = z.infer<typeof registerSchema>

/**
 * Esquema para inicio de sesión
 * Email y contraseña básicos
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Formato de email inválido")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria"),
})

export type LoginInput = z.infer<typeof loginSchema>

// ============================================
// ESQUEMAS DE ESTUDIANTES
// ============================================

/**
 * Esquema para creación de estudiantes por administrador
 * Requiere email @ugr.es
 */
export const createStudentSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim(),
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Formato de email inválido")
    .trim()
    .toLowerCase()
    .refine(
      (email) => email.endsWith("@ugr.es"),
      "El email debe ser del dominio @ugr.es"
    ),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .min(12, "La contraseña debe tener al menos 12 caracteres")
    .refine(
      (password) => passwordComplexity(password),
      "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial"
    ),
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>

// ============================================
// ESQUEMAS DE SESIONES
// ============================================

/**
 * Esquema base para datos de sesión
 */
const sessionDataBaseSchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(200, "El título no puede exceder 200 caracteres"),
  subtitle: z
    .string()
    .max(300, "El subtítulo no puede exceder 300 caracteres")
    .optional(),
  blockNumber: z
    .number({
      required_error: "El número de bloque es obligatorio",
      invalid_type_error: "El número de bloque debe ser un número entero",
    })
    .int("El número de bloque debe ser un número entero")
    .min(1, "El número de bloque debe estar entre 1 y 3")
    .max(3, "El número de bloque debe estar entre 1 y 3"),
  blockTitle: z
    .string()
    .min(1, "El título del bloque es obligatorio")
    .max(100, "El título del bloque no puede exceder 100 caracteres"),
  isExamDay: z.boolean().optional(),
  examType: z.enum(["PARTIAL", "FINAL"]).optional().nullable(),
  objectives: z
    .array(z.string().min(1, "Los objetivos no pueden estar vacíos"))
    .min(1, "Debe haber al menos un objetivo"),
  timing: z.array(z.any()).min(1, "El timing debe tener al menos un elemento"),
  dynamics: z.array(z.any()).min(1, "Las dinámicas deben tener al menos un elemento"),
  grammarContent: z.any().optional().nullable(),
  vocabularyContent: z.any().optional().nullable(),
  modeAContent: z.any().optional().nullable(),
  modeBContent: z.any().optional().nullable(),
})

/**
 * Esquema para creación de sesiones
 */
export const createSessionSchema = z.object({
  sessionNumber: z
    .number({
      required_error: "El número de sesión es obligatorio",
      invalid_type_error: "El número de sesión debe ser un número entero",
    })
    .int("El número de sesión debe ser un número entero")
    .positive("El número de sesión debe ser positivo")
    .max(27, "El número de sesión no puede exceder 27"),
  date: z
    .string({
      required_error: "La fecha es obligatoria",
    })
    .min(1, "La fecha es obligatoria")
    .refine(
      (date) => !isNaN(Date.parse(date)),
      "Formato de fecha inválido"
    ),
}).merge(sessionDataBaseSchema)

export type CreateSessionInput = z.infer<typeof createSessionSchema>

/**
 * Esquema para actualización de datos de sesión (sin wrapper)
 */
export const updateSessionDataSchema = sessionDataBaseSchema.partial()

export type UpdateSessionDataInput = z.infer<typeof updateSessionDataSchema>

/**
 * Esquema para actualización de sesiones por administrador (con wrapper sessionNumber + data)
 * Permite actualizar campos específicos de una sesión
 */
export const updateSessionSchema = z.object({
  sessionNumber: z
    .number({
      required_error: "El número de sesión es obligatorio",
      invalid_type_error: "El número de sesión debe ser un número entero",
    })
    .int("El número de sesión debe ser un número entero")
    .positive("El número de sesión debe ser positivo")
    .max(27, "El número de sesión no puede exceder 27"),
  data: sessionDataBaseSchema.partial(),
})

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>

// ============================================
// ESQUEMAS DE SUBIDA DE ARCHIVOS
// ============================================

/**
 * Tipos de archivo permitidos para subida
 */
export const ALLOWED_FILE_TYPES = [
  "audio/mp3",
  "audio/wav",
  "audio/mpeg",
  "audio/webm",
  "audio/ogg",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const

export const allowedFileTypeSchema = z.enum(ALLOWED_FILE_TYPES)

/**
 * Esquema para metadatos de archivo
 */
export const fileMetadataSchema = z.object({
  url: z.string().url("URL del archivo inválida"),
  name: z.string().min(1, "El nombre del archivo es obligatorio"),
  type: allowedFileTypeSchema,
  size: z
    .number()
    .positive("El tamaño del archivo debe ser positivo")
    .max(50 * 1024 * 1024, "El archivo no puede exceder 50MB"),
  filename: z.string().optional(),
})

export type FileMetadata = z.infer<typeof fileMetadataSchema>

/**
 * Esquema para subida de archivos (FormData)
 * Nota: Este esquema valida los metadatos, no el FormData directamente
 */
export const fileUploadSchema = z.object({
  taskId: z
    .string()
    .min(1, "El ID de la tarea es obligatorio")
    .optional(),
  file: fileMetadataSchema,
})

export type FileUploadInput = z.infer<typeof fileUploadSchema>

// ============================================
// ESQUEMAS DE CÓDIGOS QR
// ============================================

/**
 * Esquema para generación de códigos QR
 */
export const generateQRSchema = z.object({
  code: z
    .string()
    .min(6, "El código debe tener al menos 6 caracteres")
    .max(8, "El código no puede exceder 8 caracteres")
    .toUpperCase()
    .trim(),
  sessionNumber: z
    .number({
      required_error: "El número de sesión es obligatorio",
      invalid_type_error: "El número de sesión debe ser un número entero",
    })
    .int("El número de sesión debe ser un número entero")
    .positive("El número de sesión debe ser positivo")
    .max(27, "El número de sesión no puede exceder 27"),
  expiresAt: z
    .string()
    .min(1, "La fecha de expiración es obligatoria")
    .refine(
      (date) => !isNaN(Date.parse(date)),
      "Formato de fecha inválido"
    )
    .transform((date) => new Date(date))
    .refine(
      (date) => date > new Date(),
      "La fecha de expiración debe ser futura"
    ),
})

export type GenerateQRInput = z.infer<typeof generateQRSchema>

/**
 * Esquema para registro de asistencia con código QR
 */
export const registerAttendanceSchema = z.object({
  code: z
    .string()
    .min(6, "El código debe tener al menos 6 caracteres")
    .max(8, "El código no puede exceder 8 caracteres")
    .toUpperCase()
    .trim(),
})

export type RegisterAttendanceInput = z.infer<typeof registerAttendanceSchema>

// ============================================
// ESQUEMAS DE ENTREGAS DE TAREAS
// ============================================

/**
 * Esquema para creación/actualización de entregas de tareas
 */
export const submissionSchema = z.object({
  taskId: z
    .string()
    .min(1, "El ID de la tarea es obligatorio"),
  files: z
    .array(fileMetadataSchema)
    .min(1, "Debe haber al menos un archivo")
    .max(10, "No puedes subir más de 10 archivos"),
})

export type SubmissionInput = z.infer<typeof submissionSchema>

/**
 * Esquema para entrega de archivos de sesión
 */
export const sessionSubmissionSchema = z.object({
  sessionNumber: z
    .number({
      required_error: "El número de sesión es obligatorio",
      invalid_type_error: "El número de sesión debe ser un número entero",
    })
    .int("El número de sesión debe ser un número entero")
    .positive("El número de sesión debe ser positivo")
    .max(27, "El número de sesión no puede exceder 27"),
  files: z
    .array(fileMetadataSchema)
    .min(1, "Debe haber al menos un archivo")
    .max(10, "No puedes subir más de 10 archivos"),
})

export type SessionSubmissionInput = z.infer<typeof sessionSubmissionSchema>

/**
 * Esquema para obtención de entregas (query params)
 */
export const getSubmissionSchema = z.object({
  taskId: z
    .string()
    .min(1, "El ID de la tarea es obligatorio"),
})

export type GetSubmissionInput = z.infer<typeof getSubmissionSchema>

// ============================================
// ESQUEMAS DE FORMULARIO DE CONTACTO
// ============================================

/**
 * Esquema para el formulario de contacto
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim(),
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Formato de email inválido")
    .trim()
    .toLowerCase(),
  subject: z
    .string()
    .min(1, "El asunto es obligatorio")
    .max(200, "El asunto no puede exceder 200 caracteres")
    .trim(),
  message: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(5000, "El mensaje no puede exceder 5000 caracteres")
    .trim(),
})

export type ContactFormInput = z.infer<typeof contactFormSchema>

// ============================================
// ESQUEMAS DE PROGRESO
// ============================================

/**
 * Esquema para actualización de progreso de usuario
 */
export const updateProgressSchema = z.object({
  sessionId: z
    .string()
    .min(1, "El ID de la sesión es obligatorio"),
  viewedAt: z.coerce.date().optional(),
  timeSpent: z
    .number()
    .int("El tiempo debe ser un número entero")
    .min(0, "El tiempo no puede ser negativo")
    .optional(),
  modePreference: z
    .enum(["A", "B"])
    .optional(),
})

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>

/**
 * Esquema para actualización de checklist
 */
export const updateChecklistSchema = z.object({
  checklistItemId: z
    .string()
    .min(1, "El ID del ítem es obligatorio"),
  isCompleted: z.boolean(),
})

export type UpdateChecklistInput = z.infer<typeof updateChecklistSchema>

// ============================================
// EXPORTACIÓN DE TODOS LOS ESQUEMAS
// ============================================

export const schemas = {
  // Auth
  register: registerSchema,
  login: loginSchema,

  // Students
  createStudent: createStudentSchema,

  // Sessions
  createSession: createSessionSchema,
  updateSessionData: updateSessionDataSchema,
  updateSession: updateSessionSchema,

  // Files
  fileUpload: fileUploadSchema,
  fileMetadata: fileMetadataSchema,

  // QR
  generateQR: generateQRSchema,
  registerAttendance: registerAttendanceSchema,

  // Submissions
  submission: submissionSchema,
  sessionSubmission: sessionSubmissionSchema,
  getSubmission: getSubmissionSchema,

  // Contact
  contactForm: contactFormSchema,

  // Progress
  updateProgress: updateProgressSchema,
  updateChecklist: updateChecklistSchema,
}
