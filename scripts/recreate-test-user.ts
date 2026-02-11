import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const testEmail = 'test@ugr.es'
  const testPassword = 'Password123!'

  console.log('🗑️  Buscando usuario test@ugr.es...')

  const existingUser = await prisma.user.findUnique({
    where: { email: testEmail }
  })

  if (existingUser) {
    console.log('✅ Usuario encontrado, eliminando...')
    await prisma.user.delete({
      where: { email: testEmail }
    })
    console.log('🗑️ Usuario eliminado')
  }

  console.log('✨ Creando nuevo usuario test@ugr.es...')

  const hashedPassword = await hash(testPassword, 12)

  const user = await prisma.user.create({
    data: {
      name: 'Usuario Prueba',
      email: testEmail,
      password: hashedPassword,
      role: 'STUDENT'
    }
  })

  console.log('✅ Usuario creado exitosamente:')
  console.log(`   Email: ${user.email}`)
  console.log(`   Contraseña: ${testPassword}`)
  console.log(`   Rol: ${user.role}`)
  console.log(`   ID: ${user.id}`)
  console.log('\n✨ Ya puedes hacer login con estas credenciales!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
