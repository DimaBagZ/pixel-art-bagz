/**
 * Сервис для работы с Telegram Bot API
 * Соблюдает принцип Single Responsibility
 */

import type {
  TelegramConfig,
  TelegramSendResult,
  TelegramApiResponseType,
} from "./TelegramTypes";

/**
 * Базовый URL для Telegram Bot API
 */
const TELEGRAM_API_URL = "https://api.telegram.org/bot";

/**
 * Класс для работы с Telegram Bot API
 */
export class TelegramService {
  private readonly botToken: string;
  private readonly chatId: string;

  constructor(config: TelegramConfig) {
    if (!config.botToken || !config.chatId) {
      throw new Error("Telegram bot token и chat ID обязательны");
    }

    this.botToken = config.botToken;
    this.chatId = config.chatId;
  }

  /**
   * Отправляет сообщение в Telegram
   */
  async sendMessage(message: string): Promise<TelegramSendResult> {
    try {
      const url = `${TELEGRAM_API_URL}${this.botToken}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as TelegramApiResponseType;
        return {
          success: false,
          error: errorData.description || `HTTP ${response.status}`,
        };
      }

      const data = (await response.json()) as TelegramApiResponseType;

      if (!data.ok) {
        return {
          success: false,
          error: data.description || "Неизвестная ошибка",
        };
      }

      return {
        success: true,
        messageId: data.result?.message_id,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Неизвестная ошибка",
      };
    }
  }

  /**
   * Отправляет сообщение о победе с промокодом
   */
  async sendWinMessage(code: string): Promise<TelegramSendResult> {
    const message = `🎉 Победа! Промокод выдан: ${code}`;
    return this.sendMessage(message);
  }

  /**
   * Отправляет сообщение о проигрыше
   */
  async sendLoseMessage(): Promise<TelegramSendResult> {
    const message = "😊 Проигрыш";
    return this.sendMessage(message);
  }

  /**
   * Создает экземпляр сервиса из переменных окружения
   */
  static createFromEnv(): TelegramService {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      throw new Error(
        "TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID должны быть установлены в переменных окружения"
      );
    }

    return new TelegramService({
      botToken,
      chatId,
    });
  }
}

