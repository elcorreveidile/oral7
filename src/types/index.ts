// Tipos para la aplicación Oral-7

export type UserRole = "ADMIN" | "STUDENT"

export type ExamType = "PARTIAL" | "FINAL"

export type TaskType =
  | "MULTIPLE_CHOICE"
  | "FILL_BLANKS"
  | "DRAG_DROP"
  | "MATCHING"
  | "ORDERING"
  | "FREE_TEXT"
  | "AUDIO_RECORDING"
  | "VIDEO_RECORDING"
  | "DOCUMENT_UPLOAD"

export type ResourceType = "PDF" | "AUDIO" | "VIDEO" | "LINK" | "IMAGE"

export type AttendanceMethod = "QR_SCAN" | "MANUAL_CODE" | "ADMIN"

// Interfaces para contenido de sesiones
export interface SessionObjective {
  id: string
  text: string
  isModeB?: boolean // Solo para Modo B
}

export interface SessionTiming {
  id: string
  duration: string  // e.g., "15 min"
  activity: string
  description?: string
}

export interface SessionDynamic {
  id: string
  step: number
  title: string
  instructions: string[]
  materials?: string[]
  groupType?: "individual" | "pairs" | "small_group" | "whole_class"
  isModeB?: boolean
}

export interface GrammarContent {
  title: string
  explanation: string
  examples: {
    spanish: string
    english?: string
    pinyin?: string  // Para estudiantes chinos en Modo B
  }[]
  rules?: string[]
  notes?: string[]
}

export interface VocabularyContent {
  title: string
  items: {
    term: string
    definition: string
    example?: string
    category?: string
  }[]
  expressions?: {
    expression: string
    meaning: string
    usage?: string
  }[]
}

export interface ModeAContent {
  title: string
  description: string
  activities: {
    id: string
    name: string
    type: "collaborative" | "discussion" | "roleplay" | "debate"
    instructions: string[]
  }[]
}

export interface ModeBContent {
  title: string
  description: string
  visualAids?: {
    id: string
    type: "table" | "diagram" | "timeline" | "mindmap"
    content: any
  }[]
  structuredNotes?: {
    id: string
    topic: string
    keyPoints: string[]
    translations?: { [key: string]: string }
  }[]
  grammarBreakdown?: {
    pattern: string
    components: string[]
    examples: string[]
  }[]
}

// Interface para tareas interactivas
export interface TaskContent {
  instructions: string
  items: TaskItem[]
  correctAnswers?: any
  feedback?: {
    correct: string
    incorrect: string
  }
}

export interface TaskItem {
  id: string
  type?: string
  content: any
  options?: any[]
}

// Interface para checklist
export interface ChecklistItemData {
  id: string
  text: string
  isCompleted?: boolean
}

// Interface para sesión completa
export interface SessionData {
  id: string
  sessionNumber: number
  date: Date
  title: string
  subtitle?: string
  blockNumber: number
  blockTitle: string
  isExamDay: boolean
  examType?: ExamType
  objectives: SessionObjective[]
  timing: SessionTiming[]
  dynamics: SessionDynamic[]
  grammarContent?: GrammarContent
  vocabularyContent?: VocabularyContent
  modeAContent?: ModeAContent
  modeBContent?: ModeBContent
  tasks?: TaskData[]
  checklistItems?: ChecklistItemData[]
  resources?: ResourceData[]
}

export interface TaskData {
  id: string
  title: string
  description?: string
  type: TaskType
  content: TaskContent
  order: number
  isModeBOnly: boolean
}

export interface ResourceData {
  id: string
  title: string
  description?: string
  type: ResourceType
  url: string
  order: number
}

// Interface para asistencia
export interface AttendanceData {
  id: string
  userId: string
  userName: string
  sessionId: string
  sessionNumber: number
  registeredAt: Date
  method: AttendanceMethod
}

// Interface para progreso de usuario
export interface UserProgressData {
  userId: string
  sessionsViewed: number
  totalSessions: number
  attendanceRate: number
  checklistCompletion: number
  lastAccess?: Date
}

// Estadísticas del profesor
export interface AdminStats {
  totalStudents: number
  averageAttendance: number
  currentSession: number
  upcomingSessions: SessionData[]
  attendanceBySession: {
    sessionNumber: number
    date: Date
    attendanceCount: number
  }[]
}
