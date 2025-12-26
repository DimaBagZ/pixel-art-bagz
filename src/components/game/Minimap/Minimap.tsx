/**
 * Компонент мини-карты (DOOM-style)
 */

"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type { GameState } from "@/types/pixel-art-game.types";
import { ItemType, TileType } from "@/types/pixel-art-game.types";
import { GAME_CONFIG } from "@/utils/pixel-art-constants";
import styles from "./Minimap.module.css";

export interface MinimapProps {
  readonly gameState: GameState;
  readonly size?: number;
}

// Цвета для мини-карты
const MINIMAP_COLORS = {
  floor: "#2d2d2d",
  floorLight: "#3d3d3d",
  wall: "#1a1a1a",
  obstacle: "#4a3520",
  door: "#8b4513",
  doorOpen: "#3d3d3d",
  doorWide: "#2a4a6a",
  doorWideOpen: "#1a3a5a",
  treasureDoor: "#6a5a2a",
  treasureDoorOpen: "#4a4a2a",
  terminal: "#00ff88",
  exit: "#00ff41",
  player: "#00ff41",
  playerGlow: "rgba(0, 255, 65, 0.3)",
  coin: "#ffd700",
  potion: "#ff3333",
  staminaPotion: "#00ff66",
  rare: "#9966ff",
  background: "#0a0a0a",
  border: "#ffd700",
};

/**
 * Компонент мини-карты
 */
