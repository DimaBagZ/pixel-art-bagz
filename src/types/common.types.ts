/**
 * Общие типы для проекта
 */

/**
 * Результат операции (для обработки ошибок)
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Промокод
 */
export type PromoCode = string;
