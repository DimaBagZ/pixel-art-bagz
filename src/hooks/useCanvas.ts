/**
 * Хук для работы с Canvas
 * Управляет Canvas элементом и его контекстом
 * Соблюдает принцип Single Responsibility
 */

import { useRef, useEffect, useCallback } from "react";

export interface UseCanvasOptions {
  readonly width?: number;
  readonly height?: number;
  readonly onInit?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
}

export interface UseCanvasReturn {
  readonly canvasRef: React.RefObject<HTMLCanvasElement>;
  readonly getContext: () => CanvasRenderingContext2D | null;
  readonly resize: (width: number, height: number) => void;
}

/**
 * Хук для работы с Canvas
 */
export const useCanvas = (options?: UseCanvasOptions): UseCanvasReturn => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  /**
   * Инициализация Canvas
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // Получение контекста
    const ctx = canvas.getContext("2d", {
      alpha: false, // Отключаем прозрачность для производительности
      desynchronized: true, // Оптимизация для производительности
    });

    if (!ctx) {
      console.error("Не удалось получить контекст Canvas");
      return;
    }

    contextRef.current = ctx;

    // Установка размеров
    if (options?.width && options?.height) {
      canvas.width = options.width;
      canvas.height = options.height;
    } else {
      // Использование размеров элемента
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    // Настройка рендеринга для пиксель-арта
    ctx.imageSmoothingEnabled = false; // Отключаем сглаживание для пиксель-арта

    // Вызов колбэка инициализации
    if (options?.onInit) {
      options.onInit(canvas, ctx);
    }
  }, [options]);

  /**
   * Получить контекст Canvas
   */
  const getContext = useCallback((): CanvasRenderingContext2D | null => {
    return contextRef.current;
  }, []);

  /**
   * Изменить размер Canvas
   */
  const resize = useCallback(
    (width: number, height: number): void => {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      if (!canvas || !ctx) {
        return;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = false;
    },
    []
  );

  return {
    canvasRef,
    getContext,
    resize,
  };
};

