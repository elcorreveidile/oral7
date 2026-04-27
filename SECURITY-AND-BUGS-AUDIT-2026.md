# 🔒 Auditoría de Seguridad y Bugs - PIO-7
**Fecha:** 28 de Abril 2026
**Auditor:** Agente de Seguridad Especialista (Claude Sonnet 4.6)
**Alcance:** Seguridad completa, bugs funcionales y análisis de vulnerabilidades
**URL:** https://oral7.vercel.app

---

## 📊 Resumen Ejecutivo

Se ha realizado una auditoría completa de seguridad y análisis funcional de la plataforma PIO-7. **En general, la aplicación tiene buenas prácticas de seguridad** con mejoras significativas respecto a auditorías anteriores, pero se identificaron **23 vulnerabilidades y bugs** que requieren atención.

### Distribución por Severidad

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| 🚨 CRÍTICA | 4 | Requieren acción inmediata |
| ⚠️ ALTA | 9 | Corregir en 1 semana |
| 📋 MEDIA | 6 | Corregir en 2 semanas |
| ℹ️ BAJA | 4 | Corregir cuando sea posible |

---

## 🚨 VULNERABILIDADES CRÍTICAS

### 1. **Vulnerabilidad de Timing Attack en Comparación de Contraseñas**
- **Archivo:** `src/app/(auth)/reset-password/page.tsx:50`
- **Severidad:** 🚨 CRÍTICA
- **CWE:** CWE-203 (Observable Discrepancy)
- **Impacto:** Un atacante puede determinar si una contraseña es correcta midiendo el tiempo de respuesta
- **Línea de código:**
  ```typescript
  if (password !== confirmPassword) {  // ⚠️ VULNERABLE
  ```
- **Recomendación:**
  ```typescript
  import { timingSafeEqual } from 'crypto'
  // Usar comparación constante en tiempo
  ```
- **Explotabilidad:** Media - Requiere acceso local y herramientas de medición de tiempo

### 2. **API de Votación No Valida IDs de Temas**
- **Archivo:** `src/app/api/debates/vote/route.ts:44-54`
- **Severidad:** 🚨 CRÍTICA
- **CWE:** CWE-20 (Improper Input Validation)
- **Impacto:** Manipulación de votos, inyección de temas inválidos, posible contaminación de base de datos
- **Problema:**
  ```typescript
  // NO valida si topicId existe
  prisma.debateVote.create({
    data: {
      userId: session.user.id,
      topicId: vote.topicId,  // ⚠️ NO VALIDADO
      rank: vote.rank
    }
  })
  ```
- **Ataque:**
  ```json
  POST /api/debates/vote
  {
    "votes": [
      {"topicId": "invalid-id-123", "rank": 1},
      {"topicId": "another-fake", "rank": 2},
      {"topicId": "sql-injection-attempt", "rank": 3},
      {"topicId": "uuid-valid-but-wrong-topic", "rank": 4}
    ]
  }
  ```
- **Recomendación:**
  ```typescript
  // Validar que todos los topicIds existen
  const validTopicIds = (await prisma.debateTopic.findMany({
    where: { isActive: true },
    select: { id: true }
  })).map(t => t.id)

  const invalidTopics = votes.filter(v => !validTopicIds.includes(v.topicId))
  if (invalidTopics.length > 0) {
    return NextResponse.json(
      { error: 'One or more topic IDs are invalid' },
      { status: 400 }
    )
  }
  ```
- **Explotabilidad:** Alta - Fácil de explotar con herramientas de desarrollo

### 3. **Permitido Re-Votar Infinitamente en Sistema de Debates**
- **Archivo:** `src/app/api/debates/vote/route.ts:39-42`
- **Severidad:** 🚨 CRÍTICA
- **CWE:** CWE-602 (Client-Side Enforcement of Server-Side Security)
- **Impacto:** Un usuario puede cambiar su voto infinitamente para manipular resultados
- **Problema:**
  ```typescript
  // Elimina votos anteriores sin restricción de tiempo/frecuencia
  await prisma.debateVote.deleteMany({
    where: { userId: session.user.id }
  });
  ```
