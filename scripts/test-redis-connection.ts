/**
 * Script para verificar conexión a Railway Redis
 * Ejecutar con: npx tsx scripts/test-redis-connection.ts
 */

import { createClient } from 'redis'

async function testRedisConnection() {
  console.log('\n========================================')
  console.log('🔍 VERIFICACIÓN DE CONEXIÓN REDIS')
  console.log('========================================\n')

  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    console.error('❌ REDIS_URL no está configurada')
    console.log('\nConfiguración requerida:')
    console.log('1. Crear Redis en Railway')
    console.log('2. Copiar REDIS_URL desde Railway')
    console.log('3. Añadir a variables de entorno: export REDIS_URL="redis://..."')
    console.log('4. O añadir en Vercel → Settings → Environment Variables')
    process.exit(1)
  }

  console.log('📍 REDIS_URL encontrada')
  console.log(`   Host: ${redisUrl.split('@')[1]?.split(':')[0] || 'N/A'}`)
  console.log(`   Puerto: ${redisUrl.split(':').pop() || 'N/A'}`)

  console.log('\n🔌 Conectando a Redis...')

  const client = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 10000,
      reconnectStrategy: false
    }
  })

  client.on('error', (err) => {
    console.error('❌ Error de conexión:', err.message)
    process.exit(1)
  })

  try {
    await client.connect()
    console.log('✅ Conexión exitosa a Redis')

    // Test básico: SET
    console.log('\n📝 Test: SET operation')
    await client.set('test:key', 'hello-railway')
    console.log('✅ SET exitoso')

    // Test básico: GET
    console.log('\n📖 Test: GET operation')
    const value = await client.get('test:key')
    if (value === 'hello-railway') {
      console.log('✅ GET exitoso:', value)
    } else {
      throw new Error('Valor incorrecto')
    }

    // Test básico: DEL
    console.log('\n🗑️  Test: DEL operation')
    await client.del('test:key')
    console.log('✅ DEL exitoso')

    // Test de increment (usado en rate limiting)
    console.log('\n🔢 Test: INCR operation (rate limiting)')
    await client.set('test:counter', '0')
    const result1 = await client.incr('test:counter')
    const result2 = await client.incr('test:counter')
    const result3 = await client.incr('test:counter')
    console.log('✅ INCR exitoso:', result1, '→', result2, '→', result3)
    await client.del('test:counter')

    // Test de TTL (usado en rate limiting)
    console.log('\n⏱️  Test: EXPIRE operation (rate limiting)')
    await client.set('test:ttl', 'expires-soon')
    await client.expire('test:ttl', 60)
    const ttl = await client.ttl('test:ttl')
    if (ttl > 0 && ttl <= 60) {
      console.log('✅ EXPIRE exitoso, TTL:', ttl, 'segundos')
    } else {
      throw new Error('TTL incorrecto')
    }
    await client.del('test:ttl')

    // Información del servidor
    console.log('\n📊 Información del servidor:')
    const info = await client.info('server')
    const version = info.match(/redis_version:([^\r\n]+)/)?.[1]
    const mode = info.match(/redis_mode:([^\r\n]+)/)?.[1]
    const os = info.match(/os:([^\r\n]+)/)?.[1]

    console.log('   Versión:', version || 'N/A')
    console.log('   Modo:', mode || 'N/A')
    console.log('   OS:', os || 'N/A')

    // Memoria
    const memoryInfo = await client.info('memory')
    const usedMemory = memoryInfo.match(/used_memory_human:([^\r\n]+)/)?.[1]
    const maxMemory = memoryInfo.match(/maxmemory_human:([^\r\n]+)/)?.[1]
    console.log('   Memoria usada:', usedMemory || 'N/A')
    console.log('   Memoria máxima:', maxMemory || 'N/A')

    console.log('\n========================================')
    console.log('✅ TODOS LOS TESTS PASARON')
    console.log('========================================\n')

    console.log('🎉 Redis está funcionando correctamente')
    console.log('✅ Rate limiting operativo en Railway Redis')
    console.log('\nPróximos pasos:')
    console.log('1. Añadir REDIS_URL a Vercel → Settings → Environment Variables')
    console.log('2. Redeploy: vercel --prod')
    console.log('3. Verificar logs de Vercel para confirmar conexión')

    await client.disconnect()
    process.exit(0)

  } catch (error) {
    console.error('\n❌ Error:', error)
    console.log('\nPosibles soluciones:')
    console.log('1. Verificar que Railway Redis esté corriendo')
    console.log('2. Verificar que REDIS_URL sea correcta')
    console.log('3. Verificar conectividad de red')
    console.log('4. Verificar que Railway tenga minutos disponibles (free tier)')
    await client.disconnect().catch(() => {})
    process.exit(1)
  }
}

testRedisConnection()
