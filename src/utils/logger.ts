/**
 * Утилиты для логирования
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

/**
 * Уровни логирования
 */
export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

/**
 * Контекст логирования
 */
interface LogContext {
  readonly [key: string]: string | number | boolean | undefined;
}

/**
 * Запись лога
 */
interface LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp: number;
  readonly context?: LogContext;
}

/**
 * Форматирует запись лога для вывода
 * @param entry - Запись лога
 * @returns Отформатированная строка
 */
function formatLogEntry(entry: LogEntry): string {
  const timestamp = new Date(entry.timestamp).toISOString();
  const contextStr = entry.context
    ? ` ${JSON.stringify(entry.context)}`
    : "";

  return `[${timestamp}] [${entry.level}] ${entry.message}${contextStr}`;
}

/**
 * Логирует информацию
 * @param message - Сообщение для логирования
 * @param data - Дополнительные данные (опционально)
 */
export function logInfo(message: string, data?: LogContext): void {
  const entry: LogEntry = {
    level: LogLevel.INFO,
    message,
    timestamp: Date.now(),
    context: data,
  };

  console.log(formatLogEntry(entry));
}

/**
 * Логирует предупреждение
 * @param message - Сообщение для логирования
 * @param data - Дополнительные данные (опционально)
 */
export function logWarn(message: string, data?: LogContext): void {
  const entry: LogEntry = {
    level: LogLevel.WARN,
    message,
    timestamp: Date.now(),
    context: data,
  };

  console.warn(formatLogEntry(entry));
}

/**
 * Логирует ошибку
 * @param error - Ошибка (может быть любого типа)
 * @param context - Контекст ошибки (опционально)
 */
export function logError(error: unknown, context?: string): void {
  const errorMessage =
    error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const entry: LogEntry = {
    level: LogLevel.ERROR,
    message: errorMessage,
    timestamp: Date.now(),
    context: {
      ...(context ? { context } : {}),
      ...(errorStack ? { stack: errorStack } : {}),
    },
  };

  console.error(formatLogEntry(entry));

  // В production можно добавить отправку в сервис мониторинга (Sentry и т.д.)
  if (process.env.NODE_ENV === "production") {
    // TODO: Интеграция с сервисом мониторинга
    // Пример: Sentry.captureException(error, { extra: context });
  }
}

