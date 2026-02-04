import { SessionData } from "@/types"

// Calendario Académico 2026 - Producción e Interacción Oral (Nivel 7)
// Centro de Lenguas Modernas - Universidad de Granada

export const sessionsData: Record<number, SessionData> = {
  // ============================================
  // FEBRERO - BLOQUE 1: La Argumentación Formal
  // ============================================

  1: {
    id: "session-1",
    sessionNumber: 1,
    date: "2026-02-03" as unknown as Date,
    title: "Presentación del curso y dinámicas de integración",
    subtitle: "Grupo Mixto - Conocernos y establecer las dinámicas",
    blockNumber: 1,
    blockTitle: "La Argumentación Formal",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Presentarse y conocer a los compañeros del grupo de manera extendida" },
      { id: "obj-2", text: "Comprender la metodología del curso y los criterios de evaluación" },
      { id: "obj-3", text: "Establecer las dinámicas de trabajo del grupo" },
      { id: "obj-4", text: "Realizar una primera evaluación diagnóstica del nivel oral" },
    ],
    timing: [
      { id: "t1", duration: "15 min", activity: "Bienvenida y presentación del curso", description: "Explicación de la metodología, objetivos y evaluación" },
      { id: "t2", duration: "25 min", activity: "Dinámica de presentación", description: "Entrevistas cruzadas y presentación al grupo" },
      { id: "t3", duration: "20 min", activity: "Expectativas y objetivos personales", description: "Cada estudiante comparte sus metas para el curso" },
      { id: "t4", duration: "20 min", activity: "Evaluación diagnóstica", description: "Breve interacción oral para evaluar nivel inicial" },
      { id: "t5", duration: "10 min", activity: "Cierre y próximos pasos", description: "Explicación de la tarea y la plataforma" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Rompehielos: Mi identidad en 3 palabras", instructions: ["Piensa en 3 palabras que te definan", "Compártelas explicando brevemente por qué"], groupType: "whole_class" },
      { id: "d2", step: 2, title: "Entrevista cruzada", instructions: ["Entrevista a un compañero durante 5 min", "Presenta a tu compañero ante el grupo"], groupType: "pairs" },
    ],
    checklistItems: [
      { id: "ck1", text: "Me he presentado ante el grupo" },
      { id: "ck2", text: "Conozco los nombres de mis compañeros" },
      { id: "ck3", text: "Entiendo la metodología del curso" },
      { id: "ck4", text: "He establecido mis objetivos personales" },
    ],
    resources: [],
  },

  2: {
    id: "session-2",
    sessionNumber: 2,
    date: "2026-02-05" as unknown as Date,
    title: "Cohesión y conectores argumentales",
    subtitle: "Estructura y cohesión del discurso",
    blockNumber: 1,
    blockTitle: "La Argumentación Formal",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Mejorar la cohesión del discurso mediante conectores" },
      { id: "obj-2", text: "Diferenciar registros (coloquial vs. formal) al argumentar" },
      { id: "obj-3", text: "Practicar la estructura básica de una opinión oral" },
    ],
    timing: [
      { id: "t1", duration: "10 min", activity: "Revisión y Feedback", description: "Escucha selectiva de 2-3 audios de la tarea de casa. Corrección rápida de errores." },
      { id: "t2", duration: "20 min", activity: "Teoría Visual: El esqueleto de la argumentación", description: "Visionado de un fragmento de debate (1 min). Análisis colectivo: ¿Cómo conecta el hablante sus ideas?" },
      { id: "t3", duration: "45 min", activity: "Taller: ¿Vale la pena vivir en Granada?", description: "División en grupos. 15 min preparación. 30 min debate Pro vs Con." },
      { id: "t4", duration: "15 min", activity: "Cierre", description: "Puesta en común de conectores más útiles. Anuncio del tema de la próxima clase." },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Debate: ¿Vale la pena vivir en Granada?", instructions: ["Usa conectores obligatoriamente", "Defiende tu postura Pro o Con"], groupType: "small_group" },
      { id: "d2", step: 2, title: "Plantilla de conectores", instructions: ["Rellena la estructura argumentativa", "Usa los conectores apropiados"], groupType: "individual", isModeB: true },
    ],
    grammarContent: {
      title: "Conectores argumentales C1",
      explanation: "Los conectores son esenciales para estructurar el discurso oral de manera coherente y persuasiva.",
      examples: [
        { spanish: "Para empezar, me gustaría destacar que...", english: "To begin with, I would like to highlight that..." },
        { spanish: "Por otro lado, hay que considerar...", english: "On the other hand, we must consider..." },
        { spanish: "No obstante, debemos tener en cuenta...", english: "Nevertheless, we must take into account..." },
        { spanish: "En definitiva, podemos concluir que...", english: "In short, we can conclude that..." },
      ],
      rules: [
        "Iniciar: Para empezar, En primer lugar, Ante todo",
        "Añadir: Por otro lado, Asimismo, Además, Es más",
        "Contrastar: No obstante, Por el contrario, Sin embargo, Ahora bien",
        "Concluir: En definitiva, En suma, En resumen, Por último",
      ],
    },
    vocabularyContent: {
      title: "Mapa mental de conectores",
      items: [
        { term: "Adición 🔵", definition: "Añadir información", example: "Además, Es más, Asimismo, Por otro lado", category: "conectores" },
        { term: "Oposición 🔴", definition: "Contrastar ideas", example: "Pero, Sin embargo, No obstante, Por el contrario", category: "conectores" },
        { term: "Conclusión 🟢", definition: "Cerrar el argumento", example: "En resumen, En definitiva, En suma, Por último", category: "conectores" },
      ],
    },
    checklistItems: [
      { id: "ck1", text: "He usado conectores de contraste correctamente" },
      { id: "ck2", text: "He mantenido un registro coherente durante mi intervención" },
      { id: "ck3", text: "He reaccionado a las intervenciones de mis compañeros" },
    ],
    resources: [
      { id: "r1", title: "Conectores argumentales C1", type: "PDF", url: "/resources/conectores-argumentales-c1.pdf", order: 1 },
      { id: "r2", title: "Artículo: El impacto de las redes sociales", type: "PDF", url: "/resources/articulo-redes-sociales.pdf", order: 2 },
    ],
  },

  3: {
    id: "session-3",
    sessionNumber: 3,
    date: "2026-02-10" as unknown as Date,
    title: "Expresar opiniones, actitudes y conocimientos",
    subtitle: "Comunicar ideas con claridad y matices",
    blockNumber: 1,
    blockTitle: "La Argumentación Formal",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Expresar opiniones con diferentes grados de certeza" },
      { id: "obj-2", text: "Manifestar actitudes y posturas ante temas diversos" },
      { id: "obj-3", text: "Comunicar conocimientos de manera estructurada" },
    ],
    timing: [
      { id: "t1", duration: "15 min", activity: "Repaso y feedback", description: "Revisión de conectores de la sesión anterior" },
      { id: "t2", duration: "25 min", activity: "Expresiones de opinión", description: "Grados de certeza: creo, opino, estoy convencido..." },
      { id: "t3", duration: "35 min", activity: "Práctica: Temas de actualidad", description: "Expresar opiniones sobre noticias recientes" },
      { id: "t4", duration: "15 min", activity: "Cierre", description: "Síntesis de expresiones aprendidas" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Tertulia: Opiniones sobre actualidad", instructions: ["Comenta una noticia reciente", "Expresa tu opinión con matices"], groupType: "whole_class" },
    ],
    checklistItems: [
      { id: "ck1", text: "He expresado opiniones con diferentes grados de certeza" },
      { id: "ck2", text: "He utilizado expresiones para manifestar actitudes" },
    ],
    resources: [],
  },

  4: {
    id: "session-4",
    sessionNumber: 4,
    date: "2026-02-12" as unknown as Date,
    title: "El registro formal",
    subtitle: "Adaptación al público y contexto",
    blockNumber: 1,
    blockTitle: "La Argumentación Formal",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Identificar las características del registro formal" },
      { id: "obj-2", text: "Adaptar el discurso según el público y el contexto" },
      { id: "obj-3", text: "Practicar la transición entre registros" },
    ],
    timing: [
      { id: "t1", duration: "20 min", activity: "Análisis de registros", description: "Comparar textos formales e informales" },
      { id: "t2", duration: "30 min", activity: "Características del registro formal", description: "Vocabulario, estructuras y tono" },
      { id: "t3", duration: "30 min", activity: "Práctica: Adaptar el mensaje", description: "Transformar mensajes informales a formales" },
      { id: "t4", duration: "10 min", activity: "Cierre", description: "Resumen de claves del registro formal" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Transformación de registros", instructions: ["Toma un mensaje coloquial", "Transfórmalo a registro formal"], groupType: "pairs" },
    ],
    checklistItems: [
      { id: "ck1", text: "Identifico las diferencias entre registro formal e informal" },
      { id: "ck2", text: "Puedo adaptar mi discurso al contexto" },
    ],
    resources: [],
  },

  5: {
    id: "session-5",
    sessionNumber: 5,
    date: "2026-02-17" as unknown as Date,
    title: "Acuerdo y desacuerdo",
    subtitle: "Expresiones rotundas, matizadas y suavizadas",
    blockNumber: 1,
    blockTitle: "La Argumentación Formal",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Expresar acuerdo y desacuerdo con diferentes intensidades" },
      { id: "obj-2", text: "Usar expresiones matizadas para suavizar el desacuerdo" },
      { id: "obj-3", text: "Mantener la cortesía en el debate" },
    ],
    timing: [
      { id: "t1", duration: "15 min", activity: "Introducción", description: "Escala de acuerdo/desacuerdo" },
      { id: "t2", duration: "25 min", activity: "Expresiones de acuerdo", description: "Desde total acuerdo hasta acuerdo parcial" },
      { id: "t3", duration: "25 min", activity: "Expresiones de desacuerdo", description: "Desacuerdo suave vs. rotundo" },
      { id: "t4", duration: "25 min", activity: "Práctica: Debate con cortesía", description: "Debatir manteniendo el respeto" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Debate cortés", instructions: ["Expresa desacuerdo sin ofender", "Usa expresiones suavizadas"], groupType: "small_group" },
    ],
    checklistItems: [
      { id: "ck1", text: "Sé expresar acuerdo con matices" },
      { id: "ck2", text: "Puedo mostrar desacuerdo de forma cortés" },
    ],
    resources: [],
  },

  6: {
    id: "session-6",
    sessionNumber: 6,
    date: "2026-02-19" as unknown as Date,
    title: "La contraargumentación",
    subtitle: "Razonamientos exhaustivos y defensa de ideas",
    blockNumber: 1,
    blockTitle: "La Argumentación Formal",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Construir contraargumentos sólidos" },
      { id: "obj-2", text: "Defender ideas ante objeciones" },
      { id: "obj-3", text: "Usar razonamientos exhaustivos" },
    ],
    timing: [
      { id: "t1", duration: "20 min", activity: "Estructura del contraargumento", description: "Reconocer, refutar, proponer" },
      { id: "t2", duration: "30 min", activity: "Técnicas de refutación", description: "Cuestionar datos, lógica, premisas" },
      { id: "t3", duration: "35 min", activity: "Práctica: Defensa de posiciones", description: "Debate con turnos de refutación" },
      { id: "t4", duration: "5 min", activity: "Cierre", description: "Resumen de estrategias" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Juicio simulado", instructions: ["Defiende o acusa una posición", "Usa contraargumentos efectivos"], groupType: "whole_class" },
    ],
    checklistItems: [
      { id: "ck1", text: "Puedo construir contraargumentos" },
      { id: "ck2", text: "Defiendo mis ideas ante objeciones" },
    ],
    resources: [],
  },

  7: {
    id: "session-7",
    sessionNumber: 7,
    date: "2026-02-24" as unknown as Date,
    title: "Reformulación, ejemplificación y recursos de énfasis",
    subtitle: "Clarificar y reforzar el mensaje",
    blockNumber: 1,
    blockTitle: "La Argumentación Formal",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Reformular ideas para mayor claridad" },
      { id: "obj-2", text: "Usar ejemplos efectivos para ilustrar argumentos" },
      { id: "obj-3", text: "Aplicar recursos de énfasis retórico" },
    ],
    timing: [
      { id: "t1", duration: "20 min", activity: "Técnicas de reformulación", description: "Es decir, o sea, en otras palabras..." },
      { id: "t2", duration: "25 min", activity: "El poder del ejemplo", description: "Ejemplos concretos, analogías, casos" },
      { id: "t3", duration: "25 min", activity: "Recursos de énfasis", description: "Repetición, preguntas retóricas, contrastes" },
      { id: "t4", duration: "20 min", activity: "Práctica integrada", description: "Discurso breve usando todas las técnicas" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Mini-discurso persuasivo", instructions: ["Elige un tema", "Usa reformulación, ejemplos y énfasis"], groupType: "individual" },
    ],
    checklistItems: [
      { id: "ck1", text: "Sé reformular mis ideas" },
      { id: "ck2", text: "Uso ejemplos para clarificar" },
      { id: "ck3", text: "Aplico recursos de énfasis" },
    ],
    resources: [],
  },

  8: {
    id: "session-8",
    sessionNumber: 8,
    date: "2026-02-26" as unknown as Date,
    title: "Práctica de Debate Formal",
    subtitle: "Tópicos de actualidad",
    blockNumber: 1,
    blockTitle: "La Argumentación Formal",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Integrar todas las técnicas de argumentación aprendidas" },
      { id: "obj-2", text: "Participar en un debate formal completo" },
      { id: "obj-3", text: "Recibir y dar feedback constructivo" },
    ],
    timing: [
      { id: "t1", duration: "10 min", activity: "Preparación", description: "Asignación de temas y posiciones" },
      { id: "t2", duration: "60 min", activity: "Debates formales", description: "Turnos de exposición, refutación y cierre" },
      { id: "t3", duration: "20 min", activity: "Feedback grupal", description: "Evaluación entre pares y autoevaluación" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Debate formal", instructions: ["Sigue el formato establecido", "Aplica todas las técnicas aprendidas"], groupType: "whole_class" },
    ],
    checklistItems: [
      { id: "ck1", text: "He participado activamente en el debate" },
      { id: "ck2", text: "He aplicado las técnicas de argumentación" },
      { id: "ck3", text: "He dado y recibido feedback" },
    ],
    resources: [],
  },

  // ============================================
  // MARZO - BLOQUE 1 (Cierre) & BLOQUE 2
  // ============================================

  9: {
    id: "session-9",
    sessionNumber: 9,
    date: "2026-03-03" as unknown as Date,
    title: "Análisis y feedback del debate",
    subtitle: "Errores comunes y mejoras",
    blockNumber: 2,
    blockTitle: "La Conferencia y la Entrevista",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Analizar los errores comunes del debate anterior" },
      { id: "obj-2", text: "Identificar áreas de mejora personal" },
      { id: "obj-3", text: "Establecer estrategias de corrección" },
    ],
    timing: [
      { id: "t1", duration: "30 min", activity: "Análisis de grabaciones", description: "Escuchar fragmentos y comentar" },
      { id: "t2", duration: "30 min", activity: "Errores comunes", description: "Catálogo de errores frecuentes" },
      { id: "t3", duration: "30 min", activity: "Plan de mejora", description: "Establecer objetivos personales" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Autoevaluación guiada", instructions: ["Escucha tu intervención", "Identifica puntos fuertes y débiles"], groupType: "individual" },
    ],
    checklistItems: [
      { id: "ck1", text: "He identificado mis errores principales" },
      { id: "ck2", text: "Tengo un plan de mejora" },
    ],
    resources: [],
  },

  10: {
    id: "session-10",
    sessionNumber: 10,
    date: "2026-03-05" as unknown as Date,
    title: "Narrar en el pasado",
    subtitle: "Relato de anécdotas e informaciones",
    blockNumber: 2,
    blockTitle: "La Conferencia y la Entrevista",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Narrar anécdotas con fluidez y detalle" },
      { id: "obj-2", text: "Usar correctamente los tiempos del pasado" },
      { id: "obj-3", text: "Estructurar el relato de manera atractiva" },
    ],
    timing: [
      { id: "t1", duration: "20 min", activity: "Repaso de tiempos pasados", description: "Indefinido, imperfecto, pluscuamperfecto" },
      { id: "t2", duration: "25 min", activity: "Estructura narrativa", description: "Inicio, desarrollo, desenlace" },
      { id: "t3", duration: "35 min", activity: "Contar anécdotas", description: "Práctica oral en grupos" },
      { id: "t4", duration: "10 min", activity: "Cierre", description: "Tips para narrar mejor" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "El mejor relato", instructions: ["Cuenta una anécdota personal", "Hazla interesante para el público"], groupType: "small_group" },
    ],
    checklistItems: [
      { id: "ck1", text: "Puedo narrar anécdotas con fluidez" },
      { id: "ck2", text: "Uso los tiempos pasados correctamente" },
    ],
    resources: [],
  },

  11: {
    id: "session-11",
    sessionNumber: 11,
    date: "2026-03-10" as unknown as Date,
    title: "Indicadores temporales precisos",
    subtitle: "Antes de, cuando, en cuanto...",
    blockNumber: 2,
    blockTitle: "La Conferencia y la Entrevista",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Usar indicadores temporales con precisión" },
      { id: "obj-2", text: "Secuenciar eventos correctamente" },
      { id: "obj-3", text: "Combinar indicadores con tiempos verbales" },
    ],
    timing: [
      { id: "t1", duration: "25 min", activity: "Indicadores temporales", description: "Antes de, después de, mientras, cuando, en cuanto..." },
      { id: "t2", duration: "30 min", activity: "Secuenciación", description: "Ordenar eventos cronológicamente" },
      { id: "t3", duration: "30 min", activity: "Práctica", description: "Relatar secuencias complejas" },
      { id: "t4", duration: "5 min", activity: "Cierre", description: "Resumen" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Mi día más loco", instructions: ["Narra un día lleno de eventos", "Usa indicadores temporales variados"], groupType: "pairs" },
    ],
    checklistItems: [
      { id: "ck1", text: "Uso indicadores temporales con precisión" },
      { id: "ck2", text: "Secuencio eventos correctamente" },
    ],
    resources: [],
  },

  12: {
    id: "session-12",
    sessionNumber: 12,
    date: "2026-03-12" as unknown as Date,
    title: "Relatar acontecimientos históricos",
    subtitle: "Narraciones complejas",
    blockNumber: 2,
    blockTitle: "La Conferencia y la Entrevista",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Narrar eventos históricos con precisión" },
      { id: "obj-2", text: "Usar vocabulario específico de la historia" },
      { id: "obj-3", text: "Mantener la coherencia en narraciones largas" },
    ],
    timing: [
      { id: "t1", duration: "20 min", activity: "Vocabulario histórico", description: "Términos y expresiones" },
      { id: "t2", duration: "30 min", activity: "Análisis de narraciones", description: "Modelos de relatos históricos" },
      { id: "t3", duration: "35 min", activity: "Práctica", description: "Relatar un evento histórico" },
      { id: "t4", duration: "5 min", activity: "Cierre", description: "Feedback" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Historiador por un día", instructions: ["Elige un evento histórico", "Nárralo como si lo hubieras vivido"], groupType: "individual" },
    ],
    checklistItems: [
      { id: "ck1", text: "Puedo narrar eventos históricos" },
      { id: "ck2", text: "Uso vocabulario histórico apropiado" },
    ],
    resources: [],
  },

  13: {
    id: "session-13",
    sessionNumber: 13,
    date: "2026-03-17" as unknown as Date,
    title: "La hipótesis (Presente y Futuro)",
    subtitle: "Si tuviera tiempo, me cogería...",
    blockNumber: 2,
    blockTitle: "La Conferencia y la Entrevista",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Formular hipótesis sobre el presente y futuro" },
      { id: "obj-2", text: "Usar correctamente el condicional e imperfecto de subjuntivo" },
      { id: "obj-3", text: "Expresar deseos y situaciones imaginarias" },
    ],
    timing: [
      { id: "t1", duration: "25 min", activity: "Estructura condicional", description: "Si + imperfecto subjuntivo + condicional" },
      { id: "t2", duration: "30 min", activity: "Práctica de hipótesis", description: "Situaciones imaginarias" },
      { id: "t3", duration: "30 min", activity: "Juego: ¿Qué harías si...?", description: "Preguntas y respuestas" },
      { id: "t4", duration: "5 min", activity: "Cierre", description: "Resumen" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "¿Qué harías si...?", instructions: ["Responde a situaciones hipotéticas", "Usa estructuras condicionales"], groupType: "whole_class" },
    ],
    checklistItems: [
      { id: "ck1", text: "Formulo hipótesis correctamente" },
      { id: "ck2", text: "Uso el condicional e imperfecto de subjuntivo" },
    ],
    resources: [],
  },

  14: {
    id: "session-14",
    sessionNumber: 14,
    date: "2026-03-19" as unknown as Date,
    title: "La hipótesis (Pasado)",
    subtitle: "Si hubiera tenido esa oportunidad, habría...",
    blockNumber: 2,
    blockTitle: "La Conferencia y la Entrevista",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Formular hipótesis sobre el pasado" },
      { id: "obj-2", text: "Usar correctamente el pluscuamperfecto de subjuntivo y condicional compuesto" },
      { id: "obj-3", text: "Expresar arrepentimientos y alternativas pasadas" },
    ],
    timing: [
      { id: "t1", duration: "25 min", activity: "Estructura condicional pasada", description: "Si + pluscuamperfecto subjuntivo + condicional compuesto" },
      { id: "t2", duration: "30 min", activity: "Práctica", description: "Situaciones del pasado que podrían haber sido diferentes" },
      { id: "t3", duration: "30 min", activity: "Debate: Decisiones históricas", description: "¿Qué habría pasado si...?" },
      { id: "t4", duration: "5 min", activity: "Cierre", description: "Resumen" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Reescribiendo la historia", instructions: ["Elige un momento histórico", "Imagina qué habría pasado si..."], groupType: "small_group" },
    ],
    checklistItems: [
      { id: "ck1", text: "Formulo hipótesis sobre el pasado" },
      { id: "ck2", text: "Uso las estructuras condicionales compuestas" },
    ],
    resources: [],
  },

  15: {
    id: "session-15",
    sessionNumber: 15,
    date: "2026-03-24" as unknown as Date,
    title: "Preparación para el parcial",
    subtitle: "Simulacros de interacción oral",
    blockNumber: 2,
    blockTitle: "La Conferencia y la Entrevista",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Repasar todos los contenidos del bloque 1 y 2" },
      { id: "obj-2", text: "Practicar con formato de examen" },
      { id: "obj-3", text: "Resolver dudas antes del parcial" },
    ],
    timing: [
      { id: "t1", duration: "20 min", activity: "Repaso general", description: "Contenidos clave del curso" },
      { id: "t2", duration: "50 min", activity: "Simulacros", description: "Práctica con formato de examen" },
      { id: "t3", duration: "20 min", activity: "Resolución de dudas", description: "Preguntas y aclaraciones" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Simulacro de examen", instructions: ["Realiza las tareas como en el examen real", "Recibe feedback inmediato"], groupType: "pairs" },
    ],
    checklistItems: [
      { id: "ck1", text: "He repasado los contenidos principales" },
      { id: "ck2", text: "Me siento preparado para el parcial" },
    ],
    resources: [],
  },

  16: {
    id: "session-16",
    sessionNumber: 16,
    date: "2026-03-26" as unknown as Date,
    title: "EXAMEN PARCIAL",
    subtitle: "Evaluación oral del Bloque 1 y 2",
    blockNumber: 2,
    blockTitle: "La Conferencia y la Entrevista",
    isExamDay: true,
    examType: "PARTIAL",
    objectives: [],
    timing: [],
    dynamics: [],
    checklistItems: [],
    resources: [],
  },

  // ============================================
  // ABRIL - BLOQUE 2 (Continuación)
  // ============================================

  17: {
    id: "session-17",
    sessionNumber: 17,
    date: "2026-04-07" as unknown as Date,
    title: "Bienvenida post-vacaciones",
    subtitle: "Puesta al día social y lingüística",
    blockNumber: 2,
    blockTitle: "La Conferencia y la Entrevista",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Compartir experiencias de Semana Santa" },
      { id: "obj-2", text: "Retomar el ritmo del curso" },
      { id: "obj-3", text: "Revisar resultados del parcial" },
    ],
    timing: [
      { id: "t1", duration: "30 min", activity: "Puesta al día", description: "Compartir experiencias de vacaciones" },
      { id: "t2", duration: "30 min", activity: "Feedback del parcial", description: "Comentarios generales y áreas de mejora" },
      { id: "t3", duration: "30 min", activity: "Introducción al nuevo bloque", description: "Presentación de próximos contenidos" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "¿Qué hiciste en Semana Santa?", instructions: ["Cuenta tu experiencia", "Usa tiempos pasados y conectores"], groupType: "whole_class" },
    ],
    checklistItems: [
      { id: "ck1", text: "He compartido mis experiencias" },
      { id: "ck2", text: "Entiendo el feedback del parcial" },
    ],
    resources: [],
  },

  18: {
    id: "session-18",
    sessionNumber: 18,
    date: "2026-04-09" as unknown as Date,
    title: "La entrevista",
    subtitle: "Estructura y tipos (Trabajo, expertos)",
    blockNumber: 2,
    blockTitle: "La Conferencia y la Entrevista",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Conocer la estructura de diferentes tipos de entrevista" },
      { id: "obj-2", text: "Preparar y realizar entrevistas de trabajo" },
      { id: "obj-3", text: "Entrevistar a expertos sobre temas específicos" },
    ],
    timing: [
      { id: "t1", duration: "20 min", activity: "Tipos de entrevista", description: "Trabajo, periodística, a expertos" },
      { id: "t2", duration: "25 min", activity: "Estructura", description: "Preparación, desarrollo, cierre" },
      { id: "t3", duration: "40 min", activity: "Práctica", description: "Simulación de entrevistas" },
      { id: "t4", duration: "5 min", activity: "Cierre", description: "Feedback" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Entrevista de trabajo", instructions: ["Uno es entrevistador, otro candidato", "Sigue la estructura formal"], groupType: "pairs" },
    ],
    checklistItems: [
      { id: "ck1", text: "Conozco la estructura de una entrevista" },
      { id: "ck2", text: "Puedo realizar una entrevista de trabajo" },
    ],
    resources: [],
  },

  19: {
    id: "session-19",
    sessionNumber: 19,
    date: "2026-04-14" as unknown as Date,
    title: "Estrategias de interacción",
    subtitle: "Preguntas abiertas y seguir el hilo",
    blockNumber: 2,
    blockTitle: "La Conferencia y la Entrevista",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Formular preguntas abiertas efectivas" },
      { id: "obj-2", text: "Mantener la conversación fluyendo naturalmente" },
      { id: "obj-3", text: "Seguir el hilo y profundizar en temas" },
    ],
    timing: [
      { id: "t1", duration: "20 min", activity: "Preguntas abiertas vs. cerradas", description: "Tipos y usos" },
      { id: "t2", duration: "25 min", activity: "Técnicas para seguir el hilo", description: "Reformular, pedir aclaraciones, profundizar" },
      { id: "t3", duration: "40 min", activity: "Práctica de conversación", description: "Mantener diálogos extensos" },
      { id: "t4", duration: "5 min", activity: "Cierre", description: "Resumen" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Conversación sin fin", instructions: ["Mantén la conversación el mayor tiempo posible", "Usa preguntas de seguimiento"], groupType: "pairs" },
    ],
    checklistItems: [
      { id: "ck1", text: "Formulo preguntas abiertas" },
      { id: "ck2", text: "Puedo mantener una conversación fluida" },
    ],
    resources: [],
  },

  20: {
    id: "session-20",
    sessionNumber: 20,
    date: "2026-04-16" as unknown as Date,
    title: "El estilo indirecto",
    subtitle: "Transmitir mensajes y opiniones de otros",
    blockNumber: 2,
    blockTitle: "La Conferencia y la Entrevista",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Dominar las transformaciones del estilo indirecto" },
      { id: "obj-2", text: "Transmitir mensajes de terceros con precisión" },
      { id: "obj-3", text: "Reportar opiniones manteniendo matices" },
    ],
    timing: [
      { id: "t1", duration: "25 min", activity: "Transformaciones", description: "Cambios de tiempo, persona, lugar" },
      { id: "t2", duration: "30 min", activity: "Verbos de habla", description: "Decir, afirmar, comentar, preguntar..." },
      { id: "t3", duration: "30 min", activity: "Práctica", description: "El teléfono estropeado" },
      { id: "t4", duration: "5 min", activity: "Cierre", description: "Resumen" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "El teléfono estropeado", instructions: ["Transmite un mensaje a través de varios compañeros", "Comprueba si llega igual"], groupType: "whole_class" },
    ],
    checklistItems: [
      { id: "ck1", text: "Domino el estilo indirecto" },
      { id: "ck2", text: "Transmito mensajes con precisión" },
    ],
    resources: [],
  },

  21: {
    id: "session-21",
    sessionNumber: 21,
    date: "2026-04-21" as unknown as Date,
    title: "Estrategias de influencia",
    subtitle: "Aconsejar, sugerir y advertir",
    blockNumber: 2,
    blockTitle: "La Conferencia y la Entrevista",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Dar consejos de manera efectiva" },
      { id: "obj-2", text: "Hacer sugerencias con diferentes grados de intensidad" },
      { id: "obj-3", text: "Advertir sobre riesgos y consecuencias" },
    ],
    timing: [
      { id: "t1", duration: "20 min", activity: "Expresiones para aconsejar", description: "Te recomiendo, deberías, yo que tú..." },
      { id: "t2", duration: "20 min", activity: "Expresiones para sugerir", description: "¿Por qué no...?, podrías, ¿y si...?" },
      { id: "t3", duration: "20 min", activity: "Expresiones para advertir", description: "Ten cuidado, cuidado con, ojo que..." },
      { id: "t4", duration: "30 min", activity: "Práctica: Consultorio", description: "Dar consejos a problemas reales" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Consultorio", instructions: ["Presenta un problema real o ficticio", "Recibe consejos de tus compañeros"], groupType: "whole_class" },
    ],
    checklistItems: [
      { id: "ck1", text: "Sé dar consejos apropiados" },
      { id: "ck2", text: "Puedo advertir de forma efectiva" },
    ],
    resources: [],
  },

  22: {
    id: "session-22",
    sessionNumber: 22,
    date: "2026-04-23" as unknown as Date,
    title: "Lenguaje persuasivo",
    subtitle: "Insistir en una petición y gestionar conflictos",
    blockNumber: 2,
    blockTitle: "La Conferencia y la Entrevista",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Insistir en peticiones de manera educada" },
      { id: "obj-2", text: "Gestionar conflictos verbalmente" },
      { id: "obj-3", text: "Usar lenguaje persuasivo sin ser agresivo" },
    ],
    timing: [
      { id: "t1", duration: "20 min", activity: "Técnicas de insistencia", description: "Repetir, reformular, apelar a emociones" },
      { id: "t2", duration: "25 min", activity: "Gestión de conflictos", description: "Escucha activa, buscar puntos en común" },
      { id: "t3", duration: "40 min", activity: "Role-play: Negociación", description: "Resolver un conflicto" },
      { id: "t4", duration: "5 min", activity: "Cierre", description: "Feedback" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Negociación difícil", instructions: ["Tienes un conflicto con tu compañero", "Resuélvelo mediante el diálogo"], groupType: "pairs" },
    ],
    checklistItems: [
      { id: "ck1", text: "Puedo insistir sin ser agresivo" },
      { id: "ck2", text: "Sé gestionar conflictos verbalmente" },
    ],
    resources: [],
  },

  23: {
    id: "session-23",
    sessionNumber: 23,
    date: "2026-04-28" as unknown as Date,
    title: "La Conferencia (I)",
    subtitle: "Apertura, captar atención y presentar la idea central",
    blockNumber: 2,
    blockTitle: "La Conferencia y la Entrevista",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Estructurar la apertura de una conferencia" },
      { id: "obj-2", text: "Captar la atención del público desde el inicio" },
      { id: "obj-3", text: "Presentar la idea central de manera clara" },
    ],
    timing: [
      { id: "t1", duration: "20 min", activity: "Estructura de una conferencia", description: "Apertura, desarrollo, cierre" },
      { id: "t2", duration: "25 min", activity: "Técnicas de apertura", description: "Pregunta, anécdota, dato impactante..." },
      { id: "t3", duration: "40 min", activity: "Práctica: Aperturas", description: "Crear y presentar aperturas" },
      { id: "t4", duration: "5 min", activity: "Cierre", description: "Feedback" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "El gancho perfecto", instructions: ["Crea una apertura que capte la atención", "Tienes 60 segundos"], groupType: "individual" },
    ],
    checklistItems: [
      { id: "ck1", text: "Sé estructurar una apertura efectiva" },
      { id: "ck2", text: "Puedo captar la atención del público" },
    ],
    resources: [],
  },

  24: {
    id: "session-24",
    sessionNumber: 24,
    date: "2026-04-30" as unknown as Date,
    title: "La Conferencia (II)",
    subtitle: "Desarrollo, énfasis en detalles y cierre efectivo",
    blockNumber: 2,
    blockTitle: "La Conferencia y la Entrevista",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Desarrollar el cuerpo de una conferencia" },
      { id: "obj-2", text: "Enfatizar detalles importantes" },
      { id: "obj-3", text: "Cerrar de manera memorable" },
    ],
    timing: [
      { id: "t1", duration: "20 min", activity: "Desarrollo de ideas", description: "Organización, transiciones, ejemplos" },
      { id: "t2", duration: "20 min", activity: "Técnicas de énfasis", description: "Repetición, pausas, variación de tono" },
      { id: "t3", duration: "20 min", activity: "El cierre efectivo", description: "Resumen, llamada a la acción, frase final" },
      { id: "t4", duration: "30 min", activity: "Mini-conferencias", description: "Presentaciones de 3 minutos" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Mini-conferencia", instructions: ["Presenta un tema en 3 minutos", "Aplica apertura, desarrollo y cierre"], groupType: "individual" },
    ],
    checklistItems: [
      { id: "ck1", text: "Puedo desarrollar una conferencia completa" },
      { id: "ck2", text: "Sé cerrar de manera efectiva" },
    ],
    resources: [],
  },

  // ============================================
  // MAYO - BLOQUE 3: Lengua Coloquial vs Formal
  // ============================================

  25: {
    id: "session-25",
    sessionNumber: 25,
    date: "2026-05-05" as unknown as Date,
    title: "Diferencias entre registro coloquial y formal",
    subtitle: "Análisis de situaciones",
    blockNumber: 3,
    blockTitle: "Lengua Coloquial vs Lengua Formal",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Identificar características del registro coloquial" },
      { id: "obj-2", text: "Comparar con el registro formal" },
      { id: "obj-3", text: "Adaptar el registro según la situación" },
    ],
    timing: [
      { id: "t1", duration: "25 min", activity: "Características del coloquial", description: "Vocabulario, estructuras, tono" },
      { id: "t2", duration: "25 min", activity: "Análisis comparativo", description: "Textos coloquiales vs. formales" },
      { id: "t3", duration: "35 min", activity: "Práctica: Cambio de registro", description: "Adaptar mensajes" },
      { id: "t4", duration: "5 min", activity: "Cierre", description: "Resumen" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Del bar a la oficina", instructions: ["Transforma una conversación coloquial en formal", "Y viceversa"], groupType: "pairs" },
    ],
    checklistItems: [
      { id: "ck1", text: "Identifico los registros coloquial y formal" },
      { id: "ck2", text: "Puedo cambiar de registro según el contexto" },
    ],
    resources: [],
  },

  26: {
    id: "session-26",
    sessionNumber: 26,
    date: "2026-05-07" as unknown as Date,
    title: "Los tacos",
    subtitle: "Pragmática del lenguaje vulgar y su uso social",
    blockNumber: 3,
    blockTitle: "Lengua Coloquial vs Lengua Formal",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Entender el uso pragmático de los tacos en español" },
      { id: "obj-2", text: "Conocer el contexto social de su uso" },
      { id: "obj-3", text: "Análisis intercultural del lenguaje vulgar" },
    ],
    timing: [
      { id: "t1", duration: "25 min", activity: "Los tacos en español", description: "Funciones pragmáticas" },
      { id: "t2", duration: "25 min", activity: "Análisis intercultural", description: "Comparación con otras culturas" },
      { id: "t3", duration: "30 min", activity: "Debate: ¿Cuándo es apropiado?", description: "Contextos y límites" },
      { id: "t4", duration: "10 min", activity: "Cierre", description: "Reflexión cultural" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Análisis cultural", instructions: ["Compara el uso de tacos en España con tu país", "Discute las diferencias"], groupType: "small_group" },
    ],
    checklistItems: [
      { id: "ck1", text: "Entiendo el uso pragmático de los tacos" },
      { id: "ck2", text: "Conozco los contextos apropiados" },
    ],
    resources: [],
  },

  27: {
    id: "session-27",
    sessionNumber: 27,
    date: "2026-05-12" as unknown as Date,
    title: "Vocabulario abstracto",
    subtitle: "Expresar sentimientos e intereses con precisión",
    blockNumber: 3,
    blockTitle: "Lengua Coloquial vs Lengua Formal",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Ampliar el vocabulario para expresar sentimientos" },
      { id: "obj-2", text: "Describir intereses y pasiones con precisión" },
      { id: "obj-3", text: "Usar vocabulario abstracto con naturalidad" },
    ],
    timing: [
      { id: "t1", duration: "25 min", activity: "Vocabulario de sentimientos", description: "Más allá de feliz/triste" },
      { id: "t2", duration: "25 min", activity: "Vocabulario de intereses", description: "Aficiones, pasiones, motivaciones" },
      { id: "t3", duration: "35 min", activity: "Práctica: Mi mundo interior", description: "Describir sentimientos e intereses" },
      { id: "t4", duration: "5 min", activity: "Cierre", description: "Resumen" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Mi mapa emocional", instructions: ["Describe tus sentimientos e intereses", "Usa vocabulario preciso y variado"], groupType: "individual" },
    ],
    checklistItems: [
      { id: "ck1", text: "Tengo vocabulario variado para sentimientos" },
      { id: "ck2", text: "Puedo expresar intereses con precisión" },
    ],
    resources: [],
  },

  28: {
    id: "session-28",
    sessionNumber: 28,
    date: "2026-05-14" as unknown as Date,
    title: "Última clase",
    subtitle: "Presentaciones finales de proyectos y despedida",
    blockNumber: 3,
    blockTitle: "Lengua Coloquial vs Lengua Formal",
    isExamDay: false,
    objectives: [
      { id: "obj-1", text: "Presentar el proyecto final" },
      { id: "obj-2", text: "Demostrar las competencias adquiridas" },
      { id: "obj-3", text: "Reflexionar sobre el aprendizaje del curso" },
    ],
    timing: [
      { id: "t1", duration: "60 min", activity: "Presentaciones finales", description: "Proyectos individuales o grupales" },
      { id: "t2", duration: "20 min", activity: "Feedback y evaluación", description: "Comentarios del profesor y compañeros" },
      { id: "t3", duration: "10 min", activity: "Despedida", description: "Reflexión final y cierre del curso" },
    ],
    dynamics: [
      { id: "d1", step: 1, title: "Presentación final", instructions: ["Presenta tu proyecto de 5-7 minutos", "Demuestra lo aprendido en el curso"], groupType: "individual" },
    ],
    checklistItems: [
      { id: "ck1", text: "He presentado mi proyecto final" },
      { id: "ck2", text: "He recibido feedback" },
      { id: "ck3", text: "He reflexionado sobre mi aprendizaje" },
    ],
    resources: [],
  },

  29: {
    id: "session-29",
    sessionNumber: 29,
    date: "2026-05-21" as unknown as Date,
    title: "EXAMEN FINAL",
    subtitle: "Evaluación oral del curso completo",
    blockNumber: 3,
    blockTitle: "Lengua Coloquial vs Lengua Formal",
    isExamDay: true,
    examType: "FINAL",
    objectives: [],
    timing: [],
    dynamics: [],
    checklistItems: [],
    resources: [],
  },
}

export function getSessionData(sessionNumber: number): SessionData | null {
  return sessionsData[sessionNumber] || null
}

export function getAllSessions(): SessionData[] {
  return Object.values(sessionsData)
}
