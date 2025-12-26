/**
 * Хук для игрового цикла
 * Управляет обновлением игры через requestAnimationFrame
 * Оптимизирован для стабильной работы без мерцания
 */

import { useEffect, useRef, useCallback } from "react";

export interface UseGameLoopOptions {
  readonly enabled?: boolean;
  readonly onUpdate: (deltaTime: number) => void;
  readonly fps?: number;
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
  const enabledRef = useRef(enabled);
  const fpsRef = useRef(fps);
  
  // Сохраняем onUpdate в ref чтобы избежать пересоздания gameLoop
  const onUpdateRef = useRef(onUpdate);
  
  // Обновляем refs при изменении пропсов
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);
  
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  
  useEffect(() => {
    fpsRef.current = fps;
  }, [fps]);

  /**
   * Игровой цикл (стабильный, не пересоздаётся)
   */
  const gameLoop = useCallback((currentTime: number): void => {
    if (!enabledRef.current || isPausedRef.current || !isRunningRef.current) {
      return;
    }

    // Расчет deltaTime
    let deltaTime = 0;
    if (lastTimeRef.current !== null) {
      deltaTime = (currentTime - lastTimeRef.current) / 1000;
      
      // Защита от слишком больших deltaTime (например после паузы)
      if (deltaTime > 0.1) {
        deltaTime = 0.016; // ~60fps
      }
    }
    lastTimeRef.current = currentTime;

    // Ограничение FPS
    const currentFps = fpsRef.current;
    if (currentFps && deltaTime > 0 && deltaTime < 1 / currentFps) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // Обновление игры через ref
    if (onUpdateRef.current && deltaTime > 0) {
      onUpdateRef.current(deltaTime);
    }

    // Следующий кадр
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, []); // Пустые зависимости - функция стабильная

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
    lastTimeRef.current = null;
  }, [start]);

  // Автозапуск/остановка при изменении enabled
  useEffect(() => {
    if (enabled) {
      if (!isRunningRef.current) {
        start();
      }
    } else {
      if (isRunningRef.current) {
        stop();
      }
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
