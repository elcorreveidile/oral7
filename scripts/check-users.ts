import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verificando usuarios en la base de datos...\n')

  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true,
      password: true,
      createdAt: true,
    }
  })

  console.log(`📊 Total de usuarios: ${users.length}\n`)

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email}`)
    console.log(`   Nombre: ${user.name}`)
    console.log(`   Rol: ${user.role}`)
    console.log(`   Password: ${user.password ? '✅ Tiene password' : '❌ SIN PASSWORD'}`)
    console.log(`   Creado: ${user.createdAt}`)
    console.log('')
  })

  // Verificar específicamente test@ugr.es
  const testUser = await prisma.user.findUnique({
    where: { email: 'test@ugr.es' },
    select: {
      email: true,
      password: true,
    }
  })

  console.log('🔍 Usuario test@ugr.es:')
  if (testUser) {
    console.log(`   Email: ${testUser.email}`)
    console.log(`   Password hash: ${testUser.password ? testUser.password.substring(0, 20) + '...' : 'NULL'}`)
  } else {
    console.log('   ❌ NO EXISTE')
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
