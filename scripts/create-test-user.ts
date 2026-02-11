import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Buscando usuarios...')

  const users = await prisma.user.findMany()
  console.log(`📊 Usuarios encontrados: ${users.length}`)

  if (users.length > 0) {
    console.log('\n📋 Usuarios existentes:')
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`)
    })
  }

  // Crear usuario de prueba si no existe
  const testEmail = 'test@ugr.es'
  const existingUser = await prisma.user.findUnique({
    where: { email: testEmail }
  })

  if (!existingUser) {
    console.log('\n✨ Creando usuario de prueba...')

    const hashedPassword = await hash('Password123!', 12)

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
    console.log(`   Contraseña: Password123!`)
    console.log(`   Rol: ${user.role}`)
  } else {
    console.log('\nℹ️  El usuario de prueba ya existe:')
    console.log(`   Email: ${testEmail}`)
    console.log('   Contraseña: (desconocida, fue creada antes)')

    // Actualizar contraseña a una conocida
    console.log('\n🔄 Actualizando contraseña a una conocida...')
    const hashedPassword = await hash('Password123!', 12)
    await prisma.user.update({
      where: { email: testEmail },
      data: { password: hashedPassword }
    })
    console.log('✅ Contraseña actualizada a: Password123!')
  }

  // Crear usuario admin si no existe
  const adminEmail = 'admin@ugr.es'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    console.log('\n✨ Creando usuario admin...')

    const hashedPassword = await hash('Admin123456!', 12)

    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('✅ Admin creado exitosamente:')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Contraseña: Admin123456!`)
    console.log(`   Rol: ${admin.role}`)
  } else {
    console.log('\nℹ️  El usuario admin ya existe')
  }

  console.log('\n🎯 Usuarios de prueba disponibles:')
  console.log('\n🔵 ESTUDIANTE:')
  console.log('   Email: test@ugr.es')
  console.log('   Contraseña: Password123!')
  console.log('\n🔴 ADMIN:')
  console.log('   Email: admin@ugr.es')
  console.log('   Contraseña: Admin123456!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