- **Ataque:**
  1. Usuario vota por Tema A
  2. Usuario espera y ve que Tema A va ganando
  3. Usuario cambia voto a Tema B para influenciar resultado
  4. Repetir infinitamente
- **Recomendación:**
  ```typescript
  // Verificar si ya votó recientemente
  const existingVote = await prisma.debateVote.findFirst({
    where: { userId: session.user.id }
  })

  const VOTE_LOCK_HOURS = 24  // No puede cambiar voto tras 24h
  if (existingVote) {
    const hoursSinceVote = (Date.now() - existingVote.createdAt.getTime()) / (1000 * 60 * 60)
    if (hoursSinceVote < VOTE_LOCK_HOURS) {
      return NextResponse.json({
        error: `Ya has votado. Puedes cambiar tu voto hasta ${VOTE_LOCK_HOURS} horas después de tu primer voto.`,
        canChangeVote: false,
        hoursRemaining: Math.ceil(VOTE_LOCK_HOURS - hoursSinceVote)
      }, { status: 400 })
    }
  }
  ```
- **Explotabilidad:** Alta - Cualquier usuario autenticado puede explotarlo

### 4. **Falta Validación de Schema en Varios Endpoints de API**
- **Archivos:**
  - `src/app/api/debates/vote/route.ts`
  - `src/app/api/debates/results/route.ts`
  - `src/app/api/contact/route.ts`
- **Severidad:** 🚨 CRÍTICA
- **CWE:** CWE-20 (Improper Input Validation)
- **Impacto:** Comportamiento indefinido, posibles crashes, inyección de datos maliciosos
- **Problema:** Algunos endpoints no usan Zod para validación
- **Recomendación:**
  ```typescript
  // Añadir schema de validación en /lib/validations.ts
  export const voteSchema = z.object({
    votes: z.array(z.object({
      topicId: z.string().uuid("Invalid topic ID format"),
      rank: z.number().int().min(1).max(4)
    })).length(4, "Exactly 4 votes required")
  })

  // Usar en el endpoint
  const validation = validateRequest(voteSchema, body)
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }
  ```
- **Explotabilidad:** Media - Requiere encontrar endpoints sin validación

---

## ⚠️ VULNERABILIDADES DE ALTA PRIORIDAD

### 5. **Exposición de Privacidad en Resultados de Votación (Modo Detallado)**
- **Archivo:** `src/app/api/debates/results/route.ts:19, 53`
- **Severidad:** ⚠️ ALTA
- **CWE:** CWE-200 (Exposure of Sensitive Information)
- **Impacto:** Estudiantes pueden ver quién votó qué tema (violación de privacidad)
- **Problema:**
  ```typescript
  const detailed = searchParams.get('detailed') === 'true';
  // ...
  votes: detailed ? topic.votes : undefined  // Expone user.name
  ```
- **Recomendación:**
  ```typescript
  // Solo admin puede ver detalles
  if (detailed && session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized for detailed results' },
      { status: 403 }
    )
  }
  ```
- **Explotabilidad:** Baja - Requiere estar autenticado

### 6. **Comparación de Arrays con JSON.stringify (Ineficiente y Frágil)**
- **Archivo:** `src/app/api/debates/vote/route.ts:32`
- **Severidad:** ⚠️ ALTA
- **CWE:** CWE-597 (Use of Wrong Operator)
- **Impacto:** Comparación puede fallar por ordenamiento de espacios, bugs sutiles
- **Código:**
  ```typescript
  if (JSON.stringify(ranks) !== JSON.stringify(validRanks)) {
  ```
- **Recomendación:**
  ```typescript
  const ranksCorrect = ranks.every((rank, idx) => rank === validRanks[idx])
  if (!ranksCorrect) {
  ```
