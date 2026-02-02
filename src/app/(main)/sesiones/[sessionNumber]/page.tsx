"use client"

import { notFound } from "next/navigation"
import { SessionMiniweb } from "@/components/miniweb/session-miniweb"
import { SessionData } from "@/types"

// Demo session data - in production this would come from API/database
// Using ISO strings to avoid hydration issues
const demoSessionData: SessionData = {
  id: "session-1",
  sessionNumber: 1,
  date: "2026-02-03" as unknown as Date,
  title: "Toma de contacto e interacción social",
  subtitle: "Conocernos y establecer las dinámicas del curso",
  blockNumber: 1,
  blockTitle: "La argumentación formal",
  isExamDay: false,
  objectives: [
    { id: "obj-1", text: "Presentarse y conocer a los compañeros del grupo de manera extendida" },
    { id: "obj-2", text: "Comprender las diferencias culturales en la socialización entre países" },
    { id: "obj-3", text: "Practicar el uso apropiado del tuteo y el ustedeo según el contexto" },
    { id: "obj-4", text: "Familiarizarse con el vocabulario de los bares y la interacción social en España", isModeB: true },
  ],
  timing: [
    { id: "t1", duration: "10 min", activity: "Bienvenida y presentación del curso", description: "Explicación de la metodología y los objetivos generales" },
    { id: "t2", duration: "20 min", activity: "Dinámica de presentación en parejas", description: "Conocer a un compañero y presentarlo al grupo" },
    { id: "t3", duration: "15 min", activity: "Socializar en España vs. otros países", description: "Debate sobre diferencias culturales" },
    { id: "t4", duration: "20 min", activity: "El bar como lugar de encuentro", description: "Vocabulario y expresiones" },
    { id: "t5", duration: "15 min", activity: "Práctica: situaciones en el bar", description: "Role-play y simulaciones" },
    { id: "t6", duration: "10 min", activity: "Cierre y autoevaluación", description: "Reflexión sobre lo aprendido" },
  ],
  dynamics: [
    {
      id: "d1",
      step: 1,
      title: "Rompehielos: Mi identidad en 3 palabras",
      instructions: [
        "Piensa en 3 palabras que te definan como persona",
        "Escríbelas en un papel o en tu dispositivo",
        "Compártelas con la clase explicando brevemente por qué las elegiste",
      ],
      groupType: "whole_class",
    },
    {
      id: "d2",
      step: 2,
      title: "Entrevista cruzada",
      instructions: [
        "Forma pareja con alguien que no conozcas",
        "Entrevístalo durante 5 minutos preguntando: origen, estudios, hobbies, experiencia con el español",
        "Después, presenta a tu compañero/a ante el grupo (2 minutos)",
      ],
      groupType: "pairs",
      materials: ["Papel para notas"],
    },
    {
      id: "d3",
      step: 3,
      title: "Debate: Socialización cultural",
      instructions: [
        "En grupos de 4, discutid las diferencias entre socializar en España y en vuestros países",
        "Considerad: lugares de encuentro, horarios, costumbres, temas de conversación",
        "Preparad 3 conclusiones para compartir con la clase",
      ],
      groupType: "small_group",
    },
    {
      id: "d4",
      step: 4,
      title: "Análisis estructural del debate",
      instructions: [
        "Identifica los conectores usados en el debate",
        "Clasifícalos según su función: introducir, añadir, contrastar, concluir",
        "Practica usando los conectores en frases propias",
      ],
      groupType: "individual",
      isModeB: true,
    },
  ],
  grammarContent: {
    title: "Tuteo y ustedeo: uso y contextos",
    explanation: "En español, la elección entre tú y usted depende del contexto social, la edad de los interlocutores y el grado de formalidad de la situación. España tiende a ser más informal que Latinoamérica en general.",
    examples: [
      { spanish: "¿Tú qué opinas sobre esto?", english: "What do you think about this? (informal)" },
      { spanish: "¿Usted podría ayudarme, por favor?", english: "Could you help me, please? (formal)" },
      { spanish: "Perdona, ¿tienes hora?", english: "Excuse me, do you have the time? (informal)" },
      { spanish: "Disculpe, ¿tiene hora?", english: "Excuse me, do you have the time? (formal)" },
    ],
    rules: [
      "Usar TÚ con: amigos, compañeros de clase, personas de edad similar, en contextos informales",
      "Usar USTED con: desconocidos mayores, en situaciones formales, mostrando respeto",
      "En España, el tuteo es común incluso con desconocidos de edad similar",
      "En Latinoamérica, el ustedeo es más frecuente en contextos sociales",
    ],
    notes: [
      "Algunos hablantes prefieren que les tuteen aunque sean mayores",
      "En el trabajo, depende de la cultura empresarial",
    ],
  },
  vocabularyContent: {
    title: "Vocabulario del bar y la socialización",
    items: [
      { term: "Quedar con alguien", definition: "Acordar encontrarse con una persona", example: "¿Quedamos a las ocho en el bar de siempre?", category: "expresiones" },
      { term: "Tomar algo", definition: "Beber una bebida, generalmente en un bar", example: "¿Vamos a tomar algo después de clase?", category: "expresiones" },
      { term: "Poner una ronda", definition: "Invitar a bebidas a todo el grupo", example: "Esta ronda la pongo yo", category: "bar" },
      { term: "Ir de cañas", definition: "Salir a beber cervezas pequeñas, generalmente visitando varios bares", example: "Los viernes siempre vamos de cañas", category: "bar" },
      { term: "La cuenta", definition: "El total a pagar en un bar o restaurante", example: "Cuando quieras, la cuenta por favor", category: "bar" },
      { term: "Propina", definition: "Dinero extra que se deja voluntariamente", example: "En España la propina no es obligatoria", category: "bar" },
    ],
    expressions: [
      { expression: "¿Qué te pongo?", meaning: "¿Qué quieres beber/comer? (pregunta del camarero)", usage: "Informal, muy común en bares" },
      { expression: "Ponme una caña", meaning: "Sírveme una cerveza pequeña", usage: "Para pedir al camarero" },
      { expression: "¿Nos sentamos o en la barra?", meaning: "Preguntar si se quiere mesa o quedarse de pie en la barra", usage: "Al entrar en un bar" },
      { expression: "Va invitado/Esta la pago yo", meaning: "Ofrecer pagar la consumición de alguien", usage: "Gesto de generosidad social" },
    ],
  },
  tasks: [
    {
      id: "task-1",
      title: "Elige el registro adecuado",
      description: "Selecciona si usarías TÚ o USTED en cada situación",
      type: "MULTIPLE_CHOICE",
      content: {
        instructions: "Lee cada situación y elige el tratamiento más apropiado en España.",
        items: [
          {
            id: "q1",
            type: "question",
            content: { question: "Pides información en una tienda a una dependienta de tu edad" },
            options: [
              { id: "a", type: "option", text: "Tú (tuteo)" },
              { id: "b", type: "option", text: "Usted (ustedeo)" },
            ],
          },
          {
            id: "q2",
            type: "question",
            content: { question: "Hablas con un profesor de universidad en su despacho" },
            options: [
              { id: "a", type: "option", text: "Tú (tuteo)" },
              { id: "b", type: "option", text: "Usted (ustedeo)" },
            ],
          },
          {
            id: "q3",
            type: "question",
            content: { question: "Conoces a un amigo de un amigo en una fiesta" },
            options: [
              { id: "a", type: "option", text: "Tú (tuteo)" },
              { id: "b", type: "option", text: "Usted (ustedeo)" },
            ],
          },
        ],
        correctAnswers: { q1: "a", q2: "b", q3: "a" },
        feedback: {
          correct: "¡Excelente! Has identificado correctamente los registros.",
          incorrect: "Revisa los contextos. En España, el tuteo es muy común en situaciones informales y con personas de edad similar.",
        },
      },
      order: 1,
      isModeBOnly: false,
    },
  ],
  checklistItems: [
    { id: "ck1", text: "Puedo presentarme de manera extendida ante un grupo" },
    { id: "ck2", text: "Sé cuándo usar tú y cuándo usar usted en España" },
    { id: "ck3", text: "Conozco vocabulario básico para interactuar en un bar" },
    { id: "ck4", text: "Entiendo las diferencias culturales en la socialización" },
    { id: "ck5", text: "Puedo pedir y pagar en un bar usando expresiones naturales" },
  ],
  resources: [
    { id: "r1", title: "Vocabulario del bar - PDF", type: "PDF", url: "/resources/vocabulario-bar.pdf", order: 1 },
    { id: "r2", title: "Audio: Conversaciones en el bar", type: "AUDIO", url: "/resources/conversaciones-bar.mp3", order: 2 },
  ],
}

