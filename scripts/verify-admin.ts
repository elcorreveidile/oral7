#!/usr/bin/env ts-node

/**
 * Script para verificar y/o recrear el usuario admin
 * Uso: npx ts-node scripts/verify-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando usuario admin...\n');

  const adminEmail = 'benitezl@go.ugr.es';
  const adminPassword = 'admin123';

  // Buscar el usuario admin
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('✅ Usuario admin encontrado:');
    console.log(`   Email: ${existingAdmin.email}`);
    console.log(`   Name: ${existingAdmin.name}`);
    console.log(`   Role: ${existingAdmin.role}`);
    console.log(`   Has password: ${existingAdmin.password ? 'Yes' : 'No'}`);
    console.log(`   2FA enabled: ${existingAdmin.twoFactorEnabled}`);

    // Verificar si la contraseña coincide
    if (existingAdmin.password) {
      const isValid = await bcrypt.compare(adminPassword, existingAdmin.password);
      console.log(`   Password valid: ${isValid ? '✅ Yes' : '❌ No'}`);

      if (!isValid) {
        console.log('\n🔧 Contraseña incorrecta. Actualizando...');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await prisma.user.update({
          where: { email: adminEmail },
          data: { password: hashedPassword }
        });

        console.log('✅ Contraseña actualizada correctamente');
      }
    } else {
      console.log('\n🔧 Usuario no tiene contraseña. Añadiendo...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await prisma.user.update({
        where: { email: adminEmail },
        data: { password: hashedPassword }
      });

      console.log('✅ Contraseña añadida correctamente');
    }
  } else {
    console.log('❌ Usuario admin NO encontrado. Creando...');

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Javier Benítez Láinez',
        password: hashedPassword,
        role: 'ADMIN',
        twoFactorEnabled: false
      }
    });

    console.log('✅ Usuario admin creado correctamente');
  }

  console.log('\n📋 Credenciales del admin:');
  console.log('   Email: benitezl@go.ugr.es');
  console.log('   Password: admin123');
  console.log('\n🎯 Ahora puedes iniciar sesión correctamente\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
