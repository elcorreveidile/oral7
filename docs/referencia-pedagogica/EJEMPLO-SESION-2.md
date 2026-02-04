# Ejemplo Práctico: Añadir Contenido a la Sesión 2

## Sesión 2 Actual

La sesión 2 actualmente tiene:
- ✅ Título: "Cohesión y conectores argumentales"
- ✅ Objetivos básicos (4)
- ✅ Timing (4 actividades)
- ✅ Una dinámica simple
- ⚠️ **Falta**: Gramática completa, vocabulario ampliado, tareas interactivas

## Contenido que Podemos Añadir

### 1. Expandir Gramática (Ya existe, podemos ampliar)

```typescript
grammarContent: {
  title: "Conectores argumentales C1",
  explanation: "Los conectores son esenciales para estructurar el discurso oral de manera coherente y persuasiva. En nivel C1 se espera dominio de conectores de adición, oposición, causa-efecto y conclusión.",
  examples: [
    {
      spanish: "Para empezar, me gustaría destacar que la educación es fundamental para el desarrollo de cualquier sociedad."
    },
    {
      spanish: "Por un lado, la tecnología facilita la comunicación; por otro lado, puede crear aislamiento social."
    },
    {
      spanish: "No obstante, debemos considerar el impacto ambiental de nuestras decisiones diarias."
    },
    {
      spanish: "En definitiva, la clave está en encontrar un equilibrio entre progreso y sostenibilidad."
    },
  ],
  rules: [
    "Para INICIAR: Para empezar, En primer lugar, Ante todo, En principio",
    "Para AÑADIR: Por otro lado, Asimismo, Además, Es más, Igualmente",
    "Para CONTRASTAR: No obstante, Sin embargo, Por el contrario, Ahora bien",
    "Para CONCLUIR: En definitiva, En suma, En resumen, Por último, Para concluir",
    "Para CAUSAR: Por lo tanto, Por consiguiente, Así pues, De ahí que",
  ],
  notes: [
    "En español oral, los conectores suelen ir acompañados de pausas y entonación descendente al final",
    "Evitar repetir el mismo conector en intervalos cortos",
    "Usar 'sin embargo' y 'no obstante' en contextos más formales",
    "El uso excesivo de 'entonces' como conector puede denotar poco vocabulario",
  ],
}
```

### 2. Ampliar Vocabulario

```typescript
vocabularyContent: {
  title: "Mapa conceptual de conectores argumentales",
  items: [
    {
      term: "Cohesión textual",
      definition: "Propiedad que permite que los elementos de un texto se relacionen correctamente",
      example: "El uso de conectores mejora la cohesión del discurso",
      category: "lingüística"
    },
    {
      term: "Registro formal",
      definition: "Nivel de lenguaje apropiado para situaciones académicas o profesionales",
      example: "En una conferencia se utiliza registro formal",
      category: "pragmática"
    },
    {
      term: "Argumento",
      definition: "Razón o prueba que se presenta para apoyar una opinión",
      example: "El cambio climático es un argumento a favor de energías renovables",
      category: "argumentación"
    },
    {
      term: "Contraargumento",
      definition: "Argumento que se opone a otro anteriormente presentado",
      example: "El costo puede ser un contraargumento a esa propuesta",
      category: "argumentación"
    },
    {
      term: "Matizar",
      definition: "Suavizar o precisar una afirmación con matices o excepciones",
      example: "Debo matizar mi posición: en algunos casos podría funcionar",
      category: "verbos"
    },
    {
      term: "Refutar",
      definition: "Rebatir un argumento demostrando su falsedad o debilidad",
      example: "Los datos refutan la teoría anterior",
      category: "argumentación"
    },
  ],
  expressions: [
    {
      expression: "Por un lado... por otro lado",
      meaning: "Presenta dos aspectos o perspectivas diferentes",
      usage: "Estructurar argumentación equilibrada"
    },
    {
      expression: "Sin ir más lejos",
      meaning: "Introduce un ejemplo cercano o inmediato",
      usage: "Dar ejemplos concretos"
    },
    {
      expression: "En cualquier caso",
      meaning: "Sea como fuere, independientemente",
      usage: "Concluir o matizar después de varios argumentos"
    },
    {
      expression: "Dicho de otro modo",
      meaning: "Expresar lo mismo con palabras diferentes",
      usage: "Reformular para clarificar"
    },
    {
      expression: "En última instancia",
      meaning: "Finalmente, considerando el resultado final",
      usage: "Presentar la consecuencia última"
    },
  ],
}
```

### 3. Añadir Tareas Interactivas

