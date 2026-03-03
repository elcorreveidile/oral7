import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Syncing sessions from sessions.ts to database...')

  // Import sessions dynamically
  const { sessionsData } = await import('../src/data/sessions.js')

  console.log(`📚 Found ${sessionsData.length} sessions in sessions.ts`)

  let created = 0
  let updated = 0

  for (const session of sessionsData) {
    // Check if session exists
    const existing = await prisma.session.findUnique({
      where: { sessionNumber: session.sessionNumber },
    })

    if (existing) {
      // Update existing session
      const updatedSession = await prisma.session.update({
        where: { sessionNumber: session.sessionNumber },
        data: {
          date: session.date,
          title: session.title,
          subtitle: session.subtitle,
          blockNumber: session.blockNumber,
          blockTitle: session.blockTitle,
          isExamDay: session.isExamDay,
          objectives: session.objectives as any,
          timing: session.timing as any,
          dynamics: session.dynamics as any,
          grammarContent: session.grammarContent as any,
          vocabularyContent: session.vocabularyContent as any,
          modeAContent: session.modeAContent as any,
          modeBContent: session.modeBContent as any,
        },
        select: { id: true },
      })

      await prisma.resource.deleteMany({
        where: { sessionId: updatedSession.id },
      })

      if (session.resources?.length) {
        await prisma.resource.createMany({
          data: session.resources.map((resource) => ({
            sessionId: updatedSession.id,
            title: resource.title,
            description: resource.description ?? null,
            type: resource.type as any,
            url: resource.url,
            order: resource.order,
          })),
        })
      }

      updated++
    } else {
      // Create new session
      await prisma.session.create({
        data: {
          sessionNumber: session.sessionNumber,
          date: session.date,
          title: session.title,
          subtitle: session.subtitle,
          blockNumber: session.blockNumber,
          blockTitle: session.blockTitle,
          isExamDay: session.isExamDay,
          objectives: session.objectives as any,
          timing: session.timing as any,
          dynamics: session.dynamics as any,
          grammarContent: session.grammarContent as any,
          vocabularyContent: session.vocabularyContent as any,
          modeAContent: session.modeAContent as any,
          modeBContent: session.modeBContent as any,
          resources: {
            create: (session.resources || []).map((resource) => ({
              title: resource.title,
              description: resource.description ?? null,
              type: resource.type as any,
              url: resource.url,
              order: resource.order,
            })),
          },
        },
      })
      created++
    }

    console.log(`  ✓ Session ${session.sessionNumber}: ${session.title}`)
  }

  console.log(`\n✅ Sync complete!`)
  console.log(`   Created: ${created} new sessions`)
  console.log(`   Updated: ${updated} existing sessions`)
  console.log(`   Total: ${sessionsData.length} sessions`)
}

main()
  .catch((e) => {
    console.error('❌ Error syncing sessions:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
