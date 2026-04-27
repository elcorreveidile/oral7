const { PrismaClient } = require('@prisma/client')
const bcryptjs = require('bcryptjs')
const crypto = require('crypto')

const prisma = new PrismaClient()

function generateSecurePassword() {
  // Generar contraseña segura de 16 caracteres
  const length = 16
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  const randomBytes = crypto.randomBytes(length)
  let password = ''

  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length]
  }

  // Asegurar que tenga al menos una mayúscula, minúscula, número y símbolo
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[!@#$%^&*]/.test(password)

  if (!hasUpper || !hasLower || !hasNumber || !hasSymbol) {
    return generateSecurePassword() // Reintentar si no cumple requisitos
  }

  return password
}

async function main() {
  console.log('🚨 CAMBIO EMERGENCIA DE CONTRASEÑA')
  console.log('==================================\n')

  const email = 'benitezl@go.ugr.es'
  const newPassword = generateSecurePassword()

  console.log(`📧 Usuario: ${email}`)
  console.log(`🔑 Nueva contraseña: ${newPassword}`)
  console.log()

  const hashedPassword = await bcryptjs.hash(newPassword, 10)

  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  })

  console.log('✅ Contraseña cambiada exitosamente en base de datos')
  console.log(`   Usuario: ${user.name}`)
  console.log(`   Email: ${user.email}`)
  console.log()
  console.log('⚠️  GUARDA ESTA CONTRASEÑA EN LUGAR SEGURO:')
  console.log(`   ${newPassword}`)
  console.log()

  // Guardar en archivo local (solo para emergencia)
  const fs = require('fs')
  fs.writeFileSync('./ADMIN_PASSWORD_EMERGENCIA.txt', newPassword)
  console.log('💾 Contraseña guardada en ./ADMIN_PASSWORD_EMERGENCIA.txt')
  console.log('   ⚠️  BORRA este archivo después de guardar la contraseña en un lugar seguro')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
