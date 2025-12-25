/**
 * Типы для API
 */

/**
 * Запрос на отправку сообщения в Telegram
 */
export interface TelegramSendMessageRequest {
  readonly message: string;
  readonly code?: string;
}

/**
 * Ответ от Telegram API
 */
export interface TelegramSendMessageResponse {
  readonly success: boolean;
  readonly message?: string;
  readonly error?: string;
}
