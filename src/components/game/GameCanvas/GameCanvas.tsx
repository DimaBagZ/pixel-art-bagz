/**
 * Компонент игрового Canvas
 * Полностью изолирован от React ререндеров через memo
 */

"use client";

import React, { useEffect, useRef, useCallback, memo } from "react";
import { useCanvas } from "@/hooks/useCanvas";
import type { GameState } from "@/types/pixel-art-game.types";
import { CanvasRenderer } from "./CanvasRenderer";
import styles from "./GameCanvas.module.css";

export interface GameCanvasProps {
  readonly getGameState: () => GameState;
  readonly onUpdate?: (deltaTime: number) => void;
  readonly enabled?: boolean;
}

/**
 * Внутренний компонент Canvas
 */
const GameCanvasInner: React.FC<GameCanvasProps> = ({
  getGameState,
  onUpdate,
  enabled = true,
}) => {
  const { canvasRef, getContext } = useCanvas({
    onInit: () => {},
  });

  const rendererRef = useRef<CanvasRenderer | null>(null);
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Refs для доступа в игровом цикле без зависимостей
  const getGameStateRef = useRef(getGameState);
  const onUpdateRef = useRef(onUpdate);
  const enabledRef = useRef(enabled);

  // Обновляем refs при каждом рендере
  getGameStateRef.current = getGameState;
  onUpdateRef.current = onUpdate;
  enabledRef.current = enabled;

  // Инициализация рендерера (один раз)
  useEffect(() => {
    const ctx = getContext();
    if (ctx && !rendererRef.current) {
      rendererRef.current = new CanvasRenderer(ctx);
    }
  }, [getContext]);

  // Обновление размеров Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = (): void => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = window.devicePixelRatio || 1;
      const width = rect.width * dpr;
      const height = rect.height * dpr;

      if (
        canvasSizeRef.current.width !== width ||
        canvasSizeRef.current.height !== height
      ) {
        canvasSizeRef.current = { width, height };
        canvas.width = width;
        canvas.height = height;

        const ctx = getContext();
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(dpr, dpr);
          ctx.imageSmoothingEnabled = false;
        }
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, [canvasRef, getContext]);

  // Функция рендеринга (стабильная)
  const performRender = useCallback((): void => {
    const renderer = rendererRef.current;
    const canvas = canvasRef.current;
    if (!renderer || !canvas) return;

    const { width, height } = canvasSizeRef.current;
    if (width <= 0 || height <= 0) return;

    const state = getGameStateRef.current();
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = width / dpr;
    const logicalHeight = height / dpr;

    if (state.isGameStarted && !state.isPaused) {
      const cameraOffset = {
        x: -state.player.position.x + logicalWidth / 2,
        y: -state.player.position.y + logicalHeight / 2,
      };
      renderer.setCameraOffset(cameraOffset);
      renderer.render(state, logicalWidth, logicalHeight);
    } else {
      const ctx = getContext();
      if (ctx) {
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);
      }
    }
  }, [canvasRef, getContext]);

  // Игровой цикл (запускается один раз)
  useEffect(() => {
    let isRunning = true;

    const gameLoop = (currentTime: number): void => {
      if (!isRunning) return;

      const state = getGameStateRef.current();
      const isActive = enabledRef.current && state.isGameStarted && !state.isPaused;

      // Расчёт deltaTime
      let deltaTime = 0;
      if (lastTimeRef.current !== null) {
        deltaTime = (currentTime - lastTimeRef.current) / 1000;
        if (deltaTime > 0.1) deltaTime = 0.016;
      }
      lastTimeRef.current = currentTime;

      // Обновление игры
      if (isActive && deltaTime > 0 && onUpdateRef.current) {
        onUpdateRef.current(deltaTime);
      }

      // Рендеринг
      performRender();

      // Следующий кадр
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = null;
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [performRender]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.gameCanvas}
      tabIndex={0}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        outline: "none",
      }}
      onMouseDown={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};

/**
 * Мемоизированный GameCanvas - никогда не ререндерится
 * Все данные читаются через refs и getGameState
 */
export const GameCanvas = memo(GameCanvasInner, () => {
  // Всегда возвращаем true = props не изменились = не ререндерить
  return true;
});

GameCanvas.displayName = "GameCanvas";
