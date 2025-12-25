/**
 * API Route для отправки сообщений в Telegram
 * Соблюдает принцип Single Responsibility
 * Включает rate limiting, валидацию и безопасную обработку ошибок
 */

import { NextRequest, NextResponse } from "next/server";
import { TelegramService } from "@/services/telegram";
import type { TelegramSendMessageRequest } from "@/types/api.types";
import { telegramRateLimiter } from "@/utils/rateLimiter";
import {
  validateTelegramMessage,
  validatePromoCode,
  sanitizeString,
} from "@/utils/validators";
import {
  handleApiError,
  createValidationError,
  createRateLimitError,
} from "@/utils/errorHandler";
import { logError, logInfo, logWarn } from "@/utils/logger";

/**
 * Получает IP адрес из запроса
 * @param request - Next.js request объект
 * @returns IP адрес или 'unknown'
 */
function getClientIp(request: NextRequest): string {
  // Проверяем различные заголовки для получения IP
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

/**
 * POST endpoint для отправки сообщений в Telegram
 */
export async function POST(request: NextRequest) {
  try {
    // Валидация метода
    if (request.method !== "POST") {
      return NextResponse.json(
        { success: false, error: "Метод не разрешен" },
        { status: 405 }
      );
    }

    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = telegramRateLimiter.checkLimit(clientIp);

    if (!rateLimitResult.allowed) {
      logWarn("Rate limit exceeded", { ip: clientIp });
      const errorResponse = createRateLimitError(rateLimitResult.resetTime);
      return NextResponse.json(errorResponse, {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(rateLimitResult.resetTime).toISOString(),
          "Retry-After": Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ).toString(),
        },
      });
    }

    // Парсинг тела запроса
    let body: TelegramSendMessageRequest;
    try {
      body = (await request.json()) as TelegramSendMessageRequest;
    } catch {
      return NextResponse.json(
        createValidationError("Неверный формат JSON"),
        { status: 400 }
      );
    }

    // Валидация и санитизация данных
    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json(
        createValidationError("Поле 'message' обязательно и должно быть строкой"),
        { status: 400 }
      );
    }

    // Санитизация сообщения
    const sanitizedMessage = sanitizeString(body.message);
    const messageValidation = validateTelegramMessage(sanitizedMessage);

    if (!messageValidation.isValid) {
      return NextResponse.json(
        createValidationError(messageValidation.error || "Ошибка валидации сообщения"),
        { status: 400 }
      );
    }

    // Валидация промокода, если он есть
    if (body.code) {
      const codeValidation = validatePromoCode(body.code);
      if (!codeValidation.isValid) {
        return NextResponse.json(
          createValidationError(codeValidation.error || "Ошибка валидации промокода"),
          { status: 400 }
        );
      }
    }

    // Создание сервиса
    let telegramService: TelegramService;
    try {
      telegramService = TelegramService.createFromEnv();
    } catch (error) {
      logError(error, "Telegram service configuration");
      const errorResponse = handleApiError(error, "Telegram service configuration");
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Отправка сообщения
    let result;
    try {
      if (body.code) {
        // Отправка сообщения о победе с промокодом
        result = await telegramService.sendWinMessage(body.code);
      } else {
        // Отправка обычного сообщения
        result = await telegramService.sendMessage(sanitizedMessage);
      }
    } catch (error) {
      logError(error, "Telegram message sending");
      const errorResponse = handleApiError(error, "Telegram message sending");
      return NextResponse.json(errorResponse, { status: 500 });
    }

    if (!result.success) {
      logError(new Error(result.error), "Telegram API error");
      const errorResponse = handleApiError(
        new Error(result.error || "Ошибка отправки сообщения"),
        "Telegram API"
      );
      return NextResponse.json(errorResponse, { status: 500 });
    }

    logInfo("Telegram message sent successfully", {
      messageId: result.messageId,
      hasCode: !!body.code,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Сообщение отправлено успешно",
        messageId: result.messageId,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimitResult.resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    logError(error, "API Route unexpected error");
    const errorResponse = handleApiError(error, "API Route");
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