- **Explotabilidad:** Baja - Caso edge, baja probabilidad

### 7. **Posible Enumeración de Usuarios en Endpoint de Resultados**
- **Archivo:** `src/app/api/debates/results/route.ts:63-66`
- **Severidad:** ⚠️ ALTA
- **CWE:** CWE-204 (Observable Response Discrepancy)
- **Impacto:** Se puede conocer el número total de votantes únicos
- **Problema:**
  ```typescript
  totalVoters: await prisma.debateVote.groupBy({
    by: ['userId'],
  }).then(groups => groups.length)
  ```
- **Recomendación:** Redondear a rangos o cachear por períodos
  ```typescript
  // No mostrar número exacto en tiempo real
  totalVoters: Math.floor(groups.length / 10) * 10  // Redondear a décimas
  ```
- **Explotabilidad:** Baja - Información no muy sensible

### 8. **Falta Protección CSRF en Endpoints State-Changing**
- **Archivos:** Todos los endpoints POST/PUT/DELETE
- **Severidad:** ⚠️ ALTA
- **CWE:** CWE-352 (Cross-Site Request Forgery)
- **Impacto:** Un atacante puede hacer acciones en nombre del usuario sin su consentimiento
- **Recomendación:** Implementar tokens CSRF para operaciones críticas
  ```typescript
  import { getCsrfToken } from 'next-auth/react'
  // Incluir en todas las operaciones state-changing
  ```
- **Explotabilidad:** Media - Requiere ingeniería social

### 9. **Object Injection en Componentes React (Warnings de ESLint)**
- **Archivos:**
  - `src/components/miniweb/task-interactive.tsx`
  - `src/lib/submission-storage.ts`
- **Severidad:** ⚠️ ALTA
- **CWE:** CWE-915 (Dynamic Code Evaluation)
- **Impacto:** Posible ejecución de código si los IDs no se validan
- **Warnings:**
  ```
  security/detect-object-injection en múltiples líneas
  ```
- **Recomendación:**
  ```typescript
  // Validar que las claves sean strings alfanuméricos
  const isValidKey = (key: string) => /^[a-zA-Z0-9_-]+$/.test(key)
  if (!isValidKey(item.id)) {
    throw new Error('Invalid item ID')
  }
  ```
- **Explotabilidad:** Baja - Requiere control previo de datos

### 10. **Credenciales Hardcodeadas en Scripts de Setup**
- **Archivos:**
  - `scripts/create-user-benitez.js:8`
  - `scripts/create-user-benitez-fixed.js:8`
- **Severidad:** ⚠️ ALTA
- **CWE:** CWE-798 (Use of Hard-coded Credentials)
- **Impacto:** Si estos scripts se ejecutan en producción, exponen contraseñas
- **Problema:**
  ```javascript
  const password = 'Estepona(2026)'  // ⚠️ HARDCODEADA
  ```
- **Recomendación:**
  ```javascript
  const password = process.env.ADMIN_PASSWORD || 'Estepona(2026)'
  // O pedir como input
  const readline = require('readline')
  const rl = readline.createInterface({ ... })
  ```
- **Explotabilidad:** Media - Requiere acceso al repositorio

### 11. **Uso de fs.write con Argumentos No-Literales**
- **Archivo:** `src/app/api/upload/route.ts:150`
- **Severidad:** ⚠️ ALTA
- **CWE:** CWE-22 (Improper Limitation of a Pathname)
- **Impacto:** Posible path traversal si no se sanitiza bien
- **Problema:** `writeFile` con nombre de archivo dinámico
- **Nota:** Ya hay validación en `generateSecureFilename()` con UUID
- **Recomendación:** Añadir validación adicional de path
  ```typescript
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new Error('Invalid filename')
  }
  ```
- **Explotabilidad:** Baja - Ya hay mitigaciones

