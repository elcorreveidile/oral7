const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Configuración de producción (SIN CONTRASEÑAS)...\n')

  // Crear usuario admin temporal con contraseña aleatoria
  const crypto = require('crypto')
  const bcryptjs = require('bcryptjs')
  const randomPassword = crypto.randomBytes(16).toString('hex').slice(0, 16) + 'Aa1!'

  console.log('📝 Creando usuario admin con contraseña temporal...')

  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@pio7.ugr.es' }
  })

  if (existingAdmin) {
    console.log('✅ El admin ya existe. No se modifica.')
  } else {
    const hashedPassword = await bcryptjs.hash(randomPassword, 10)

    await prisma.user.create({
      data: {
        email: 'admin@pio7.ugr.es',
        name: 'Administrador PIO-7',
        password: hashedPassword,
        role: 'ADMIN',
        level: 'C2',
      }
    })
    console.log('✅ Usuario admin creado')
    console.log(`   Email: admin@pio7.ugr.es`)
    console.log(`   Contraseña temporal: ${randomPassword}`)
    console.log('   ⚠️  CAMBIA LA CONTRASEÑA INMEDIATAMENTE DESDE EL PANEL')
  }

  // Verificar/crear Settings
  const settings = await prisma.settings.findUnique({
    where: { id: 'global' }
  })

  if (!settings) {
    console.log('📝 Creando configuración global...')
    await prisma.settings.create({
      data: {
        id: 'global',
        currentSession: 1,
        courseStartDate: new Date('2025-01-20'),
        courseEndDate: new Date('2025-06-15'),
      }
    })
    console.log('✅ Configuración global creada')
  } else {
    console.log('✅ Configuración global ya existe')
  }

  console.log('\n🎉 ¡Producción configurada!')
  console.log('\n⚠️  IMPORTANTE: Usa el script create-admin-secure.js para crear tu admin personal')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