// Exam day data - using ISO string to avoid hydration issues
const examPartialData: SessionData = {
  id: "exam-partial",
  sessionNumber: 15,
  date: "2026-03-26" as unknown as Date,
  title: "Día de evaluación oral - Examen parcial",
  blockNumber: 2,
  blockTitle: "La conferencia y la entrevista",
  isExamDay: true,
  examType: "PARTIAL",
  objectives: [],
  timing: [],
  dynamics: [],
}

interface PageProps {
  params: { sessionNumber: string }
}

export default function SessionPage({ params }: PageProps) {
  const sessionNum = parseInt(params.sessionNumber)

  // In production, fetch session data from API
  let sessionData: SessionData | null = null

  if (sessionNum === 1) {
    sessionData = demoSessionData
  } else if (sessionNum === 15) {
    sessionData = examPartialData
  } else {
    // Generate placeholder data for other sessions - using ISO string to avoid hydration issues
    const month = sessionNum <= 7 ? "02" : "03"
    const day = 3 + (sessionNum - 1) * 2
    sessionData = {
      ...demoSessionData,
      id: `session-${sessionNum}`,
      sessionNumber: sessionNum,
      title: `Sesión ${sessionNum} - Contenido en desarrollo`,
      date: `2026-${month}-${day.toString().padStart(2, '0')}` as unknown as Date,
      objectives: [
        { id: "obj-1", text: "Objetivo de ejemplo para esta sesión" },
      ],
    }
  }

  if (!sessionData) {
    notFound()
  }

  return <SessionMiniweb session={sessionData} />
}