### 12. **Falta Sanitización de Inputs de Usuario en Frontend**
- **Archivos:** Componentes de formularios múltiples
- **Severidad:** ⚠️ ALTA
- **CWE:** CWE-79 (Cross-Site Scripting)
- **Impacto:** Posible XSS si los datos no se sanitizan antes de renderizar
- **Nota:** Next.js ya escapa por defecto, pero es buena práctica sanitizar
- **Recomendación:**
  ```typescript
  import DOMPurify from 'isomorphic-dompurify'
  const cleanInput = DOMPurify.sanitize(userInput)
  ```
- **Explotabilidad:** Baja - Next.js tiene protección built-in

### 13. **Rate Limiting Fails-Open (Repetido de Auditoría Anterior)**
- **Archivo:** `src/lib/rate-limit-redis.ts`
- **Severidad:** ⚠️ ALTA
- **CWE:** CWE-693 (Protection Mechanism Failure)
- **Impacto:** Si Redis falla, no hay rate limiting
- **Recomendación:** Implementar fallback en memoria para producción
  ```typescript
  const inMemoryRateLimit = new Map()  // Fallback
  if (redisUnavailable) {
    // Usar rate limiting en memoria
  }
  ```
- **Explotabilidad:** Media - Requiere que Redis falle

---

## 📋 VULNERABILIDADES DE PRIORIDAD MEDIA

### 14. **Logs de Error en Producción (informativos, no stack traces)**
- **Archivos:** Múltiples endpoints
- **Severidad:** 📋 MEDIA
- **Problema:** Se loguean errores genéricos que podrían ayudar a attackers
- **Recomendación:** Usar sistema de logs centralizado (Sentry, LogRocket)

### 15. **Sesión de 24 Horas Puede Ser Muy Larga para Estudiantes**
- **Archivo:** `src/lib/auth.ts:169`
- **Severidad:** 📋 MEDIA
- **Nota:** Mejorado desde auditoría anterior (30 días → 24 horas)
- **Recomendación:** Considerar 12 horas para estudiantes

### 16. **Falta Verificación de Dominio de Email para Estudiantes**
- **Archivo:** `src/app/api/auth/register/route.ts`
- **Severidad:** 📋 MEDIA
- **Impacto:** Cualquiera con código de invitación puede registrarse
- **Recomendación:**
  ```typescript
  if (!email.endsWith('@ugr.es') && !email.endsWith('@go.ugr.es')) {
    return NextResponse.json(
      { error: 'Solo se permiten emails institucionales (@ugr.es o @go.ugr.es)' },
      { status: 400 }
    )
  }
  ```

### 17. **No Hay Validación de Integridad de Datos en Cliente**
- **Archivos:** Todos los formularios frontend
- **Severidad:** 📋 MEDIA
- **Impacto:** Datos pueden ser modificados antes de enviar
- **Recomendación:** Implementar checksums o hashes para datos críticos

### 18. **Falta Header X-Content-Type-Options en Algunas Respuestas**
- **Archivos:** APIs que devuelven JSON
- **Severidad:** 📋 MEDIA
- **Nota:** Middleware lo aplica solo a páginas, no a APIs
- **Recomendación:** Extender middleware a todas las respuestas

### 19. **Posible Race Condition en Registro de Asistencia**
- **Archivo:** `src/app/api/attendance/register/route.ts:127-142`
- **Severidad:** 📋 MEDIA
- **Impacto:** Doble registro si se envían dos requests simultáneos
- **Recomendación:** Usar unique constraint en DB (ya existe) y manejar error

---

## ℹ️ VULNERABILIDADES DE BAJA PRIORIDAD

### 20. **Warnings de React Hooks Exhaustive Deps**
- **Archivos:** Múltiples componentes
- **Severidad:** ℹ️ BAJA
- **Impacto:** Posibles bugs sutiles en useEffect
- **Recomendación:** Corregir dependencias faltantes o usar eslint-disable con comentarios explicativos

