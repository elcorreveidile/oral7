import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed process...')
  console.log('📅 Course: Feb 2 - May 21, 2026 | Tue/Thu schedule')

  // ============================================
  // 1. CREATE USERS - ADMIN + TEST STUDENTS
  // ============================================
  console.log('📝 Creating users...')

  const hashedPassword = await bcrypt.hash('admin123', 10)
  const studentPassword = await bcrypt.hash('estudiante123', 10)

  // Admin (Profesor - correo real)
  const admin = await prisma.user.upsert({
    where: { email: 'benitezl@go.ugr.es' },
    update: {},
    create: {
      email: 'benitezl@go.ugr.es',
      name: 'Javier Benítez Láinez',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Estudiantes de PRUEBA para desarrollo local
  // En producción, los estudiantes se registrarán por sí mismos
  const testStudents = [
    { email: 'test.student1@ugr.es', name: 'Estudiante Prueba 1' },
    { email: 'test.student2@ugr.es', name: 'Estudiante Prueba 2' },
    { email: 'test.student3@ugr.es', name: 'Estudiante Prueba 3' },
  ]

  const students: any[] = []
  for (const student of testStudents) {
    const created = await prisma.user.upsert({
      where: { email: student.email },
      update: {},
      create: {
        email: student.email,
        name: student.name,
        password: studentPassword,
        role: 'STUDENT',
      },
    })
    students.push(created)
  }

  console.log(`✅ Users created: 1 admin (benitezl@go.ugr.es) + ${students.length} test students`)

  // ============================================
  // 2. CREATE GLOBAL SETTINGS
  // ============================================
  console.log('📝 Creating global settings...')

  const settings = await prisma.settings.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      currentSession: 1,
      courseStartDate: new Date('2026-02-02'),
      courseEndDate: new Date('2026-05-21'),
    },
  })

  console.log('✅ Settings created')

  // ============================================
  // 3. CREATE SESSIONS - CALENDARIO REAL 2026
  // ============================================
  console.log('📚 Creating sessions (Tue/Thu schedule)...')

  const sessions: any[] = []

  // Fechas de sesión (martes y jueves)
  // Excluyendo: Semana Santa (30 mar-3 abr), 1 mayo, 13 mar (viernes con clase pero no es sesión regular)
  // Exámenes: 26 mar (parcial), 21 may (final) - NO cuentan como sesiones de clase

  // FEBRERO 2026
  const febDates = [
    new Date('2026-02-03'), // Mar
    new Date('2026-02-05'), // Jue
    new Date('2026-02-10'), // Mar
    new Date('2026-02-12'), // Jue
    new Date('2026-02-17'), // Mar
    new Date('2026-02-19'), // Jue
    new Date('2026-02-24'), // Mar
    new Date('2026-02-26'), // Jue
  ]

  // MARZO 2026 (excluyendo 26 mar - examen parcial)
  const marDates = [
    new Date('2026-03-03'), // Mar
    new Date('2026-03-05'), // Jue
    new Date('2026-03-10'), // Mar
    new Date('2026-03-12'), // Jue
    new Date('2026-03-17'), // Mar
    new Date('2026-03-19'), // Jue
    new Date('2026-03-31'), // Mar (después de semana santa)
  ]

  // ABRIL 2026 (excluyendo semana santa 30 mar-3 abr)
  const aprDates = [
    new Date('2026-04-07'), // Mar
    new Date('2026-04-09'), // Jue
    new Date('2026-04-14'), // Mar
    new Date('2026-04-16'), // Jue
    new Date('2026-04-21'), // Mar
    new Date('2026-04-23'), // Jue
    new Date('2026-04-28'), // Mar
    new Date('2026-04-30'), // Jue
  ]

  // MAYO 2026 (excluyendo 1 mayo, última clase 14 mayo)
  const mayDates = [
    new Date('2026-05-05'), // Mar
    new Date('2026-05-07'), // Jue
    new Date('2026-05-12'), // Mar
    new Date('2026-05-14'), // Jue - ÚLTIMA CLASE
  ]

  // Combinar todas las fechas
  const allDates = [...febDates, ...marDates, ...aprDates, ...mayDates]

  // Definir sesiones con contenido
  const sessionDefinitions = [
    // FEBRERO - Fundamentos
    {
      number: 1,
      date: allDates[0],
      title: 'Bienvenida y Evaluación Diagnóstica',
      subtitle: 'Conociendo tu nivel C1',
      block: 1,
      blockTitle: 'Fundamentos de la Expresión Oral',
      objectives: [
        'Presentar el enfoque pedagógico',
        'Evaluar nivel inicial',
        'Establecer objetivos personales',
        'Familiarizarse con la plataforma',
      ],
      timing: [
        { phase: 'Presentación del curso', duration: '15 min', description: 'Metodología y evaluación' },
        { phase: 'Rompehielo', duration: '20 min', description: 'Presentaciones en parejas' },
        { phase: 'Evaluación diagnóstica', duration: '30 min', description: 'Monólogo + entrevista' },
        { phase: 'Feedback', duration: '25 min', description: 'Fortalezas y áreas de mejora' },
        { phase: 'Cierre', duration: '10 min', description: 'Objetivos personales' },
      ],
      dynamics: [
        { title: 'Entrevista por parejas', description: 'Descubrir información del compañero', duration: '20 min', mode: 'A' },
        { title: 'Mapa de competencias', description: 'Evaluación con criterios MCER', duration: '30 min', mode: 'B' },
      ],
    },
    {
      number: 2,
      date: allDates[1],
      title: 'Cohesión y conectores argumentales',
      subtitle: 'Mejorando la fluidez del discurso',
      block: 1,
      blockTitle: 'Fundamentos de la Expresión Oral',
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
      // Contenido específico de la sesión 2
      grammarContentFull: {
        title: 'Conectores argumentales C1',
        topics: [
          { category: 'Iniciar', examples: ['Para empezar', 'En primer lugar'] },
          { category: 'Añadir', examples: ['Por otro lado', 'Asimismo', 'Además'] },
          { category: 'Contrastar', examples: ['No obstante', 'Por el contrario', 'Sin embargo'] },
          { category: 'Concluir', examples: ['En definitiva', 'En suma'] },
        ],
      },
      vocabularyContentFull: {
        title: 'Mapa mental de conectores',
        categories: [
          { topic: 'Adición 🔵', words: ['Además', 'Es más', 'Asimismo', 'Por otro lado'] },
          { topic: 'Oposición 🔴', words: ['Pero', 'Sin embargo', 'No obstante', 'Por el contrario'] },
          { topic: 'Conclusión 🟢', words: ['En resumen', 'En definitiva', 'En suma', 'Por último'] },
        ],
      },
      modeAContentFull: {
        title: 'Modo A: Enfoque Integrador',
        description: 'Discusión libre buscando la fluidez. Los estudiantes debaten sin plantilla, usando conectores de forma natural.',
        activities: ['Debate espontáneo sobre vivir en Granada', 'Reaccionar a las intervenciones de los compañeros'],
      },
      modeBContentFull: {
        title: 'Modo B: Soporte Visual/Analítico',
        description: 'Rellenan una plantilla con los conectores. Mapa mental de conectores con ejemplos bilingües ES/EN y ES/CN para apoyo rápido.',
        activities: ['Completar plantilla argumentativa', 'Identificar conectores en texto modelo'],
      },
      checklistItems: [
        'He usado conectores de contraste correctamente',
        'He mantenido un registro coherente durante mi intervención',
        'He reaccionado a las intervenciones de mis compañeros',
      ],
      homework: 'Lee el artículo de opinión (PDF proporcionado) sobre "El impacto de las redes sociales". Sube una foto de 5 conectores nuevos que hayas encontrado y explica en 1 frase por qué se usan ahí.',
    },
    {
      number: 3,
      date: allDates[2],
      title: 'Narración Avanzada',
      subtitle: 'Relatando experiencias con riqueza',
      block: 1,
      blockTitle: 'Fundamentos de la Expresión Oral',
      objectives: [
        'Usar tiempos pasados con precisión',
        'Describir escenas con detalle sensorial',
        'Construir narraciones coherentes',
        'Emplear recursos de dramatización',
      ],
      timing: [
        { phase: 'Recuerdos inolvidables', duration: '15 min', description: 'Anécdotas breves' },
        { phase: 'Tiempos verbales', duration: '20 min', description: 'Diferencias entre pretéritos' },
        { phase: 'Descripción sensorial', duration: '30 min', description: 'Descripciones vivas' },
        { phase: 'Narración cronológica', duration: '25 min', description: 'Relato de experiencias' },
      ],
      dynamics: [
        { title: 'Cadena de historias', description: 'Cada uno continúa la historia', duration: '30 min', mode: 'A' },
        { title: 'Fotografías habladas', description: 'Describir imágenes con guion', duration: '25 min', mode: 'B' },
      ],
    },
    {
      number: 4,
      date: allDates[3],
      title: 'La Exposición Oral Formal',
      subtitle: 'Presentando con claridad y confianza',
      block: 1,
      blockTitle: 'Fundamentos de la Expresión Oral',
      objectives: [
        'Estructurar presentaciones efectivas',
        'Usar lenguaje corporal y voz',
        'Incorporar apoyos visuales',
        'Manejar preguntas del audiencia',
      ],
      timing: [
        { phase: 'Análisis de presentaciones', duration: '20 min', description: 'Buenas prácticas' },
        { phase: 'Estructura', duration: '25 min', description: 'Intro, desarrollo, cierre' },
        { phase: 'Lenguaje no verbal', duration: '20 min', description: 'Postura, gestos, contacto visual' },
        { phase: 'Mini-presentaciones', duration: '30 min', description: '5 min con feedback' },
      ],
      dynamics: [
        { title: 'Elevator pitch', description: '60 segundos con persuasión', duration: '20 min', mode: 'A' },
        { title: 'Presentación estructurada', description: 'Con plantillas y apoyos', duration: '30 min', mode: 'B' },
      ],
    },
    // MARZO - Interacción
    {
      number: 5,
      date: allDates[4],
      title: 'Negociación y Mediación',
      subtitle: 'Resolviendo conflictos',
      block: 2,
      blockTitle: 'Interacción Avanzada',
      objectives: [
        'Negociar y alcanzar acuerdos efectivamente',
        'Mediar en conflictos interculturales',
        'Usar lenguaje de cortesía',
        'Construir consenso',
      ],
      timing: [
        { phase: 'Caso de negociación', duration: '15 min', description: 'Presentación del escenario' },
        { phase: 'Estrategias', duration: '20 min', description: 'Tácticas de negociación' },
        { phase: 'Role-play', duration: '35 min', description: 'Simulación de conflicto' },
        { phase: 'Debrief', duration: '15 min', description: 'Análisis grupal' },
      ],
      dynamics: [
        { title: 'Simulación de negociación', description: 'Intereses conflictivos', duration: '35 min', mode: 'A' },
        { title: 'Análisis de casos', description: 'Estudio paso a paso', duration: '30 min', mode: 'B' },
      ],
    },
    {
      number: 6,
      date: allDates[5],
      title: 'El Debate Académico',
      subtitle: 'Argumentando en contexto universitario',
      block: 2,
      blockTitle: 'Interacción Avanzada',
      objectives: [
        'Participar en debates formales',
        'Contraargumentar eficazmente',
        'Citar fuentes oralmente',
        'Mantener registro formal',
      ],
      timing: [
        { phase: 'Introducción', duration: '15 min', description: 'Formato y reglas' },
        { phase: 'Preparación', duration: '20 min', description: 'Trabajo en equipos' },
        { phase: 'Ronda de apertura', duration: '15 min', description: 'Posturas iniciales' },
        { phase: 'Ronda de refutación', duration: '20 min', description: 'Contraargumentación' },
        { phase: 'Evaluación', duration: '15 min', description: 'Feedback entre pares' },
      ],
      dynamics: [
        { title: 'Debate formal', description: 'Con moderador y tiempos', duration: '60 min', mode: 'B' },
        { title: 'Discusión circular', description: 'Sin estructura rígida', duration: '40 min', mode: 'A' },
      ],
    },
    {
      number: 7,
      date: allDates[6],
      title: 'Entrevista Profesional',
      subtitle: 'Comunicación en contextos laborales',
      block: 2,
      blockTitle: 'Interacción Avanzada',
      objectives: [
        'Preparar y conducir entrevistas',
        'Presentar cualificaciones',
        'Responder preguntas STAR',
        'Hacer preguntas estratégicas',
      ],
      timing: [
        { phase: 'Tipos de entrevistas', duration: '15 min', description: 'Formatos comunes' },
        { phase: 'Elevator pitch', duration: '20 min', description: '2 minutos' },
        { phase: 'Método STAR', duration: '25 min', description: 'Situación, Tarea, Acción, Resultado' },
        { phase: 'Role-play', duration: '30 min', description: 'Simulación completa' },
      ],
      dynamics: [
        { title: 'Simulación entrevista', description: 'Realista con feedback', duration: '30 min', mode: 'B' },
        { title: 'Speed networking', description: 'Conversaciones breves', duration: '25 min', mode: 'A' },
      ],
    },
    {
      number: 8,
      date: allDates[7],
      title: 'Comunicación Intercultural',
      subtitle: 'Navegando diferencias culturales',
      block: 2,
      blockTitle: 'Interacción Avanzada',
      objectives: [
        'Identificar diferencias pragmáticas',
        'Ajustar registro según contexto',
        'Evitar malentendidos',
        'Comunicarse efectivamente',
      ],
      timing: [
        { phase: 'Conceptos clave', duration: '20 min', description: 'Cultura y pragmática' },
        { phase: 'Estudios de caso', duration: '25 min', description: 'Malentendidos reales' },
        { phase: 'Variantes del español', duration: '20 min', description: 'España vs América' },
        { phase: 'Role-play', duration: '30 min', description: 'Simulaciones' },
      ],
      dynamics: [
        { title: 'Simulaciones interculturales', description: 'Diferentes normas', duration: '30 min', mode: 'A' },
        { title: 'Análisis comparativo', description: 'Estudio estructurado', duration: '25 min', mode: 'B' },
      ],
    },
    // ABRIL - Perfeccionamiento
    {
      number: 9,
      date: allDates[8],
      title: 'Precisión Léxica',
      subtitle: 'Ampliando vocabulario C1',
      block: 3,
      blockTitle: 'Perfeccionamiento Comunicativo',
      objectives: [
        'Ampliar vocabulario técnico',
        'Usar figuras retóricas',
        'Evitar traducciones literales',
        'Seleccionar el término preciso',
      ],
      timing: [
        { phase: 'Diagnóstico léxico', duration: '15 min', description: 'Activación' },
        { phase: 'Campos semánticos', duration: '25 min', description: 'Precisión' },
        { phase: 'Figuras retóricas', duration: '25 min', description: 'Metáforas, símiles' },
        { phase: 'Práctica', duration: '25 min', description: 'Monólogos expresivos' },
      ],
      dynamics: [
        { title: 'Símiles creativos', description: 'Analogías originales', duration: '25 min', mode: 'A' },
        { title: 'Ejercicios de precisión', description: 'Sinónimos exactos', duration: '25 min', mode: 'B' },
      ],
    },
    {
      number: 10,
      date: allDates[9],
      title: 'Pronunciación y Entonación',
      subtitle: 'Perfeccionando la prosodia',
      block: 3,
      blockTitle: 'Perfeccionamiento Comunicativo',
      objectives: [
        'Dominar patrones de entonación',
        'Mejorar articulación',
        'Usar pausas y énfasis',
        'Lograr acento cercano al nativo',
      ],
      timing: [
        { phase: 'Diagnóstico', duration: '15 min', description: 'Áreas problemáticas' },
        { phase: 'Patrones entonativos', duration: '25 min', description: 'Entonación española' },
        { phase: 'Sonidos difíciles', duration: '25 min', description: 'R/Rr, J/G, B/V' },
        { phase: 'Práctica con feedback', duration: '25 min', description: 'Grabación y análisis' },
      ],
      dynamics: [
        { title: 'Lectura expresiva', description: 'Con entonación', duration: '25 min', mode: 'B' },
        { title: 'Shadowing nativo', description: 'Repetir tras audio', duration: '25 min', mode: 'A' },
      ],
    },
    {
      number: 11,
      date: allDates[10],
      title: 'Coherencia y Cohesión',
      subtitle: 'Organizando el discurso',
      block: 3,
      blockTitle: 'Perfeccionamiento Comunicativo',
      objectives: [
        'Estructurar discursos coherentes',
        'Usar conectores con variedad',
        'Mantener tema y relevancia',
        'Lograr progresión temática',
      ],
      timing: [
        { phase: 'Conceptos', duration: '20 min', description: 'Coherencia vs cohesión' },
        { phase: 'Conectores', duration: '25 min', description: 'Repertorio completo' },
        { phase: 'Análisis', duration: '25 min', description: 'Modelos' },
        { phase: 'Práctica', duration: '30 min', description: 'Monólogos' },
      ],
      dynamics: [
        { title: 'Discurso improvisado', description: 'Sobre la marcha', duration: '30 min', mode: 'A' },
        { title: 'Esquemas discursivos', description: 'Organizadores', duration: '30 min', mode: 'B' },
      ],
    },
    {
      number: 12,
      date: allDates[11],
      title: 'Ironía y Humor',
      subtitle: 'Sutileza pragmática',
      block: 3,
      blockTitle: 'Perfeccionamiento Comunicativo',
      objectives: [
        'Reconocer y producir ironía',
        'Comprender dobles sentidos',
        'Usar humor apropiadamente',
        'Interpretar implicaturas',
      ],
      timing: [
        { phase: 'Pragmática', duration: '20 min', description: 'Lo dicho vs lo implicado' },
        { phase: 'Ironía', duration: '25 min', description: 'Pistas prosódicas' },
        { phase: 'Humor cultural', duration: '25 min', description: 'Chistes, dobles sentidos' },
        { phase: 'Producción', duration: '20 min', description: 'Crear intervenciones' },
      ],
      dynamics: [
        { title: 'Stand-up breve', description: 'Chiste o anécdota', duration: '20 min', mode: 'A' },
        { title: 'Análisis de sketches', description: 'Programas de humor', duration: '25 min', mode: 'B' },
      ],
    },
    // MAYO - Proyecto final
    {
      number: 13,
      date: allDates[12],
      title: 'Presentaciones Académicas',
      subtitle: 'Comunicando investigación',
      block: 3,
      blockTitle: 'Perfeccionamiento Comunicativo',
      objectives: [
        'Estructurar presentaciones académicas',
        'Comunicar investigación oralmente',
        'Usar vocabulario especializado',
        'Manejar Q&A académico',
      ],
      timing: [
        { phase: 'Estructura académica', duration: '20 min', description: 'IMRYD, etc.' },
        { phase: 'Lenguaje académico', duration: '25 min', description: 'Verbos, conectores' },
        { phase: 'Mini-presentaciones', duration: '30 min', description: 'Temas de investigación' },
        { phase: 'Q&A', duration: '15 min', description: 'Gestión de preguntas' },
      ],
      dynamics: [
        { title: 'Presentación investigación', description: '5-7 min con Q&A', duration: '35 min', mode: 'B' },
        { title: 'Discusión panel', description: 'Formato congresual', duration: '30 min', mode: 'A' },
      ],
    },
    {
      number: 14,
      date: allDates[13],
      title: 'Repaso y Consolidación',
      subtitle: 'Integrando competencias',
      block: 3,
      blockTitle: 'Perfeccionamiento Comunicativo',
      objectives: [
        'Integrar todas las competencias',
        'Identificar áreas de mejora',
        'Practicar para examen final',
        'Recibir feedback final',
      ],
      timing: [
        { phase: 'Repaso gramatical', duration: '20 min', description: 'Consolidación' },
        { phase: 'Repaso léxico', duration: '20 min', description: 'Vocabulario C1' },
        { phase: 'Práctica integradora', duration: '30 min', description: 'Simulación examen' },
        { phase: 'Feedback personal', duration: '20 min', description: 'Orientaciones finales' },
      ],
      dynamics: [
        { title: 'Simulación examen', description: 'Prueba completa', duration: '45 min', mode: 'B' },
        { title: 'Taller de dudas', description: 'Resolución de cuestiones', duration: '30 min', mode: 'A' },
      ],
    },
    {
      number: 15,
      date: allDates[14],
      title: 'Proyecto Final - Presentaciones',
      subtitle: 'Demostrando maestría comunicativa',
      block: 3,
      blockTitle: 'Perfeccionamiento Comunicativo',
      objectives: [
        'Presentar proyecto final',
        'Demostrar competencia C1',
        'Defender posición argumentada',
        'Recibir feedback del grupo',
      ],
      timing: [
        { phase: 'Presentaciones', duration: '60 min', description: '5 min por estudiante' },
        { phase: 'Q&A general', duration: '20 min', description: 'Preguntas al grupo' },
        { phase: 'Feedback', duration: '15 min', description: 'Comentarios finales' },
        { phase: 'Cierre', duration: '10 min', description: 'Despedida del curso' },
      ],
      dynamics: [
        { title: 'Presentaciones finales', description: 'Proyectos individuales', duration: '90 min', mode: 'A' },
      ],
    },
  ]

  // Crear sesiones
  for (const sessionDef of sessionDefinitions) {
    // Usar contenido específico si existe, si no usar contenido genérico
    const grammarContent = (sessionDef as any).grammarContentFull || {
      title: 'Contenido gramatical de la sesión',
      topics: [
        { category: 'Categoría 1', examples: ['ejemplo 1', 'ejemplo 2'] },
      ],
    }
    const vocabularyContent = (sessionDef as any).vocabularyContentFull || {
      title: 'Vocabulario de la sesión',
      categories: [
        { topic: 'Tema 1', words: ['palabra1', 'palabra2'] },
      ],
    }
    const modeAContent = (sessionDef as any).modeAContentFull || {
      title: 'Enfoque Integrador (A)',
      description: 'Actividades colaborativas y espontáneas',
    }
    const modeBContent = (sessionDef as any).modeBContentFull || {
      title: 'Enfoque Analítico (B)',
      description: 'Ejercicios estructurados con apoyo visual',
    }

    const session = await prisma.session.upsert({
      where: { sessionNumber: sessionDef.number },
      update: {
        // Actualizar sesiones existentes con el nuevo contenido
        date: sessionDef.date,
        title: sessionDef.title,
        subtitle: sessionDef.subtitle,
        blockNumber: sessionDef.block,
        blockTitle: sessionDef.blockTitle,
        objectives: sessionDef.objectives,
        timing: sessionDef.timing,
        dynamics: sessionDef.dynamics,
        grammarContent,
        vocabularyContent,
        modeAContent,
        modeBContent,
      },
      create: {
        sessionNumber: sessionDef.number,
        date: sessionDef.date,
        title: sessionDef.title,
        subtitle: sessionDef.subtitle,
        blockNumber: sessionDef.block,
        blockTitle: sessionDef.blockTitle,
        isExamDay: false,
        objectives: sessionDef.objectives,
        timing: sessionDef.timing,
        dynamics: sessionDef.dynamics,
        grammarContent,
        vocabularyContent,
        modeAContent,
        modeBContent,
      },
    })
    sessions.push(session)
  }

  console.log(`✅ ${sessions.length} sessions created (Tue/Thu Feb 2 - May 14, 2026)`)

  // ============================================
  // 4. CREATE TASKS
  // ============================================
  console.log('📝 Creating/updating tasks...')

  // Eliminar tareas existentes para las sesiones que vamos a actualizar
  const sessionIds = sessions.map(s => s.id).filter(Boolean)
  await prisma.task.deleteMany({
    where: { sessionId: { in: sessionIds } },
  })

  // Crear tareas
  await prisma.task.createMany({
    data: [
      {
        sessionId: sessions[1]?.id, // Sesión 2: Cohesión y conectores
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
      {
        sessionId: sessions[4]?.id, // Sesión 5: Negociación
        title: 'Completar fórmulas de cortesía',
        description: 'Selecciona la fórmula más apropiada',
        type: 'MULTIPLE_CHOICE',
        content: {
          questions: [
            {
              question: '¿______ importaría que le haga una pregunta?',
              options: ['Te', 'Le', 'Os'],
              correct: 1,
            },
          ],
        },
        order: 1,
        isModeBOnly: true,
      },
      {
        sessionId: sessions[8]?.id, // Sesión 9: Precisión léxica
        title: 'Seleccionar término preciso',
        description: 'Elige el adjetivo más preciso',
        type: 'MULTIPLE_CHOICE',
        content: {
          questions: [
            {
              question: 'El impacto fue ______.',
              options: ['grande', 'considerable', 'bueno'],
              correct: 1,
            },
          ],
        },
        order: 1,
        isModeBOnly: true,
      },
    ],
  })

  console.log('✅ Tasks created')

  // Designated upload assignment per teaching session.
  for (const session of sessions) {
    await prisma.task.upsert({
      where: {
        id: `session-${session.sessionNumber}`,
      },
      update: {
        sessionId: session.id,
        title: `Entrega de archivos - Sesión ${session.sessionNumber}`,
        description: `Sube tu entrega para "${session.title}". El profesor revisará y enviará feedback.`,
        type: 'DOCUMENT_UPLOAD',
        content: {
          instructions: 'Sube tus evidencias de la sesión (audio, vídeo o documento). Máximo 10 archivos.',
          acceptedFileTypes: ['audio', 'video', 'document'],
          maxFiles: 10,
        },
        order: 900,
        isModeBOnly: false,
      },
      create: {
        id: `session-${session.sessionNumber}`,
        sessionId: session.id,
        title: `Entrega de archivos - Sesión ${session.sessionNumber}`,
        description: `Sube tu entrega para "${session.title}". El profesor revisará y enviará feedback.`,
        type: 'DOCUMENT_UPLOAD',
        content: {
          instructions: 'Sube tus evidencias de la sesión (audio, vídeo o documento). Máximo 10 archivos.',
          acceptedFileTypes: ['audio', 'video', 'document'],
          maxFiles: 10,
        },
        order: 900,
        isModeBOnly: false,
      },
    })
  }

  console.log(`✅ ${sessions.length} designated upload tasks ensured`)

  // ============================================
  // 5. CREATE CHECKLIST ITEMS
  // ============================================
  console.log('📝 Creating/updating checklist items...')

  // Eliminar checklist existentes para las sesiones que vamos a actualizar
  for (const session of sessions.slice(0, 5)) {
    await prisma.checklistItem.deleteMany({
      where: { sessionId: session.id },
    })
  }

  // Checklist específico para Sesión 2
  if (sessions[1]) {
    await prisma.checklistItem.createMany({
      data: [
        { sessionId: sessions[1].id, text: 'He usado conectores de contraste correctamente', order: 1 },
        { sessionId: sessions[1].id, text: 'He mantenido un registro coherente durante mi intervención', order: 2 },
        { sessionId: sessions[1].id, text: 'He reaccionado a las intervenciones de mis compañeros', order: 3 },
      ],
    })
  }

  // Checklist genérico para otras sesiones (excepto sesión 2)
  for (const session of sessions.slice(0, 5)) {
    if (session.sessionNumber === 2) continue // Ya tiene checklist específico
    await prisma.checklistItem.createMany({
      data: [
        { sessionId: session.id, text: 'He participado activamente en clase', order: 1 },
        { sessionId: session.id, text: 'He completado las tareas de la sesión', order: 2 },
        { sessionId: session.id, text: 'He revisado el vocabulario nuevo', order: 3 },
        { sessionId: session.id, text: 'He practicado los contenidos gramaticales', order: 4 },
      ],
    })
  }

  console.log('✅ Checklist items created')

  // ============================================
  // 6. CREATE RESOURCES
  // ============================================
  console.log('📝 Creating/updating resources...')

  // Eliminar recursos existentes para las sesiones que vamos a actualizar
  for (const session of sessions.slice(0, 8)) {
    await prisma.resource.deleteMany({
      where: { sessionId: session.id },
    })
  }

  // Recursos específicos para Sesión 2
  if (sessions[1]) {
    await prisma.resource.createMany({
      data: [
        {
          sessionId: sessions[1].id,
          title: 'Póster: conectores por función',
          type: 'PDF',
          url: '/resources/conectores-tabla.pdf',
          order: 1,
        },
        {
          sessionId: sessions[1].id,
          title: 'Vocabulario de la argumentación',
          type: 'PDF',
          url: '/resources/ejercicios-conectores.pdf',
          order: 2,
          description: 'Lista de verbos/adjetivos/expresiones útiles para argumentar (C1).',
        },
      ],
    })
  }

  // Recursos genéricos para otras sesiones (excepto sesión 2)
  for (const session of sessions.slice(0, 8)) {
    if (session.sessionNumber === 2) continue // Ya tiene recursos específicos
    await prisma.resource.createMany({
      data: [
        {
          sessionId: session.id,
          title: `Material de sesión ${session.sessionNumber}`,
          type: 'PDF',
          url: `/resources/session-${session.sessionNumber}.pdf`,
          order: 1,
        },
        {
          sessionId: session.id,
          title: 'Vocabulario de la sesión',
          type: 'PDF',
          url: `/resources/vocab-${session.sessionNumber}.pdf`,
          order: 2,
        },
      ],
    })
  }

  console.log('✅ Resources created')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log('  - Course: Feb 2 - May 21, 2026')
  console.log('  - Schedule: Tuesdays and Thursdays')
  console.log(`  - Users: 1 admin + ${students.length} test students (for development)`)
  console.log(`  - Sessions: ${sessions.length} (excludes exam days)`)
  console.log('  - Holidays excluded: Semana Santa, May 1')
  console.log('  - Exams: Mar 26 (partial), May 21 (final)')
  console.log('\n🔐 Login credentials:')
  console.log('  Admin: benitezl@go.ugr.es / admin123')
  console.log('  Test students: test.student1@ugr.es / estudiante123')
  console.log('\n📝 NOTE: In production, students will self-register')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
