import DOMPurify from 'isomorphic-dompurify'

/**
 * Configuración de DOMPurify para sanitización XSS
 *
 * Niveles de sanitización:
 * - STRICT: Solo permite formatting básico (b, i, em, strong, p, br)
 * - MODERATE: Permite links y listas adicionales
 * - RELAXED: Permite más HTML pero sin scripts/events/styles
 */

const CONFIG_STRICT = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'span'],
  ALLOWED_ATTR: ['class'],
  KEEP_CONTENT: true,
}

const CONFIG_MODERATE = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'span', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  ALLOWED_ATTR: ['href', 'class', 'target'],
  ADD_ATTR: ['target'],
  ADD_URI_SAFE_ATTR: ['href'],
}

const CONFIG_RELAXED = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'span', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'div'],
  ALLOWED_ATTR: ['href', 'class', 'target', 'id'],
  ADD_ATTR: ['target'],
  ADD_URI_SAFE_ATTR: ['href'],
}

/**
 * Sanitiza HTML para prevenir ataques XSS
 *
 * @param html - HTML potentially containing user input
 * @param level - Nivel de sanitización (strict | moderate | relaxed)
 * @returns HTML sanitizado seguro
 */
export function sanitizeHtml(html: string, level: 'strict' | 'moderate' | 'relaxed' = 'moderate'): string {
  if (!html) return ''

  const config = {
    strict: CONFIG_STRICT,
    moderate: CONFIG_MODERATE,
    relaxed: CONFIG_RELAXED,
  }[level]

  return DOMPurify.sanitize(html, config)
}

/**
 * Sanitiza texto plano (elimina cualquier HTML)
 *
 * @param text - Texto que puede contener HTML
 * @returns Texto sin HTML
 */
export function sanitizeText(text: string): string {
  if (!text) return ''
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
}

/**
 * Sanitiza array de strings
 *
 * @param items - Array de strings potencialmente maliciosos
 * @param level - Nivel de sanitización
 * @returns Array de strings sanitizados
 */
export function sanitizeArray(items: string[], level: 'strict' | 'moderate' | 'relaxed' = 'moderate'): string[] {
  if (!Array.isArray(items)) return []
  return items.map(item => sanitizeHtml(item, level))
}

/**
 * Sanitiza objeto eliminando valores peligrosos
 *
 * @param obj - Objeto con datos de usuario
 * @returns Objeto sanitizado
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      (sanitized as any)[key] = sanitizeHtml(sanitized[key])
    } else if (Array.isArray(sanitized[key])) {
      (sanitized as any)[key] = sanitizeArray(sanitized[key])
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      (sanitized as any)[key] = sanitizeObject(sanitized[key])
    }
  }

  return sanitized
}

/**
 * Sanitiza específicamente para URLs (permite solo http/https/mailto)
 *
 * @param url - URL potencialmente maliciosa
 * @returns URL sanitizada o string vacío si es inválida
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''

  // Solo permitir protocolos seguros
  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']
  try {
    const parsed = new URL(url)
    if (!allowedProtocols.includes(parsed.protocol)) {
      return ''
    }
    return DOMPurify.sanitize(url, { ALLOWED_TAGS: [] })
  } catch {
    // URL inválida
    return ''
  }
}

/**
 * Valida y sanitiza input de usuario en general
 *
 * @param input - Cualquier tipo de input
 * @returns Input sanitizado
 */
export function sanitizeUserInput<T>(input: T): T {
  if (typeof input === 'string') {
    return sanitizeHtml(input) as T
  }

  if (Array.isArray(input)) {
    return sanitizeArray(input) as T
  }

  if (typeof input === 'object' && input !== null) {
    return sanitizeObject(input as Record<string, any>) as T
  }

  return input
}
