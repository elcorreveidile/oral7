/**
 * In-Memory Rate Limiter (Fallback cuando Redis no está disponible)
 *
 * Usado como fallback cuando Redis falla, proporcionando protección básica
 * contra ataques de fuerza bruta en el nivel de aplicación.
 */

interface MemoryRateLimitEntry {
  count: number
  resetTime: number
}

class MemoryRateLimiter {
  private store: Map<string, MemoryRateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Limpiar entradas expiradas cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Limpiar entradas expiradas
   */
  private cleanup() {
    const now = Date.now()
    this.store.forEach((entry, key) => {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    })
  }

  /**
   * Verificar rate limit en memoria
   */
  check(identifier: string, limit: number, windowSeconds: number): { success: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.store.get(identifier)

    if (!entry || now > entry.resetTime) {
      // Primera petición o ventana expirada
      const resetTime = now + windowSeconds * 1000
      this.store.set(identifier, {
        count: 1,
        resetTime
      })
      return {
        success: true,
        remaining: limit - 1,
        resetTime
      }
    }

    // Ventana todavía activa
    if (entry.count >= limit) {
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    // Incrementar contador
    entry.count++
    return {
      success: true,
      remaining: limit - entry.count,
      resetTime: entry.resetTime
    }
  }

  /**
   * Reiniciar rate limit para un identifier
   */
  reset(identifier: string) {
    this.store.delete(identifier)
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    return {
      totalEntries: this.store.size,
      entries: Array.from(this.store.entries()).map(([key, entry]) => ({
        key,
        count: entry.count,
        resetTime: new Date(entry.resetTime)
      }))
    }
  }

  /**
   * Limpiar todos los datos (útil para testing)
   */
  clear() {
    this.store.clear()
  }

  /**
   * Destruir el limpiador
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

// Singleton instance
let memoryLimiter: MemoryRateLimiter | null = null

export function getMemoryRateLimiter(): MemoryRateLimiter {
  if (!memoryLimiter) {
    memoryLimiter = new MemoryRateLimiter()
  }
  return memoryLimiter
}

export { MemoryRateLimiter }
