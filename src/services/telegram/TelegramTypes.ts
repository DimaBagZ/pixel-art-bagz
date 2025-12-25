/**
 * Типы для Telegram сервиса
 * Строгая типизация без использования any
 */

/**
 * Конфигурация Telegram бота
 */
export interface TelegramConfig {
  readonly botToken: string;
  readonly chatId: string;
}

/**
 * Результат отправки сообщения
 */
export interface TelegramSendResult {
  readonly success: boolean;
  readonly messageId?: number;
  readonly error?: string;
}

/**
 * Ответ от Telegram Bot API
 */
interface TelegramApiResponse {
  readonly ok: boolean;
  readonly result?: {
    readonly message_id: number;
  };
  readonly description?: string;
}

/**
 * Тип для внутреннего использования
 */
export type TelegramApiResponseType = TelegramApiResponse;
