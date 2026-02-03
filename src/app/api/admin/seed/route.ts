import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado. Solo administradores." },
        { status: 403 }
      )
    }

    // Verificar si ya existen sesiones
    const existingSessions = await prisma.session.count()

    if (existingSessions > 0) {
      return NextResponse.json({
        success: true,
        message: `La base de datos ya tiene ${existingSessions} sesiones. No se ejecutó el seed.`,
        existingSessions,
      })
    }

    // Ejecutar seed de sesiones
    // Nota: Este código es una versión simplificada del seed principal
    const sessions: any[] = []

    // Fechas de sesiones (martes y jueves)
    const febDates = [
      new Date('2026-02-03'), new Date('2026-02-05'),
      new Date('2026-02-10'), new Date('2026-02-12'),
      new Date('2026-02-17'), new Date('2026-02-19'),
      new Date('2026-02-24'), new Date('2026-02-26'),
    ]

    const marDates = [
      new Date('2026-03-03'), new Date('2026-03-05'),
      new Date('2026-03-10'), new Date('2026-03-12'),
      new Date('2026-03-17'), new Date('2026-03-19'),
      new Date('2026-03-31'),
    ]

    const aprDates = [
      new Date('2026-04-07'), new Date('2026-04-09'),
      new Date('2026-04-14'), new Date('2026-04-16'),
      new Date('2026-04-21'), new Date('2026-04-23'),
      new Date('2026-04-28'), new Date('2026-04-30'),
    ]

    const mayDates = [
      new Date('2026-05-05'), new Date('2026-05-07'),
      new Date('2026-05-12'), new Date('2026-05-14'),
    ]

    const allDates = [...febDates, ...marDates, ...aprDates, ...mayDates]

    const sessionDefinitions = [
      { number: 1, date: allDates[0], title: 'Bienvenida y Evaluación Diagnóstica', subtitle: 'Conociendo tu nivel C1', block: 1, blockTitle: 'Fundamentos de la Expresión Oral' },
      { number: 2, date: allDates[1], title: 'Estructuras de Argumentación', subtitle: 'Organizando ideas con persuasión', block: 1, blockTitle: 'Fundamentos de la Expresión Oral' },
      { number: 3, date: allDates[2], title: 'Narración Avanzada', subtitle: 'Relatando experiencias con riqueza', block: 1, blockTitle: 'Fundamentos de la Expresión Oral' },
      { number: 4, date: allDates[3], title: 'La Exposición Oral Formal', subtitle: 'Presentando con claridad y confianza', block: 1, blockTitle: 'Fundamentos de la Expresión Oral' },
      { number: 5, date: allDates[4], title: 'Negociación y Mediación', subtitle: 'Resolviendo conflictos', block: 2, blockTitle: 'Interacción Avanzada' },
      { number: 6, date: allDates[5], title: 'El Debate Académico', subtitle: 'Argumentando en contexto universitario', block: 2, blockTitle: 'Interacción Avanzada' },
      { number: 7, date: allDates[6], title: 'Entrevista Profesional', subtitle: 'Comunicación en contextos laborales', block: 2, blockTitle: 'Interacción Avanzada' },
      { number: 8, date: allDates[7], title: 'Comunicación Intercultural', subtitle: 'Navegando diferencias culturales', block: 2, blockTitle: 'Interacción Avanzada' },
      { number: 9, date: allDates[8], title: 'Precisión Léxica', subtitle: 'Ampliando vocabulario C1', block: 3, blockTitle: 'Perfeccionamiento Comunicativo' },
      { number: 10, date: allDates[9], title: 'Pronunciación y Entonación', subtitle: 'Perfeccionando la prosodia', block: 3, blockTitle: 'Perfeccionamiento Comunicativo' },
      { number: 11, date: allDates[10], title: 'Coherencia y Cohesión', subtitle: 'Organizando el discurso', block: 3, blockTitle: 'Perfeccionamiento Comunicativo' },
      { number: 12, date: allDates[11], title: 'Ironía y Humor', subtitle: 'Sutileza pragmática', block: 3, blockTitle: 'Perfeccionamiento Comunicativo' },
      { number: 13, date: allDates[12], title: 'Presentaciones Académicas', subtitle: 'Comunicando investigación', block: 3, blockTitle: 'Perfeccionamiento Comunicativo' },
      { number: 14, date: allDates[13], title: 'Repaso y Consolidación', subtitle: 'Integrando competencias', block: 3, blockTitle: 'Perfeccionamiento Comunicativo' },
      { number: 15, date: allDates[14], title: 'Proyecto Final - Presentaciones', subtitle: 'Demostrando maestría comunicativa', block: 3, blockTitle: 'Perfeccionamiento Comunicativo' },
    ]

    // Crear sesiones
    for (const sessionDef of sessionDefinitions) {
      const session = await prisma.session.upsert({
        where: { sessionNumber: sessionDef.number },
        update: {},
        create: {
          sessionNumber: sessionDef.number,
          date: sessionDef.date,
          title: sessionDef.title,
          subtitle: sessionDef.subtitle,
          blockNumber: sessionDef.block,
          blockTitle: sessionDef.blockTitle,
          isExamDay: false,
          objectives: [`Objetivo de la sesión ${sessionDef.number}`],
          timing: [],
          dynamics: [],
        },
      })
      sessions.push(session)
    }

    // Crear settings globales si no existen
    await prisma.settings.upsert({
      where: { id: 'global' },
      update: {},
      create: {
        id: 'global',
        currentSession: 1,
        courseStartDate: new Date('2026-02-02'),
        courseEndDate: new Date('2026-05-21'),
      },
    })

    return NextResponse.json({
      success: true,
      message: `Seed ejecutado correctamente. ${sessions.length} sesiones creadas.`,
      sessions: sessions.map((s: any) => ({
        id: s.id,
        sessionNumber: s.sessionNumber,
        title: s.title,
      })),
    })
  } catch (error) {
    console.error("Error executing seed:", error)
    return NextResponse.json(
      { error: "Error al ejecutar el seed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
