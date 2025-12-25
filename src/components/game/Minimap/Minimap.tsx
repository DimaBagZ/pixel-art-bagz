/**
 * Компонент мини-карты
 * Соблюдает принцип Single Responsibility
 */

"use client";

import React, { useEffect, useRef } from "react";
import type { GameState } from "@/types/pixel-art-game.types";
import { ItemType, TileType } from "@/types/pixel-art-game.types";
import styles from "./Minimap.module.css";

export interface MinimapProps {
  readonly gameState: GameState;
  readonly size?: number;
}

/**
 * Компонент мини-карты
 */
export const Minimap: React.FC<MinimapProps> = ({
  gameState,
  size = 200,
}) => {
  const { map, player, items } = gameState;
  const tileSize = size / Math.max(map.width, map.height);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Рендеринг мини-карты на Canvas
   */
  const renderMinimap = (ctx: CanvasRenderingContext2D): void => {
    // Очистка
    ctx.fillStyle = "var(--color-background)";
    ctx.fillRect(0, 0, size, size);

    // Рендеринг карты
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.tiles[y]?.[x];
        if (!tile) {
          continue;
        }

        const screenX = x * tileSize;
        const screenY = y * tileSize;

        switch (tile.type) {
          case TileType.FLOOR:
            ctx.fillStyle = "var(--color-surface)";
            break;
          case TileType.WALL:
            ctx.fillStyle = "var(--color-surface-dark)";
            break;
          case TileType.OBSTACLE:
            ctx.fillStyle = "var(--color-accent)";
            break;
        }

        ctx.fillRect(screenX, screenY, tileSize, tileSize);
      }
    }

    // Рендеринг несобранных предметов
    for (const item of items) {
      if (item.collected) {
        continue;
      }

      const screenX = item.position.x * tileSize;
      const screenY = item.position.y * tileSize;

      ctx.fillStyle =
        item.type === ItemType.COIN
          ? "var(--color-primary)"
          : item.type === ItemType.POTION
          ? "var(--color-error)"
          : "var(--color-accent-light)";

      ctx.beginPath();
      ctx.arc(
        screenX + tileSize / 2,
        screenY + tileSize / 2,
        tileSize / 3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Рендеринг персонажа
    const playerX = player.position.x * tileSize;
    const playerY = player.position.y * tileSize;

    ctx.fillStyle = "var(--color-success)";
    ctx.beginPath();
    ctx.arc(
      playerX + tileSize / 2,
      playerY + tileSize / 2,
      tileSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Обводка персонажа
    ctx.strokeStyle = "var(--color-text-light)";
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // Обновление мини-карты при изменении состояния
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.imageSmoothingEnabled = false;
    renderMinimap(ctx);
  }, [gameState, size, tileSize, map, player, items]);

  return (
    <div className={styles.minimap} style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className={styles.minimap__canvas}
      />
      <div className={styles.minimap__label}>Карта</div>
    </div>
  );
};