### 21. **Falta Indización en Algunos Campos de Base de Datos**
- **Archivo:** `prisma/schema.prisma`
- **Severidad:** ℹ️ BAJA
- **Nota:** Ya hay índices en campos críticos
- **Recomendación:** Añadir índices compuestos para queries frecuentes

### 22. **Cleanup de Streams No Garantizado en Errores**
- **Archivos:** Grabaciones de audio/video
- **Severidad:** ℹ️ BAJA
- **Nota:** Código actual tiene try-catch pero podría mejorarse
- **Recomendación:** Asegurar cleanup en finally blocks

### 23. **Progreso de Checklist Puede Desincronizarse**
- **Archivo:** `src/components/miniweb/checklist-section.tsx`
- **Severidad:** ℹ️ BAJA
- **Impacto:** UX pobre si se desincroniza localStorage con servidor
- **Recomendación:** Implementar estrategia de sync y resolución de conflictos

---

## ✅ MEJORAS IMPLEMENTADAS (Desde Auditoría Anterior)

Las siguientes vulnerabilidades de la auditoría anterior han sido **CORREGIDAS**:

1. ✅ **Validación de firma de archivos** - Implementado con magic numbers
2. ✅ **Validación de expiración en QR scanner** - Validación completa en servidor
3. ✅ **Protección de rutas admin en servidor** - Middleware con verificación de rol
4. ✅ **Requisitos de contraseña** - Mejorados a 12 caracteres con complejidad
5. ✅ **Tiempo de sesión JWT** - Reducido de 30 días a 24 horas/7 días
6. ✅ **Headers de seguridad** - Implementados en middleware.ts
7. ✅ **Validación con Zod** - Implementado en múltiples endpoints
8. ✅ **Rate limiting** - Implementado con Redis
9. ✅ **Sanitización de errores** - Mensajes genéricos en producción
10. ✅ **Índices en BD** - Añadidos en campos críticos

---

## 📊 COMPARATIVO CON AUDITORÍA ANTERIOR

| Métrica | Auditoría Anterior (Feb 2026) | Auditoría Actual (Abr 2026) | Mejora |
|---------|-------------------------------|------------------------------|--------|
| Vulnerabilidades Críticas | 5 | 4 | ⬇️ 1 |
| Vulnerabilidades Altas | 10 | 9 | ⬇️ 1 |
| Vulnerabilidades Medias | 6 | 6 | ➡️ = |
| Vulnerabilidades Bajas | 8 | 4 | ⬇️ 4 |
| **Total** | **29** | **23** | ⬇️ **20%** |

**Porcentaje de corrección:** 17 de 29 vulnerabilidades anteriores corregidas (**59%**)

---

## 🎯 PLAN DE ACCIÓN PRIORITARIO

### Fase 1 - CRÍTICA (Hoy - 24 horas)

1. **Corregir timing attack en reset-password** (30 min)
   ```bash
   # Archivo: src/app/(auth)/reset-password/page.tsx
   # Implementar timingSafeEqual
   ```

2. **Validar topicIds en API de votación** (1 hora)
   ```bash
   # Archivo: src/app/api/debates/vote/route.ts
   # Añadir validación de IDs existentes
   ```

3. **Implementar lock de 24h para cambio de voto** (1 hora)
   ```bash
   # Archivo: src/app/api/debates/vote/route.ts
   # Prevenir re-votado infinito
   ```

4. **Añadir schemas Zod en endpoints faltantes** (2 horas)
   ```bash
   # Archivos: debates/vote, debates/results, contact
   # Implementar validación completa
   ```

### Fase 2 - ALTA (Esta semana - 7 días)

5. **Restringir resultados detallados a admins** (1 hora)
6. **Mejorar comparación de arrays** (30 min)
7. **Implementar protección CSRF** (4 horas)
8. **Remover credenciales hardcodeadas** (1 hora)
9. **Añadir sanitización XSS** (2 horas)
10. **Implementar fallback de rate limiting** (2 horas)
11. **Validar dominio de email @ugr.es** (30 min)
12. **Corregir object injection warnings** (2 horas)
13. **Añadir headers de seguridad en APIs** (1 hora)

