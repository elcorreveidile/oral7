import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Endpoint protegido para actualizar contenido de sesiones
// Uso: GET /api/admin/update-session?secret=TU_SECRET&session=2

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const sessionNum = parseInt(searchParams.get('session') || '2')

  // Verificar secret (usa la misma variable que el invite code o crea una nueva)
  const validSecret = process.env.ADMIN_SECRET || process.env.STUDENT_INVITE_CODE
  if (!validSecret || secret !== validSecret) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // Contenido de la Sesión 2
    if (sessionNum === 2) {
      const session2Data = {
        title: 'Cohesión y conectores argumentales',
        subtitle: 'Mejorando la fluidez del discurso',
        objectives: [
          'Mejorar la cohesión del discurso mediante conectores',
          'Diferenciar registros (coloquial vs. formal) al argumentar',
          'Practicar la estructura básica de una opinión oral',
        ],
        timing: [
          { phase: 'Revisión y Feedback', duration: '10 min', description: 'Escucha selectiva de 2-3 audios de la tarea de casa. Corrección rápida de errores de pronunciación o gramática.' },
          { phase: 'Teoría Visual: El esqueleto de la argumentación', duration: '20 min', description: 'Visionado de un fragmento de debate (1 min). Análisis colectivo: ¿Cómo conecta el hablante sus ideas? Explicación del listado de conectores clave.' },
          { phase: 'Taller: ¿Vale la pena vivir en Granada?', duration: '45 min', description: 'División en grupos. 15 min preparación de argumentos con conectores. Modo B: Rellenan plantilla. Modo A: Discusión libre. 30 min debate Pro vs Con.' },
          { phase: 'Cierre', duration: '15 min', description: 'Puesta en común de conectores más útiles. Anuncio del tema de la próxima clase (Acuerdo y desacuerdo).' },
        ],
        dynamics: [
          { title: 'Debate: ¿Vale la pena vivir en Granada?', description: 'Defensa de posturas Pro vs Con con uso obligatorio de conectores', duration: '30 min', mode: 'A' },
          { title: 'Plantilla de conectores', description: 'Rellenar estructura argumentativa con conectores apropiados', duration: '15 min', mode: 'B' },
        ],
        grammarContent: {
          title: 'Conectores argumentales C1',
          topics: [
            { category: 'Iniciar', examples: ['Para empezar', 'En primer lugar'] },
            { category: 'Añadir', examples: ['Por otro lado', 'Asimismo', 'Además'] },
            { category: 'Contrastar', examples: ['No obstante', 'Por el contrario', 'Sin embargo'] },
            { category: 'Concluir', examples: ['En definitiva', 'En suma'] },
          ],
        },
        vocabularyContent: {
          title: 'Mapa mental de conectores',
          categories: [
            { topic: 'Adición 🔵', words: ['Además', 'Es más', 'Asimismo', 'Por otro lado'] },
            { topic: 'Oposición 🔴', words: ['Pero', 'Sin embargo', 'No obstante', 'Por el contrario'] },
            { topic: 'Conclusión 🟢', words: ['En resumen', 'En definitiva', 'En suma', 'Por último'] },
          ],
        },
        modeAContent: {
          title: 'Modo A: Enfoque Integrador',
          description: 'Discusión libre buscando la fluidez. Los estudiantes debaten sin plantilla, usando conectores de forma natural.',
          activities: ['Debate espontáneo sobre vivir en Granada', 'Reaccionar a las intervenciones de los compañeros'],
        },
        modeBContent: {
          title: 'Modo B: Soporte Visual/Analítico',
          description: 'Rellenan una plantilla con los conectores. Mapa mental de conectores con ejemplos bilingües ES/EN y ES/CN para apoyo rápido.',
          activities: ['Completar plantilla argumentativa', 'Identificar conectores en texto modelo'],
        },
      }

      // Actualizar la sesión 2
      const updatedSession = await prisma.session.update({
        where: { sessionNumber: 2 },
        data: session2Data,
      })

      // Actualizar checklist items
      await prisma.checklistItem.deleteMany({
        where: { sessionId: updatedSession.id },
      })
      await prisma.checklistItem.createMany({
        data: [
          { sessionId: updatedSession.id, text: 'He usado conectores de contraste correctamente', order: 1 },
          { sessionId: updatedSession.id, text: 'He mantenido un registro coherente durante mi intervención', order: 2 },
          { sessionId: updatedSession.id, text: 'He reaccionado a las intervenciones de mis compañeros', order: 3 },
        ],
      })

      // Actualizar recursos
      await prisma.resource.deleteMany({
        where: { sessionId: updatedSession.id },
      })
      await prisma.resource.createMany({
        data: [
          {
            sessionId: updatedSession.id,
            title: 'Conectores argumentales C1',
            type: 'PDF',
            url: '/resources/conectores-argumentales-c1.pdf',
            order: 1,
          },
          {
            sessionId: updatedSession.id,
            title: 'Artículo: El impacto de las redes sociales',
            type: 'PDF',
            url: '/resources/articulo-redes-sociales.pdf',
            order: 2,
          },
          {
            sessionId: updatedSession.id,
            title: 'Plantilla de argumentación',
            type: 'PDF',
            url: '/resources/plantilla-argumentacion.pdf',
            order: 3,
          },
        ],
      })

      // Actualizar tareas
      await prisma.task.deleteMany({
        where: { sessionId: updatedSession.id },
      })
      await prisma.task.createMany({
        data: [
          {
            sessionId: updatedSession.id,
            title: 'Arrastra el conector correcto a la frase',
            description: 'Ejercicio interactivo de conectores argumentales',
            type: 'FILL_BLANKS',
            content: {
              instructions: 'Arrastra el conector correcto a cada espacio en blanco.',
              questions: [
                {
                  question: '___ me gusta la gastronomía andaluza, ___ no soporto el calor del verano.',
                  blanks: 2,
                  options: ['Por un lado', 'Por otro lado', 'Me gusta', 'pero'],
                  correctAnswers: ['Por un lado', 'por otro lado'],
                  explanation: 'Usamos "Por un lado... por otro lado..." para presentar dos aspectos contrastados de forma formal.',
                },
                {
                  question: '___ la ciudad tiene mucha vida cultural. ___, el coste de vida es bastante bajo.',
                  blanks: 2,
                  options: ['Para empezar', 'Además', 'Sin embargo', 'En conclusión'],
                  correctAnswers: ['Para empezar', 'Además'],
                  explanation: 'Usamos "Para empezar" para iniciar una enumeración y "Además" para añadir información.',
                },
                {
                  question: 'La ubicación es perfecta. ___, echo de menos el mar.',
                  blanks: 1,
                  options: ['Además', 'No obstante', 'Es más', 'Por último'],
                  correctAnswers: ['No obstante'],
                  explanation: '"No obstante" introduce una objeción o contraste con lo anterior.',
                },
              ],
            },
            order: 1,
            isModeBOnly: true,
          },
        ],
      })

      return NextResponse.json({
        success: true,
        message: `Sesión ${sessionNum} actualizada correctamente`,
        session: {
          id: updatedSession.id,
          title: updatedSession.title,
          subtitle: updatedSession.subtitle,
        },
      })
    }

    return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
  } catch (error) {
    console.error('Error actualizando sesión:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la sesión', details: String(error) },
      { status: 500 }
    )
  }
}
