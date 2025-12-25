/**
 * Компонент игрового Canvas
 * Соблюдает принцип Single Responsibility
 */

"use client";

import React, { useEffect, useRef } from "react";
import { useCanvas } from "@/hooks/useCanvas";
import { useGameLoop } from "@/hooks/useGameLoop";
import type { GameState } from "@/types/pixel-art-game.types";
import { CanvasRenderer } from "./CanvasRenderer";
import styles from "./GameCanvas.module.css";

export interface GameCanvasProps {
  readonly gameState: GameState;
  readonly onUpdate?: (deltaTime: number) => void;
  readonly enabled?: boolean;
}

/**
 * Компонент игрового Canvas
 */
export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  onUpdate,
  enabled = true,
}) => {
  const { canvasRef, getContext } = useCanvas({
    onInit: (canvas) => {
      // Canvas инициализирован
    },
  });

  const rendererRef = useRef<CanvasRenderer | null>(null);
  const canvasSizeRef = useRef({ width: 0, height: 0 });

  // Инициализация рендерера
  useEffect(() => {
    const ctx = getContext();
    if (!ctx) {
      return;
    }

    rendererRef.current = new CanvasRenderer(ctx);
  }, [getContext]);

  // Обновление размеров Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const updateSize = (): void => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvasSizeRef.current = {
        width: rect.width * dpr,
        height: rect.height * dpr,
      };

      canvas.width = canvasSizeRef.current.width;
      canvas.height = canvasSizeRef.current.height;

      const ctx = getContext();
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, [canvasRef, getContext]);

  // Игровой цикл
  useGameLoop({
    enabled,
    onUpdate: (deltaTime) => {
      if (onUpdate) {
        onUpdate(deltaTime);
      }

      // Рендеринг
      const renderer = rendererRef.current;
      const canvas = canvasRef.current;
      if (renderer && canvas && gameState.isGameStarted && !gameState.isPaused) {
        const { width, height } = canvasSizeRef.current;
        
        // Установка камеры на позицию игрока
        const cameraOffset = {
          x: -gameState.player.position.x * 32 + width / 2 / (window.devicePixelRatio || 1),
          y: -gameState.player.position.y * 32 + height / 2 / (window.devicePixelRatio || 1),
        };
        renderer.setCameraOffset(cameraOffset);

        renderer.render(gameState, width, height);
      }
    },
  });

  return (
    <canvas
      ref={canvasRef}
      className={styles.gameCanvas}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
};

