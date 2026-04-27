import { PrismaClient } from '@prisma/client'
import * as bcryptjsjs from 'bcryptjsjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Configurando producción...')

  // Verificar si ya existe un admin
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@pio7.ugr.es' }
  })

  if (existingAdmin) {
    console.log('✅ El admin ya existe. Actualizando contraseña...')
    const hashedPassword = await bcryptjs.hash('Admin2025!', 10)
    await prisma.user.update({
      where: { email: 'admin@pio7.ugr.es' },
      data: { password: hashedPassword }
    })
    console.log('✅ Contraseña actualizada')
  } else {
    console.log('📝 Creando usuario admin...')
    const hashedPassword = await bcryptjs.hash('Admin2025!', 10)
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

  console.log('\n🎉 ¡Producción configurada correctamente!')
  console.log('\n📋 Credenciales de acceso:')
  console.log('   Email: admin@pio7.ugr.es')
  console.log('   Contraseña: Admin2025!')
  console.log('\n🔗 URL: https://oral7.vercel.app/login')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
