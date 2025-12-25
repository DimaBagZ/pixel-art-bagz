/**
 * Хук для игрового цикла
 * Управляет обновлением игры через requestAnimationFrame
 * Соблюдает принцип Single Responsibility
 */

import { useEffect, useRef, useCallback } from "react";

export interface UseGameLoopOptions {
  readonly enabled?: boolean;
  readonly onUpdate: (deltaTime: number) => void;
  readonly fps?: number; // Ограничение FPS (опционально)
}

export interface UseGameLoopReturn {
  readonly isRunning: boolean;
  readonly start: () => void;
  readonly stop: () => void;
  readonly pause: () => void;
  readonly resume: () => void;
}

/**
 * Хук для игрового цикла
 */
export const useGameLoop = (options: UseGameLoopOptions): UseGameLoopReturn => {
  const { enabled = true, onUpdate, fps } = options;
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const isPausedRef = useRef<boolean>(false);
  const isRunningRef = useRef<boolean>(false);

  /**
   * Игровой цикл
   */
  const gameLoop = useCallback(
    (currentTime: number): void => {
      if (!enabled || isPausedRef.current) {
        return;
      }

      // Расчет deltaTime
      const deltaTime =
        lastTimeRef.current !== null
          ? (currentTime - lastTimeRef.current) / 1000 // в секундах
          : 0;

      lastTimeRef.current = currentTime;

      // Ограничение FPS
      if (fps && deltaTime < 1 / fps) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Обновление игры
      onUpdate(deltaTime);

      // Следующий кадр
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    },
    [enabled, onUpdate, fps]
  );

  /**
   * Запуск игрового цикла
   */
  const start = useCallback((): void => {
    if (isRunningRef.current) {
      return;
    }

    isRunningRef.current = true;
    isPausedRef.current = false;
    lastTimeRef.current = null;
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  /**
   * Остановка игрового цикла
   */
  const stop = useCallback((): void => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isRunningRef.current = false;
    isPausedRef.current = false;
    lastTimeRef.current = null;
  }, []);

  /**
   * Пауза игрового цикла
   */
  const pause = useCallback((): void => {
    isPausedRef.current = true;
  }, []);

  /**
   * Возобновление игрового цикла
   */
  const resume = useCallback((): void => {
    if (!isRunningRef.current) {
      start();
      return;
    }
    isPausedRef.current = false;
    lastTimeRef.current = null; // Сброс времени для избежания большого deltaTime
  }, [start]);

  // Автозапуск при включении
  useEffect(() => {
    if (enabled && !isRunningRef.current) {
      start();
    } else if (!enabled && isRunningRef.current) {
      stop();
    }

    return () => {
      stop();
    };
  }, [enabled, start, stop]);

  return {
    isRunning: isRunningRef.current,
    start,
    stop,
    pause,
    resume,
  };
};

