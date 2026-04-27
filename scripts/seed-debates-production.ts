import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const debateTopics = [
  {
    title: 'La influencia estadounidense global',
    description: 'Análisis del impacto cultural, político y económico de Estados Unidos en el mundo actual',
    category: 'Cultura',
    order: 1,
  },
  {
    title: 'Lugares de la ciudad',
    description: 'Espacios significativos de Granada: bares, plazas, barrios con identidad cultural',
    category: 'Granada',
    order: 2,
  },
  {
    title: 'El turismo',
    description: 'Impacto del turismo en ciudades históricas como Granada: beneficios y desafíos',
    category: 'Granada',
    order: 3,
  },
  {
    title: 'Estereotipos con Study Abroad',
    description: 'Percepciones culturales mutuas entre estudiantes locales e internacionales',
    category: 'Experiencias',
    order: 4,
  },
  {
    title: 'Tertulias culturales',
    description: 'El valor de las conversaciones profundas en contextos culturales informales',
    category: 'Cultura',
    order: 5,
  },
  {
    title: 'Diferencias culturales',
    description: 'Choques culturales y aprendizaje entre estudiantes de diferentes países',
    category: 'Experiencias',
    order: 6,
  },
  {
    title: 'Gastronomía local',
    description: 'La comida como vehículo de intercambio cultural y construcción de comunidad',
    category: 'Granada',
    order: 7,
  },
  {
    title: 'Identidad andaluza',
    description: 'Características distintivas de la cultura andaluza y su percepción por extranjeros',
    category: 'Cultura',
    order: 8,
  },
  {
    title: 'Integración social',
    description: 'Desafíos y estrategias para integrarse en la cultura local española',
    category: 'Experiencias',
    order: 9,
  },
  {
    title: 'Patrimonio histórico',
    description: 'La relación entre historia moderna (ej. Imperio Romano) y patrimonio de Granada',
    category: 'Cultura',
    order: 10,
  },
  {
    title: 'Vida estudiantil',
    description: 'Diferencias entre la vida universitaria en EEUU y en la UGR',
    category: 'Experiencias',
    order: 11,
  },
  {
    title: 'Arte y expresión',
    description: 'El arte como reflejo de identidad cultural y herramienta de integración',
    category: 'Cultura',
    order: 12,
  },
]

async function main() {
  console.log('🎯 Creando temas de debates...')

  // Verificar si ya existen temas
  const existingCount = await prisma.debateTopic.count()
  if (existingCount > 0) {
    console.log(`⚠️  Ya existen ${existingCount} temas. Omitiendo creación.`)
    console.log('ℹ️  Si quieres resetear, ejecuta primero DELETE FROM debate_votes; DELETE FROM debate_topics;')
    return
  }

  // Crear temas
  for (const topic of debateTopics) {
    await prisma.debateTopic.create({
      data: topic,
    })
    console.log(`✅ Creado: ${topic.title}`)
  }

  console.log(`\n🎉 Se han creado ${debateTopics.length} temas de debate`)
  console.log('\n🔗 Los estudiantes ya pueden votar en:')
  console.log('   https://oral7.vercel.app/votacion-debates')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
