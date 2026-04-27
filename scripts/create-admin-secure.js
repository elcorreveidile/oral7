const { PrismaClient } = require('@prisma/client')
const bcryptjs = require('bcryptjs')
const readline = require('readline')

const prisma = new PrismaClient()

async function askPassword(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve => {
    rl.question(prompt, (password) => {
      rl.close()
      resolve(password)
    })
  })
}

async function main() {
  console.log('🔧 Configuración SEGURA de admin...\n')

  // Obtener email desde variable de entorno o pedirlo
  const email = process.env.ADMIN_EMAIL || 'benitezl@go.ugr.es'

  // Pedir contraseña de forma interactiva (NO se guarda en archivo)
  const password = await askPassword('Introduce la contraseña del admin: ')

  if (!password || password.length < 8) {
    console.error('❌ La contraseña debe tener al menos 8 caracteres')
    process.exit(1)
  }

  console.log(`\n🔧 Buscando usuario ${email}...`)

  // Verificar si existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    console.log(`✅ Usuario encontrado: ${existingUser.name}`)
    console.log(`   Rol actual: ${existingUser.role}`)

    // Actualizar a ADMIN si no lo es
    if (existingUser.role !== 'ADMIN') {
      console.log('📝 Actualizando rol a ADMIN...')
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
      })
      console.log('✅ Rol actualizado a ADMIN')
    } else {
      console.log('✅ Ya es ADMIN')
    }

    // Resetear contraseña
    console.log('📝 Actualizando contraseña...')
    const hashedPassword = await bcryptjs.hash(password, 10)
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })
    console.log('✅ Contraseña actualizada')

  } else {
    console.log('📝 Usuario no encontrado. Creándolo...')

    const hashedPassword = await bcryptjs.hash(password, 10)
    await prisma.user.create({
      data: {
        email,
        name: 'Javier Benítez',
        password: hashedPassword,
        role: 'ADMIN',
        level: 'C2',
      }
    })
    console.log('✅ Usuario creado como ADMIN')
  }

  // Verificar usuarios duplicados
  console.log('\n🔍 Verificando usuarios similares...')
  const allUsers = await prisma.user.findMany({
    where: {
      email: {
        contains: 'benitez'
      }
    }
  })

  if (allUsers.length > 1) {
    console.log(`⚠️  Encontrados ${allUsers.length} usuarios con 'benitez' en el email:`)
    allUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.role})`)
    })
  }

  console.log('\n🎉 ¡Listo!')
  console.log('\n📋 El usuario ya puede hacer login con la contraseña que acabas de introducir')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
