import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'benitezl@go.ugr.es'
  const newPassword = 'AdminOral7-2026!'

  console.log('🔐 Reseteando contraseña para:', adminEmail)

  const user = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!user) {
    console.error('❌ Usuario no encontrado:', adminEmail)
    return
  }

  console.log('✅ Usuario encontrado:', user.name)
  console.log('🔄 Generando nuevo hash de contraseña...')

  const hashedPassword = await hash(newPassword, 12)

  await prisma.user.update({
    where: { email: adminEmail },
    data: { password: hashedPassword }
  })

  console.log('\n🎉 ¡Contraseña actualizada exitosamente!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 Email:', adminEmail)
  console.log('🔑 Nueva contraseña:', newPassword)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n✨ Ya puedes hacer login con estas credenciales')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
