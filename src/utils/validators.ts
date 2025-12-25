/**
 * Утилиты для валидации данных
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

/**
 * Результат валидации
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly error?: string;
}

/**
 * Константы для валидации
 */
const VALIDATION_LIMITS = {
  MAX_MESSAGE_LENGTH: 1000,
  MIN_MESSAGE_LENGTH: 1,
  MAX_PROMO_CODE_LENGTH: 50,
  MIN_PROMO_CODE_LENGTH: 3,
  PROMO_CODE_PATTERN: /^[A-Z0-9-]+$/,
} as const;

/**
 * Валидирует сообщение для Telegram
 * @param message - Сообщение для проверки
 * @returns Результат валидации
 */
export function validateTelegramMessage(message: string): ValidationResult {
  // Проверка типа
  if (typeof message !== "string") {
    return {
      isValid: false,
      error: "Сообщение должно быть строкой",
    };
  }

  // Проверка на пустую строку
  if (message.trim().length < VALIDATION_LIMITS.MIN_MESSAGE_LENGTH) {
    return {
      isValid: false,
      error: "Сообщение не может быть пустым",
    };
  }

  // Проверка максимальной длины
  if (message.length > VALIDATION_LIMITS.MAX_MESSAGE_LENGTH) {
    return {
      isValid: false,
      error: `Сообщение не может быть длиннее ${VALIDATION_LIMITS.MAX_MESSAGE_LENGTH} символов`,
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Валидирует промокод
 * @param code - Промокод для проверки
 * @returns Результат валидации
 */
export function validatePromoCode(code: string): ValidationResult {
  // Проверка типа
  if (typeof code !== "string") {
    return {
      isValid: false,
      error: "Промокод должен быть строкой",
    };
  }

  // Проверка минимальной длины
  if (code.length < VALIDATION_LIMITS.MIN_PROMO_CODE_LENGTH) {
    return {
      isValid: false,
      error: `Промокод должен быть не короче ${VALIDATION_LIMITS.MIN_PROMO_CODE_LENGTH} символов`,
    };
  }

  // Проверка максимальной длины
  if (code.length > VALIDATION_LIMITS.MAX_PROMO_CODE_LENGTH) {
    return {
      isValid: false,
      error: `Промокод не может быть длиннее ${VALIDATION_LIMITS.MAX_PROMO_CODE_LENGTH} символов`,
    };
  }

  // Проверка формата (только заглавные буквы, цифры и дефисы)
  if (!VALIDATION_LIMITS.PROMO_CODE_PATTERN.test(code)) {
    return {
      isValid: false,
      error: "Промокод может содержать только заглавные буквы, цифры и дефисы",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Санитизирует строку, удаляя потенциально опасные символы
 * @param input - Входная строка
 * @returns Санитизированная строка
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  // Удаляем управляющие символы, но оставляем обычные символы
  return input
    .replace(/[\x00-\x1F\x7F]/g, "") // Удаляем управляющие символы
    .trim();
}

