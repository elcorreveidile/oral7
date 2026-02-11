import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verificando datos en producción...\n')

  // Verificar usuarios
  const users = await prisma.user.count()
  console.log('👥 Usuarios:', users)

  // Verificar sesiones
  const sessions = await prisma.session.count()
  console.log('📚 Sesiones:', sessions)

  // Verificar asistencias
  const attendances = await prisma.attendance.count()
  console.log('✅ Asistencias:', attendances)

  // Verificar submissions
  const submissions = await prisma.submission.count()
  console.log('📝 Entregas:', submissions)

  // Verificar progreso
  const progress = await prisma.userProgress.count()
  console.log('📊 Progresos:', progress)

  // Verificar checklist
  const checklist = await prisma.userChecklistItem.count()
  console.log('☑️  Checklist items:', checklist)

  // Verificar recursos
  const resources = await prisma.resource.count()
  console.log('📁 Recursos:', resources)

  // Verificar tareas
  const tasks = await prisma.task.count()
  console.log('📋 Tareas:', tasks)

  // Verificar QR codes
  const qrCodes = await prisma.qRCode.count()
  console.log('📱 QR Codes:', qrCodes)

  // Verificar configuración
  const settings = await prisma.settings.count()
  console.log('⚙️  Settings:', settings)

  // Mostrar algunos detalles de usuarios
  console.log('\n👥 Últimos 5 usuarios:')
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  })
  recentUsers.forEach(user => {
    console.log(`  - ${user.email} (${user.role}) - ${user.createdAt}`)
  })

  // Mostrar asistencias recientes
  console.log('\n✅ Últimas 5 asistencias:')
  const recentAttendances = await prisma.attendance.findMany({
    take: 5,
    orderBy: { registeredAt: 'desc' },
    include: {
      user: { select: { email: true } },
      session: { select: { sessionNumber: true } }
    }
  })
  recentAttendances.forEach(att => {
    console.log(`  - ${att.user.email} - Sesión ${att.session.sessionNumber} - ${att.registeredAt}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
