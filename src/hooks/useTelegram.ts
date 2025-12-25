/**
 * Hook для работы с Telegram API
 * Соблюдает принцип Single Responsibility
 */

import { useState, useCallback } from "react";
import type { TelegramSendMessageRequest } from "@/types/api.types";

export interface UseTelegramReturn {
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly sendWinMessage: (code: string) => Promise<boolean>;
  readonly sendLoseMessage: () => Promise<boolean>;
}

/**
 * Hook для работы с Telegram
 */
export const useTelegram = (): UseTelegramReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Отправка сообщения через API
   */
  const sendMessage = useCallback(
    async (request: TelegramSendMessageRequest): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/telegram", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          throw new Error(errorData.error || "Ошибка отправки сообщения");
        }

        const data = (await response.json()) as { success?: boolean };
        return data.success === true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Неизвестная ошибка";
        setError(errorMessage);
        console.error("Ошибка отправки в Telegram:", errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Отправка сообщения о победе с промокодом
   */
  const sendWinMessage = useCallback(
    async (code: string): Promise<boolean> => {
      return sendMessage({
        message: `Победа! Промокод выдан: ${code}`,
        code,
      });
    },
    [sendMessage]
  );

  /**
   * Отправка сообщения о проигрыше
   */
  const sendLoseMessage = useCallback(async (): Promise<boolean> => {
    return sendMessage({
      message: "Проигрыш",
    });
  }, [sendMessage]);

  return {
    isLoading,
    error,
    sendWinMessage,
    sendLoseMessage,
  };
};

