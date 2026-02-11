import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  const email = 'benitezl@go.ugr.es'

  console.log('🔑 Generando enlace de reset para:', email)

  // Verificar si el usuario existe
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.error('❌ Usuario no encontrado:', email)
    return
  }

  console.log('✅ Usuario encontrado:', user.name)

  // Generar token único
  const token = randomBytes(32).toString('hex')

  // Token expira en 1 hora
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  // Guardar token en la base de datos
  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expiresAt
    }
  })

  // Generar enlace de reset
  const resetUrl = `https://pio8.cognoscencia.com/reset-password?token=${token}`

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 ¡Enlace generado exitosamente!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('📧 Email:', email)
  console.log('⏰ Expira en: 1 hora')
  console.log('\n🔗 ENLACE DE RESET:')
  console.log(resetUrl)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('💡 Copia y pega este enlace en tu navegador')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
