# Guía de Contenido Pedagógico Completo

## 📚 Archivo de Referencia

El archivo `contenido-completo-con-ingles.bak` contiene el contenido pedagógico completo del curso con **25 secciones de**:
- ✅ **Gramática** (explicación, ejemplos, reglas, notas)
- ✅ **Vocabulario** (términos, definiciones, expresiones)
- ✅ **Tareas interactivas** (FILL_BLANKS, etc.)
- ✅ **Dinámicas detalladas** con instrucciones paso a paso
- ✅ **Materiales** para cada actividad

## ⚠️ Advertencia Importante

Este archivo contiene **traducciones al inglés** en los campos `examples` y `vocabularyContent` que crean problemas de sintaxis en TypeScript.

**NO copiar directamente** al código.

## 🎯 Estructura de una Sesión Completa

```typescript
{
  sessionNumber: 1,
  date: new Date('2026-02-03'),
  title: 'Título de la sesión',
  subtitle: 'Subtítulo descriptivo',
  blockNumber: 1,
  blockTitle: 'Nombre del Bloque',
  isExamDay: false,

  // Objetivos (5 recomendado)
  objectives: [
    { id: 'obj-1-1', text: 'Objetivo 1', isModeB: true },  // isModeB = específico para modo B
    { id: 'obj-1-2', text: 'Objetivo 2' },
    // ...
  ],

  // Timing de la clase
  timing: [
    { id: 't1-1', duration: '15 min', activity: 'Actividad', description: 'Descripción' },
    // ...
  ],

  // Dinámicas con instrucciones detalladas
  dynamics: [
    {
      id: 'd1-1',
      step: 1,
      title: 'Título de dinámica',
      instructions: [
        'Instrucción 1',
        'Instrucción 2',
        // ...
      ],
      groupType: 'whole_class', // 'individual' | 'pairs' | 'small_group' | 'whole_class'
      materials: ['Material 1', 'Material 2'],
      isModeB: false, // Solo para modo B
    },
    // ...
  ],

  // Contenido gramatical (SIN inglés en examples)
  grammarContent: {
    title: 'Título del tema',
    explanation: 'Explicación clara del tema gramatical',
    examples: [
      {
        spanish: 'Ejemplo en español',
        // NO incluir 'english' para evitar errores de sintaxis
      },
      // ...
    ],
    rules: [
      'Regla 1',
      'Regla 2',
      // ...
    ],
    notes: [
      'Nota cultural 1',
      'Nota de uso 1',
      // ...
    ],
  },

  // Contenido de vocabulario (SIN inglés)
  vocabularyContent: {
    title: 'Título del tema',
    items: [
      {
        term: 'Término',
        definition: 'Definición clara',
        example: 'Ejemplo de uso',
        category: 'gramática | vocabulario | expresiones',
      },
      // ...
    ],
    expressions: [
      {
        expression: 'Expresión idiomática',
        meaning: 'Significado',
        usage: 'Contexto de uso',
      },
      // ...
    ],
  },

  // Tareas interactivas
  tasks: [
    {
      id: 'task-1-1',
      title: 'Título de la tarea',
      description: 'Descripción breve',
      type: 'FILL_BLANKS', // 'MULTIPLE_CHOICE' | 'DRAG_DROP' | 'MATCHING' | 'ORDERING' | 'FREE_TEXT'
      content: {
        instructions: 'Instrucciones para el estudiante',
        items: [
          {
            id: 'q1',
            type: 'fill-blank',
            content: {
              sentence: 'Oración con __________ para completar',
              blank: 'respuesta esperada',
            },
          },
          // ...
        ],
        correctAnswers: {
          q1: ['respuesta1', 'sinónimo aceptable'],
          // ...
        },
        feedback: {
          correct: '¡Excelente! Feedback positivo',
          incorrect: 'Tip para mejorar',
        },
      },
      order: 1,
      isModeBOnly: false, // true = solo visible en modo B
    },
    // ...
  ],

  // Lista de verificación para estudiantes
  checklistItems: [
    { id: 'ck1-1', text: 'Actividad completada' },
    // ...
  ],

  // Recursos adicionales (PDFs, videos, etc.)
  resources: [
    {
      id: 'r1',
      title: 'Título del recurso',
      type: 'PDF', // 'AUDIO' | 'VIDEO' | 'LINK' | 'IMAGE'
      url: '/path/al/recurso.pdf',
      order: 1,
    },
    // ...
  ],
}
```

## 🔧 Cómo Añadir Contenido Nuevo

1. **Revisar el archivo de referencia** para ver qué contenido existe
2. **Extraer la estructura** sin copiar las partes con `english:`
3. **Adaptar al formato actual** en `src/data/sessions.ts`
4. **Probar localmente** antes de hacer commit

## ✅ Ejemplo de Adición Segura

```typescript
// Añadir vocabulario SIN inglés:
vocabularyContent: {
  title: 'Conectores argumentales',
  items: [
    {
      term: 'Para empezar',
      definition: 'Inicia un argumento',
      example: 'Para empezar, me gustaría destacar que...',
      category: 'conectores',
    },
    {
      term: 'Por otro lado',
      definition: 'Añade un punto de vista diferente',
      example: 'Por otro lado, debemos considerar...',
      category: 'conectores',
    },
  ],
}
```

## 📝 Contenido Actual vs Completo

| Componente | Actual | En Referencia |
|-----------|--------|--------------|
| Sesiones | 29 | 29 |
| Objetivos | Básicos | 5 por sesión |
| Timing | ✅ | ✅ |
| Dinámicas | Básicas | Detalladas con materiales |
| Gramática | ⚠️ Parcial | ✅ 25 secciones completas |
| Vocabulario | ⚠️ Parcial | ✅ 25 secciones completas |
| Tareas interactivas | ❌ | ✅ 25 tipos diferentes |

## 🚀 Próximos Pasos

1. Revisar el archivo de referencia por sesión
2. Identificar qué contenido quieres añadir
3. Crear nuevo contenido siguiendo la estructura
4. Añadir gradualmente sesión por sesión
5. Probar cada cambio antes de commit

## 📁 Ubicación de Archivos

- **Referencia completa**: `docs/referencia-pedagogica/contenido-completo-con-ingles.bak`
- **Versión actual (código)**: `src/data/sessions.ts`
- **Tipos de datos**: `src/types/index.ts`
