/**
 * Утилиты для обработки ошибок в API
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

/**
 * Коды ошибок для клиента
 */
export enum ApiErrorCode {
  INVALID_REQUEST = "INVALID_REQUEST",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

/**
 * Ответ API при ошибке
 */
export interface ApiErrorResponse {
  readonly success: false;
  readonly error: string;
  readonly code?: ApiErrorCode;
}

/**
 * Безопасное сообщение об ошибке для клиента
 * Не раскрывает внутренние детали
 */
interface SafeErrorMessage {
  readonly message: string;
  readonly code: ApiErrorCode;
}

/**
 * Преобразует ошибку в безопасное сообщение для клиента
 * @param error - Ошибка (может быть любого типа)
 * @returns Безопасное сообщение об ошибке
 */
function getSafeErrorMessage(error: unknown): SafeErrorMessage {
  // Если это известная ошибка валидации
  if (error instanceof Error && error.message.includes("validation")) {
    return {
      message: "Ошибка валидации данных",
      code: ApiErrorCode.VALIDATION_ERROR,
    };
  }

  // Если это ошибка конфигурации
  if (error instanceof Error && error.message.includes("TELEGRAM")) {
    return {
      message: "Ошибка конфигурации сервиса",
      code: ApiErrorCode.CONFIGURATION_ERROR,
    };
  }

  // Если это ошибка внешнего сервиса (Telegram API)
  if (error instanceof Error && error.message.includes("Telegram")) {
    return {
      message: "Временная ошибка сервиса. Попробуйте позже",
      code: ApiErrorCode.EXTERNAL_SERVICE_ERROR,
    };
  }

  // Общая ошибка (не раскрываем детали)
  return {
    message: "Внутренняя ошибка сервера",
    code: ApiErrorCode.INTERNAL_ERROR,
  };
}

/**
 * Обрабатывает ошибку и возвращает безопасный ответ для клиента
 * @param error - Ошибка (может быть любого типа)
 * @param context - Контекст ошибки (опционально)
 * @returns Ответ API с ошибкой
 */
export function handleApiError(error: unknown, context?: string): ApiErrorResponse {
  const safeError = getSafeErrorMessage(error);

  // Логируем полную ошибку для разработчиков (только в dev режиме)
  if (process.env.NODE_ENV === "development") {
    console.error("API Error:", {
      error,
      context,
      safeMessage: safeError.message,
    });
  }

  return {
    success: false,
    error: safeError.message,
    code: safeError.code,
  };
}

/**
 * Создает ответ об ошибке валидации
 * @param message - Сообщение об ошибке
 * @returns Ответ API с ошибкой валидации
 */
export function createValidationError(message: string): ApiErrorResponse {
  return {
    success: false,
    error: message,
    code: ApiErrorCode.VALIDATION_ERROR,
  };
}

/**
 * Создает ответ об ошибке rate limit
 * @param resetTime - Время сброса лимита (timestamp)
 * @returns Ответ API с ошибкой rate limit
 */
export function createRateLimitError(resetTime: number): ApiErrorResponse {
  const secondsUntilReset = Math.ceil((resetTime - Date.now()) / 1000);

  return {
    success: false,
    error: `Превышен лимит запросов. Попробуйте через ${secondsUntilReset} секунд`,
    code: ApiErrorCode.RATE_LIMIT_EXCEEDED,
  };
}
