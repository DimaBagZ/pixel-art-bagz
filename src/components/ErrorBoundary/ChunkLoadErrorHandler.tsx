/**
 * Компонент для обработки ошибок загрузки chunks
 * Автоматически перезагружает страницу при ChunkLoadError
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

"use client";

import React, { useEffect } from "react";

/**
 * Обработчик ошибок загрузки chunks
 */
export const ChunkLoadErrorHandler: React.FC = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent): void => {
      const error = event.error;
      const message = error?.message || event.message || "";

      // Проверяем, является ли это ошибкой загрузки chunk
      if (
        message.includes("ChunkLoadError") ||
        message.includes("Failed to fetch dynamically imported module") ||
        message.includes("Loading chunk") ||
        error?.name === "ChunkLoadError"
      ) {
        console.warn("Обнаружена ошибка загрузки chunk, перезагружаем страницу...");

        // Перезагружаем страницу через небольшую задержку
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
      const reason = event.reason;
      const message = typeof reason === "string" ? reason : reason?.message || "";

      // Проверяем, является ли это ошибкой загрузки chunk
      if (
        message.includes("ChunkLoadError") ||
        message.includes("Failed to fetch dynamically imported module") ||
        message.includes("Loading chunk")
      ) {
        console.warn(
          "Обнаружена ошибка загрузки chunk в Promise, перезагружаем страницу..."
        );

        // Перезагружаем страницу через небольшую задержку
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
};