export const Minimap: React.FC<MinimapProps> = ({
  gameState,
  size = 200,
}) => {
  const { map, player, items } = gameState;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Вычисляем размер увеличенной карты (реактивно)
  const [expandedSize, setExpandedSize] = useState(() => {
    if (typeof window !== "undefined") {
      return Math.min(window.innerWidth * 0.9, window.innerHeight * 0.7, 600);
    }
    return 600;
  });

  // Обновляем размер при изменении окна
  useEffect(() => {
    const updateSize = (): void => {
      if (typeof window !== "undefined") {
        const newSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.7, 600);
        setExpandedSize(newSize);
      }
    };

    window.addEventListener("resize", updateSize);
    updateSize(); // Вызываем сразу для правильного начального размера

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  /**
   * Рендеринг мини-карты на Canvas
   */
  const renderMinimap = (ctx: CanvasRenderingContext2D, renderSize: number): void => {
    const renderTileSize = renderSize / Math.max(map.width, map.height);
    
    // Очистка
    ctx.fillStyle = MINIMAP_COLORS.background;
    ctx.fillRect(0, 0, renderSize, renderSize);

    // Рендеринг карты
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.tiles[y]?.[x];
        if (!tile) {
          continue;
        }

        const screenX = x * renderTileSize;
        const screenY = y * renderTileSize;

        switch (tile.type) {
          case TileType.FLOOR:
            ctx.fillStyle = MINIMAP_COLORS.floor;
            break;
          case TileType.FLOOR_LIGHT:
            ctx.fillStyle = MINIMAP_COLORS.floorLight;
            break;
          case TileType.WALL:
            ctx.fillStyle = MINIMAP_COLORS.wall;
            break;
          case TileType.OBSTACLE:
            ctx.fillStyle = MINIMAP_COLORS.obstacle;
            break;
          case TileType.DOOR:
            ctx.fillStyle = MINIMAP_COLORS.door;
            break;
          case TileType.DOOR_OPEN:
            ctx.fillStyle = MINIMAP_COLORS.doorOpen;
            break;
          case TileType.DOOR_WIDE:
            ctx.fillStyle = MINIMAP_COLORS.doorWide;
            break;
          case TileType.DOOR_WIDE_OPEN:
            ctx.fillStyle = MINIMAP_COLORS.doorWideOpen;
            break;
          case TileType.TREASURE_DOOR:
            ctx.fillStyle = MINIMAP_COLORS.treasureDoor;
            break;
          case TileType.TREASURE_DOOR_OPEN:
            ctx.fillStyle = MINIMAP_COLORS.treasureDoorOpen;
            break;
          case TileType.TERMINAL:
            ctx.fillStyle = MINIMAP_COLORS.terminal;
            break;
          case TileType.EXIT:
            ctx.fillStyle = MINIMAP_COLORS.exit;
            break;
          default:
            ctx.fillStyle = MINIMAP_COLORS.background;
        }

        ctx.fillRect(screenX, screenY, renderTileSize, renderTileSize);
        
        // Дополнительная отрисовка особых тайлов
        if (tile.type === TileType.EXIT) {
          ctx.fillStyle = "rgba(0, 255, 65, 0.5)";
          ctx.beginPath();
          ctx.arc(screenX + renderTileSize / 2, screenY + renderTileSize / 2, renderTileSize / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (tile.type === TileType.TERMINAL) {
          ctx.fillStyle = "rgba(0, 255, 136, 0.5)";
          ctx.beginPath();
          ctx.arc(screenX + renderTileSize / 2, screenY + renderTileSize / 2, renderTileSize / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (tile.type === TileType.TREASURE_DOOR) {
          ctx.fillStyle = "rgba(255, 170, 0, 0.5)";
          ctx.beginPath();
          ctx.arc(screenX + renderTileSize / 2, screenY + renderTileSize / 2, renderTileSize / 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Рендеринг несобранных предметов (позиции в пикселях)
    for (const item of items) {
      if (item.collected) {
        continue;
      }

      // Конвертируем пиксельную позицию в позицию на мини-карте
      const screenX = (item.position.x / GAME_CONFIG.TILE_SIZE) * renderTileSize;
      const screenY = (item.position.y / GAME_CONFIG.TILE_SIZE) * renderTileSize;

      ctx.fillStyle =
        item.type === ItemType.COIN
          ? MINIMAP_COLORS.coin
          : item.type === ItemType.POTION
          ? MINIMAP_COLORS.potion
          : item.type === ItemType.STAMINA_POTION
          ? MINIMAP_COLORS.staminaPotion
          : MINIMAP_COLORS.rare;

      ctx.beginPath();
      ctx.arc(screenX, screenY, renderTileSize / 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Рендеринг персонажа (позиция в пикселях)
    const playerX = (player.position.x / GAME_CONFIG.TILE_SIZE) * renderTileSize;
    const playerY = (player.position.y / GAME_CONFIG.TILE_SIZE) * renderTileSize;

    // Свечение игрока
    const gradient = ctx.createRadialGradient(playerX, playerY, 0, playerX, playerY, renderTileSize * 2);
    gradient.addColorStop(0, MINIMAP_COLORS.playerGlow);
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fillRect(playerX - renderTileSize * 2, playerY - renderTileSize * 2, renderTileSize * 4, renderTileSize * 4);

    // Тело игрока
    ctx.fillStyle = MINIMAP_COLORS.player;
    ctx.beginPath();
    ctx.arc(playerX, playerY, renderTileSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Направление взгляда (угол)
    const angle = (player.angle * Math.PI) / 180;
    const dirLength = renderTileSize * 1.5;
    ctx.strokeStyle = MINIMAP_COLORS.player;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playerX, playerY);
    ctx.lineTo(
      playerX + Math.cos(angle) * dirLength,
      playerY + Math.sin(angle) * dirLength
    );
    ctx.stroke();

    // Обводка персонажа
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(playerX, playerY, renderTileSize / 2, 0, Math.PI * 2);
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
    const currentSize = isExpanded ? expandedSize : size;
    renderMinimap(ctx, currentSize);
  }, [gameState, size, map, player, items, isExpanded, expandedSize]);

  const handleToggleExpand = useCallback((): void => {
    setIsExpanded((prev) => !prev);
  }, []);

  const currentSize = isExpanded ? expandedSize : size;

  return (
    <>
      <div 
        className={`${styles.minimap} ${isExpanded ? styles.minimap__expanded : ""}`}
        style={!isExpanded ? { width: currentSize, height: currentSize } : undefined}
        onClick={handleToggleExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggleExpand();
          }
        }}
        aria-label={isExpanded ? "Уменьшить карту" : "Увеличить карту"}
      >
        <canvas
          ref={canvasRef}
          width={currentSize}
          height={currentSize}
          className={styles.minimap__canvas}
        />
        <div className={styles.minimap__label}>
          {isExpanded ? "Нажмите чтобы уменьшить" : "Нажмите чтобы увеличить"}
        </div>
      </div>
      {isExpanded && (
        <div 
          className={styles.minimap__overlay}
          onClick={handleToggleExpand}
          aria-label="Закрыть карту"
        />
      )}
    </>
  );
};
