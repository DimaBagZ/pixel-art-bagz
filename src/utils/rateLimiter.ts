/**
 * Rate Limiter для ограничения количества запросов
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

/**
 * Интерфейс для хранения информации о лимите
 */
interface RateLimitInfo {
  readonly count: number;
  readonly resetTime: number;
}

/**
 * Конфигурация Rate Limiter
 */
interface RateLimiterConfig {
  readonly maxRequests: number;
  readonly windowMs: number;
}

/**
 * Результат проверки лимита
 */
export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly resetTime: number;
}

/**
 * Класс для ограничения количества запросов
 * Использует in-memory хранилище (Map)
 */
export class RateLimiter {
  private readonly config: RateLimiterConfig;
  private readonly store: Map<string, RateLimitInfo>;

  constructor(config: RateLimiterConfig) {
    this.config = config;
    this.store = new Map<string, RateLimitInfo>();
  }

  /**
   * Проверяет, разрешен ли запрос для указанного идентификатора
   * @param identifier - Уникальный идентификатор (например, IP адрес)
   * @returns Результат проверки лимита
   */
  checkLimit(identifier: string): RateLimitResult {
    const now = Date.now();
    const info = this.store.get(identifier);

    // Если записи нет или окно истекло, создаем новую
    if (!info || now > info.resetTime) {
      const resetTime = now + this.config.windowMs;
      this.store.set(identifier, {
        count: 1,
        resetTime,
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime,
      };
    }

    // Если лимит превышен
    if (info.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: info.resetTime,
      };
    }

    // Увеличиваем счетчик
    const newCount = info.count + 1;
    this.store.set(identifier, {
      count: newCount,
      resetTime: info.resetTime,
    });

    return {
      allowed: true,
      remaining: this.config.maxRequests - newCount,
      resetTime: info.resetTime,
    };
  }

  /**
   * Сбрасывает лимит для указанного идентификатора
   * @param identifier - Уникальный идентификатор
   */
  resetLimit(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Очищает все истекшие записи (оптимизация памяти)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [identifier, info] of this.store.entries()) {
      if (now > info.resetTime) {
        this.store.delete(identifier);
      }
    }
  }
}

/**
 * Создает экземпляр Rate Limiter с настройками по умолчанию
 * 5 запросов в минуту
 */
export function createDefaultRateLimiter(): RateLimiter {
  return new RateLimiter({
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 минута
  });
}

/**
 * Глобальный экземпляр Rate Limiter для API routes
 * Используется для ограничения запросов к Telegram API
 */
export const telegramRateLimiter = createDefaultRateLimiter();

// Периодическая очистка истекших записей (каждые 5 минут)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    telegramRateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