```typescript
tasks: [
  {
    id: "task-2-1",
    title: "Completa con el conector apropiado",
    description: "Práctica de conectores argumentales",
    type: "FILL_BLANKS",
    content: {
      instructions: "Selecciona el conector más apropiado para cada espacio",
      items: [
        {
          id: "q1",
          type: "fill-blank",
          content: {
            sentence: "__________ me gustaría destacar la importancia de este tema.",
            blank: "Para empezar|En primer lugar|Ante todo"
          }
        },
        {
          id: "q2",
          type: "fill-blank",
          content: {
            sentence: "La tecnología tiene ventajas; __________, presenta desafíos.",
            blank: "sin embargo|no obstante|por otro lado"
          }
        },
        {
          id: "q3",
          type: "fill-blank",
          content: {
            sentence: "__________, podemos concluir que se necesitan más investigaciones.",
            blank: "En definitiva|En suma|En resumen"
          }
        },
        {
          id: "q4",
          type: "fill-blank",
          content: {
            sentence: "Los datos son limitados; __________, debemos ser cautelosos.",
            blank: "por lo tanto|así pues|de ahí que"
          }
        },
      ],
      correctAnswers: {
        q1: ["Para empezar", "En primer lugar", "Ante todo"],
        q2: ["sin embargo", "no obstante", "por otro lado"],
        q3: ["En definitiva", "En suma", "En resumen"],
        q4: ["por lo tanto", "así pues", "de ahí que"],
      },
      feedback: {
        correct: "¡Excelente! Has seleccionado los conectores apropiados según la función discursiva.",
        incorrect: "Recuerda: para iniciar=Para empezar/En primer lugar; para contrastar=sin embargo/no obstante; para concluir=En definitiva/En suma; para causar=por lo tanto/así pues.",
      },
    },
    order: 1,
    isModeBOnly: false,
  },
  {
    id: "task-2-2",
    title: "Clasifica los conectores",
    description: "Agrupa los conectores por función",
    type: "MULTIPLE_CHOICE",
    content: {
      instructions: "¿Qué función tiene el conector 'Por otro lado'?",
      items: [
        {
          id: "q1",
          question: "¿Qué función tiene 'Por otro lado'?",
          options: [
            { id: "a", text: "Iniciar un argumento" },
            { id: "b", text: "Añadir una perspectiva diferente", isCorrect: true },
            { id: "c", text: "Concluir" },
            { id: "d", text: "Causar efecto" },
          ],
        },
        {
          id: "q2",
          question: "¿Qué función tiene 'En definitiva'?",
          options: [
            { id: "a", text: "Iniciar" },
            { id: "b", text: "Añadir" },
            { id: "c", text: "Concluir", isCorrect: true },
            { id: "d", text: "Contrastar" },
          ],
        },
      ],
      correctAnswers: { q1: "b", q2: "c" },
      feedback: {
        correct: "¡Correcto! Has identificado las funciones discursivas.",
        incorrect: "Revisa: 'Por otro lado' añade perspectiva; 'En definitiva' concluye.",
      },
    },
    order: 2,
    isModeBOnly: true, // Solo visible en Modo B
  },
]
```

### 4. Ampliar Dinámicas con Materiales

```typescript
dynamics: [
  {
    id: "d2-1",
    step: 1,
    title: "Debate: ¿Vale la pena vivir en Granada?",
    instructions: [
      "Forma grupos de 4 personas (2 a favor, 2 en contra)",
      "Tienen 15 minutos para preparar 3 argumentos sólidos",
      "Usa OBLIGATORIAMENTE conectores en cada intervención",
      "El grupo contrario toma nota de los conectores usados",
      "Debaten durante 15 minutos con moderador",
      "Cada grupo selecciona los mejores conectores usados por el oponente",
    ],
    groupType: "small_group",
    materials: [
      "Tarjetas con conectores por categoría",
      "Hoja de registro para anotar conectores del oponente",
      "Timer para controlar tiempos",
    ],
  },
  {
    id: "d2-2",
    step: 2,
    title: "Plantilla de Conectores (Modo B)",
    instructions: [
      "Completa la plantilla de argumentación estructurada",
      "Usa conectores diferentes en cada sección",
      "Compara tu plantilla con un compañero",
      "Discutan qué conectores funcionan mejor para cada propósito",
    ],
    groupType: "pairs",
    isModeB: true,
    materials: [
      "Plantilla de argumentación con secciones vacías",
      "Lista maestra de conectores organizados por función",
    ],
  },
]
```

## Proceso de Integración

1. **Hacer backup del archivo actual**:
   ```bash
   cp src/data/sessions.ts src/data/sessions.ts.backup
   ```

2. **Editar sesión 2** en `src/data/sessions.ts`

3. **Verificar que compile**:
   - El servidor debe mostrar HTTP 200
   - No debe haber errores en la consola

4. **Probar visualmente**:
   - Ir a http://localhost:3000/sesiones/2
   - Verificar que se muestre todo el contenido

5. **Hacer commit**:
   ```bash
   git add src/data/sessions.ts
   git commit -m "feat: Add complete content to session 2 (grammar, vocabulary, tasks)"
   ```

## Resultado Esperado

Después de añadir este contenido, la sesión 2 tendrá:
- ✅ Gramática completa (explicación + 4 ejemplos + 5 reglas + 4 notas)
- ✅ Vocabulario ampliado (6 términos + 5 expresiones)
- ✅ 2 tareas interactivas (FILL_BLANKS + MULTIPLE_CHOICE)
- ✅ Dinámicas con materiales específicos
- ✅ Contenido significativamente más rico para aprendizaje
