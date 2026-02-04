import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { sessionsData } from './sessions-data'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed process...')
  console.log('📅 Course: Feb 2 - May 21, 2026 | Tue/Thu schedule')

  // ============================================
  // 1. CREATE USERS - ADMIN + TEST STUDENTS
  // ============================================
  console.log('📝 Creating users...')

  const hashedPassword = await bcrypt.hash('admin123', 10)
  const studentPassword = await bcrypt.hash('estudiante123', 10)

  // Admin (Profesor - correo real)
  const admin = await prisma.user.upsert({
    where: { email: 'benitezl@go.ugr.es' },
    update: {},
    create: {
      email: 'benitezl@go.ugr.es',
      name: 'Javier Benítez Láinez',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Estudiantes de PRUEBA para desarrollo local
  // En producción, los estudiantes se registrarán por sí mismos
  const testStudents = [
    { email: 'test.student1@ugr.es', name: 'Estudiante Prueba 1' },
    { email: 'test.student2@ugr.es', name: 'Estudiante Prueba 2' },
    { email: 'test.student3@ugr.es', name: 'Estudiante Prueba 3' },
  ]

  const students: any[] = []
  for (const student of testStudents) {
    const created = await prisma.user.upsert({
      where: { email: student.email },
      update: {},
      create: {
        email: student.email,
        name: student.name,
        password: studentPassword,
        role: 'STUDENT',
      },
    })
    students.push(created)
  }

  console.log(`✅ Users created: 1 admin (benitezl@go.ugr.es) + ${students.length} test students`)

  // ============================================
  // 2. CREATE GLOBAL SETTINGS
  // ============================================
  console.log('📝 Creating global settings...')

  const settings = await prisma.settings.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      currentSession: 1,
      courseStartDate: new Date('2026-02-02'),
      courseEndDate: new Date('2026-05-21'),
    },
  })

  console.log('✅ Settings created')

  // ============================================
  // 3. CREATE SESSIONS - CALENDARIO REAL 2026
  // ============================================
  console.log('📚 Creating sessions (Tue/Thu schedule)...')

  const sessions: any[] = []

  // Crear sesiones desde sessions-data.ts
  for (const sessionData of sessionsData) {
    const session = await prisma.session.upsert({
      where: { sessionNumber: sessionData.number },
      update: {},
      create: {
        sessionNumber: sessionData.number,
        date: sessionData.date,
        title: sessionData.title,
        subtitle: sessionData.subtitle,
        blockNumber: sessionData.block,
        blockTitle: sessionData.blockTitle,
        isExamDay: sessionData.isExamDay || false,
        examType: (sessionData as any).examType,
        objectives: sessionData.objectives,
        timing: sessionData.timing,
        dynamics: sessionData.dynamics,
        grammarContent: sessionData.grammarContent,
        vocabularyContent: sessionData.vocabularyContent,
        modeAContent: (sessionData as any).modeAContent,
        modeBContent: (sessionData as any).modeBContent,
      },
    })
    sessions.push(session)
  }

  // ============================================
  // 4. CREATE TASKS
  // ============================================
  console.log('📝 Creating tasks...')

  // Crear algunas tareas de ejemplo
  await prisma.task.createMany({
    data: [
      {
        sessionId: sessions[1]?.id, // Sesión 2: Argumentación
        title: 'Completar marcadores discursivos',
        description: 'Selecciona el marcador apropiado',
        type: 'MULTIPLE_CHOICE',
        content: {
          questions: [
            {
              question: '______ creo que la educación es fundamental.',
              options: ['En mi opinión', 'Por último', 'Sin embargo'],
              correct: 0,
            },
            {
              question: '______, existen varias perspectivas.',
              options: ['En conclusión', 'Por un lado', 'Sin embargo'],
              correct: 1,
            },
          ],
        },
        order: 1,
        isModeBOnly: true,
      },
      {
        sessionId: sessions[4]?.id, // Sesión 5: Negociación
        title: 'Completar fórmulas de cortesía',
        description: 'Selecciona la fórmula más apropiada',
        type: 'MULTIPLE_CHOICE',
        content: {
          questions: [
            {
              question: '¿______ importaría que le haga una pregunta?',
              options: ['Te', 'Le', 'Os'],
              correct: 1,
            },
          ],
        },
        order: 1,
        isModeBOnly: true,
      },
      {
        sessionId: sessions[8]?.id, // Sesión 9: Precisión léxica
        title: 'Seleccionar término preciso',
        description: 'Elige el adjetivo más preciso',
        type: 'MULTIPLE_CHOICE',
        content: {
          questions: [
            {
              question: 'El impacto fue ______.',
              options: ['grande', 'considerable', 'bueno'],
              correct: 1,
            },
          ],
        },
        order: 1,
        isModeBOnly: true,
      },
    ],
  })

  console.log('✅ Tasks created')

  // ============================================
  // 5. CREATE CHECKLIST ITEMS
  // ============================================
  console.log('📝 Creating checklist items...')

  for (const session of sessions.slice(0, 5)) {
    await prisma.checklistItem.createMany({
      data: [
        { sessionId: session.id, text: 'He participado activamente en clase', order: 1 },
        { sessionId: session.id, text: 'He completado las tareas de la sesión', order: 2 },
        { sessionId: session.id, text: 'He revisado el vocabulario nuevo', order: 3 },
        { sessionId: session.id, text: 'He practicado los contenidos gramaticales', order: 4 },
      ],
    })
  }

  console.log('✅ Checklist items created')

  // ============================================
  // 6. CREATE RESOURCES
  // ============================================
  console.log('📝 Creating resources...')

  for (const session of sessions.slice(0, 8)) {
    await prisma.resource.createMany({
      data: [
        {
          sessionId: session.id,
          title: `Material de sesión ${session.sessionNumber}`,
          type: 'PDF',
          url: `/resources/session-${session.sessionNumber}.pdf`,
          order: 1,
        },
        {
          sessionId: session.id,
          title: 'Vocabulario de la sesión',
          type: 'PDF',
          url: `/resources/vocab-${session.sessionNumber}.pdf`,
          order: 2,
        },
      ],
    })
  }

  console.log('✅ Resources created')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log('  - Course: Feb 2 - May 21, 2026')
  console.log('  - Schedule: Tuesdays and Thursdays')
  console.log(`  - Users: 1 admin + ${students.length} test students (for development)`)
  console.log(`  - Sessions: ${sessions.length} (excludes exam days)`)
  console.log('  - Holidays excluded: Semana Santa, May 1')
  console.log('  - Exams: Mar 26 (partial), May 21 (final)')
  console.log('\n🔐 Login credentials:')
  console.log('  Admin: benitezl@go.ugr.es / admin123')
  console.log('  Test students: test.student1@ugr.es / estudiante123')
  console.log('\n📝 NOTE: In production, students will self-register')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
