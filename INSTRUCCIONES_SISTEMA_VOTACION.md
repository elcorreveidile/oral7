# INSTRUCCIONES: SISTEMA DE VOTACIÓN DE DEBATES

## 📋 RESUMEN

Sistema completo de votación para que los estudiantes elijan los 4 temas de debate de 12 disponibles para la tertulia del Local Cultural de Granada.

## 🔧 PASOS DE INSTALACIÓN

### 1. Actualizar la base de datos

```bash
cd /Users/javierbenitez/Desktop/AI/oral7

# Generar migración de Prisma
npx prisma migrate dev --name add-debate-voting

# O si hay problemas, generar el cliente directamente
npx prisma generate
```

### 2. Inicializar los 12 temas de debate

Haz una petición POST a:

```bash
curl -X POST http://localhost:3000/api/debates/seed \
  -H "Content-Type: application/json"
```

O desde el navegador con las herramientas de desarrollador:

```javascript
fetch('/api/debates/seed', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

### 3. Acceder a la interfaz de votación

**Para estudiantes:**
- URL: `http://localhost:3000/votacion-debates`
- Requiere estar autenticado
- Pueden seleccionar 4 temas en orden de preferencia (#1 al #4)

**Para admin (ver resultados):**
- URL: `http://localhost:3000/admin/debates/resultados`
- Requiere rol de ADMIN
- Muestra resultados en tiempo real
- Puede resetear votos

## 📊 SISTEMA DE VOTACIÓN

**Sistema por cantidad de votos:**
- Cada estudiante selecciona 4 temas
- Los ordena por preferencia (1-4)
- El sistema cuenta cuántos votos tiene cada tema
- **Importancia del orden:** El orden (rank) se registra para análisis, pero no afecta la puntuación

**Cálculo de puntuación:**
- 1 voto = 1 punto (sin importar el rank)
- Los 4 temas con más votos ganan

## 🎯 FLUJO DE USUARIO

### Para estudiantes:

1. **Acceder a la página de votación**
   - Van a `/votacion-debates`
   - Se autentifican si es necesario

2. **Seleccionar 4 temas**
   - Hacen clic en los temas que les interesan
   - Pueden cambiar la selección antes de enviar
   - El sistema muestra el orden de preferencia (#1-#4)

3. **Confirmar voto**
   - Una vez seleccionados 4 temas, aparece el botón "Enviar Mi Voto"
   - Al enviar, el sistema guarda sus preferencias
   - No pueden volver a votar

4. **Ver resultados (opcional)**
   - Pueden ver los resultados en tiempo real
   - URL: `/api/debates/results` (JSON)

### Para admin:

1. **Inicializar temas**
   - POST a `/api/debates/seed`
   - Crea los 12 temas en la base de datos

2. **Monitorear votación**
   - Van a `/admin/debates/resultados`
   - Ven resultados en tiempo real
   - Pueden ver detalles de quién votó qué

3. **Anunciar ganadores**
   - Los 4 temas con mayor puntuación ganan
   - Se muestran destacados en la página de resultados

4. **Resetear (opcional)**
   - Botón "Resetear votos" en página de admin
   - Elimina todos los votos y empieza de nuevo

## 🗄️ MODELOS DE DATOS

### DebateTopic
```typescript
{
  id: string
  title: string          // Título del tema
  description: string    // Descripción completa
  category: string       // Categoría
  order: number          // Orden de presentación
  isActive: boolean      // Si está activo
  votes: DebateVote[]    // Votos recibidos
}
```

### DebateVote
```typescript
{
  id: string
  userId: string         // ID del usuario
  topicId: string        // ID del tema
  rank: number           // Preferencia (1-4)
  user: User             // Relación con usuario
  topic: DebateTopic     // Relación con tema
}
```

## 🔌 ENDPOINTS DE API

### GET /api/debates/topics
Obtener todos los temas de debate activos.

**Response:**
```json
[
  {
    "id": "...",
    "title": "Lugares de la ciudad",
    "description": "¿Qué espacios definen la identidad granadina?",
    "category": "Experiencia personal",
    "order": 1,
    "_count": { "votes": 5 }
  }
]
```

### POST /api/debates/vote
Registrar votos del usuario autenticado.

**Request:**
```json
{
  "votes": [
    { "topicId": "...", "rank": 1 },
    { "topicId": "...", "rank": 2 },
    { "topicId": "...", "rank": 3 },
    { "topicId": "...", "rank": 4 }
  ]
}
```

### GET /api/debates/vote
Obtener votos del usuario actual.

**Response:**
```json
[
  {
    "id": "...",
    "topicId": "...",
    "rank": 1,
    "topic": {
      "title": "Lugares de la ciudad",
      ...
    }
  }
]
```

### GET /api/debates/results
Obtener resultados de la votación.

**Query params:**
- `detailed=true` - Incluye detalles de quién votó qué

**Response:**
```json
{
  "results": [...],
  "top4": [...],
  "totalVoters": 15
}
```

### POST /api/debates/seed
Inicializar los 12 temas (solo admin).

## 🎨 PÁGINAS CREADAS

1. **`/votacion-debates`** - Página de votación para estudiantes
   - Interfaz visual con tarjetas para cada tema
   - Selección por clic con feedback visual
   - Muestra orden de preferencia (#1-#4)
   - Contador de selecciones (0/4)
   - Botón de enviar cuando hay 4 seleccionados
   - Confirmación de voto enviado

2. **`/admin/debates/resultados`** - Página de resultados para admin
   - Clasificación completa de temas
   - Los 4 ganadores destacados
   - Puntuación y número de votos
   - Opción de ver detalles de votación
   - Botón para resetear votos

## 📱 CARACTERÍSTICAS DE LA INTERFAZ

### Página de votación:
- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Tarjetas visuales para cada tema
- ✅ Colores distintivos por preferencia (#1 azul, #2 púrpura, etc.)
- ✅ Animaciones al seleccionar
- ✅ Validación de selección (exactamente 4)
- ✅ Prevención de doble voto
- ✅ Feedback de éxito/error
- ✅ Contador de votos totales por tema

### Página de resultados:
- ✅ Top 4 destacado con medallas (🥇🥈🥉🏅)
- ✅ Clasificación completa
- ✅ Puntuaciones detalladas
- ✅ Distribución de votos por rank
- ✅ Ver quién votó qué (admin)
- ✅ Reset de votos

## 🔐 SEGURIDAD

- ✅ Solo usuarios autenticados pueden votar
- ✅ Un voto por usuario
- ✅ Validación de datos (4 temas únicos)
- ✅ Solo admin puede ver detalles y resetear
- ✅ Prevención de SQL injection (Prisma)
- ✅ Validación de rangos (1-4 únicos)

## 🚀 PRÓXIMOS PASOS

1. **Ejecutar migración de base de datos**
   ```bash
   npx prisma migrate dev --name add-debate-voting
   ```

2. **Inicializar temas**
   ```bash
   curl -X POST http://localhost:3000/api/debates/seed
   ```

3. **Probar la interfaz**
   - Ir a `/votacion-debates`
   - Probar seleccionar temas
   - Enviar voto
   - Ver resultados

4. **Compartir con estudiantes**
   - Enviar enlace: `/votacion-debates`
   - Establecer fecha límite
   - Anunciar ganadores

## 📧 COMUNICACIÓN A ESTUDIANTES

**Asunto:** 🗳️ Votación: Temas de Debate para la Tertulia

**Cuerpo:**

Hola a todos,

Como saben, el [FECHA] tendremos nuestra tertulia de debates en el Local Cultural de Granada.

Hay 12 temas posibles, pero solo podremos debatir 4. **¡Es vuestra oportunidad de elegir!**

**Cómo votar:**
1. Entra a: [URL]/votacion-debates
2. Selecciona los 4 temas que más te interesen
3. Ordénalos por preferencia (#1 = el que más te gusta)
4. Envía tu voto

**Fecha límite:** [FECHA LÍMITE]

Los 4 temas más votados se anunciarán el [FECHA DE ANUNCIO].

¡Participad y决定的 que queráis debatir!

Un saludo,

[TU NOMBRE]

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Crear modelos en Prisma (DebateTopic, DebateVote)
- [x] Crear endpoint GET /api/debates/topics
- [x] Crear endpoint POST /api/debates/vote
- [x] Crear endpoint GET /api/debates/vote
- [x] Crear endpoint GET /api/debates/results
- [x] Crear endpoint POST /api/debates/seed
- [x] Crear página /votacion-debates
- [x] Crear página /admin/debates/resultados
- [ ] Ejecutar migración de Prisma
- [ ] Inicializar 12 temas con /api/debates/seed
- [ ] Probar flujo completo de votación
- [ ] Compartir con estudiantes

---

*Documento generado para implementación del sistema de votación de debates - 2026*