### Fase 3 - MEDIA (Próximas 2 semanas - 14 días)

14. **Implementar sistema de logs centralizado** (4 horas)
15. **Reducir tiempo de sesión a 12h** (30 min)
16. **Añadir validación de integridad** (3 horas)
17. **Manejar race conditions** (2 horas)
18. **Añadir headers X-Content-Type en APIs** (1 hora)
19. **Mejorar sync de checklist** (3 horas)

### Fase 4 - BAJA (Cuando sea posible - 1 mes)

20. **Corregir React hooks warnings** (4 horas)
21. **Añadir índices compuestos** (2 horas)
22. **Mejorar cleanup de streams** (2 horas)
23. **Optimizar sync de checklist** (3 horas)

---

## 🔒 RECOMENDACIONES DE LARGO PLAZO

1. **Implementar pruebas de penetración trimestrales**
2. **Establecer proceso de code review obligatorio** para cambios en seguridad
3. **Implementar monitoreo de seguridad en tiempo real** (Sentry, LogRocket)
4. **Capacitación en secure coding** para equipo de desarrollo
5. **Implementar WAF** (Web Application Firewall) en Vercel
6. **Establecer política de rotación de credenciales** cada 90 días
7. **Implementar backup automático con test de restore** mensual
8. **Configurar alertas de actividad sospechosa** (múltiples login fallidos, etc.)
9. **Implementar 2FA obligatorio para admins** (ya está preparado en código)
10. **Considerar implementación de CORS estricto** para APIs

---

## 📈 SCORE DE SEGURIDAD

| Categoría | Score | Nota |
|-----------|-------|------|
| Autenticación | 8/10 | ✅ Bueno, mejorar 2FA |
| Autorización | 7/10 | ⚠️ Validar admin checks |
| Validación Inputs | 6/10 | ⚠️ Falta Zod en algunos endpoints |
| Protección Datos | 7/10 | ✅ Headers OK, mejorar privacidad |
| Gestión Sesiones | 8/10 | ✅ Mejorado desde auditoría anterior |
| Rate Limiting | 6/10 | ⚠️ Fail-open problem |
| Upload Archivos | 9/10 | ✅ Excelente validación |
| Logging/Monitoring | 5/10 | ⚠️ Mejorar logs centralizados |
| Criptografía | 8/10 | ✅ Buen uso de bcryptjs |
| **PROMEDIO** | **7.1/10** | **Bueno, con mejoras posibles** |

---

## 🎓 CONCLUSIÓN

La plataforma PIO-7 ha **mejorado significativamente** su postura de seguridad desde la última auditoría, con un **20% menos de vulnerabilidades** y correcciones importantes en áreas críticas como upload de archivos y headers de seguridad.

**Puntos fuertes:**
- ✅ Excelente validación de archivos con magic numbers
- ✅ Headers de seguridad completos en middleware
- ✅ Rate limiting con Redis
- ✅ Contraseñas fuertes (12 caracteres + complejidad)
- ✅ Validación con Zod en endpoints críticos
- ✅ Mensajes de error genéricos para prevenir enumeración

**Áreas de mejora prioritaria:**
- 🚨 Corregir timing attack en comparación de contraseñas
- 🚨 Validar IDs en API de votación
- 🚨 Prevenir re-votado infinito
- ⚠️ Completar validación Zod en todos los endpoints
- ⚠️ Implementar protección CSRF
- ⚠️ Mejorar privacidad en resultados detallados

**Recomendación general:** **PENDIENTE DE CORRECCIÓN DE VULNERABILIDADES CRÍTICAS** antes de uso en producción con datos reales de estudiantes.

---

**Generado por:** Claude Sonnet 4.6 (AI Security Specialist)
**Fecha:** 28 de Abril 2026
**Próxima auditoría recomendada:** Agosto 2026 (3 meses)
