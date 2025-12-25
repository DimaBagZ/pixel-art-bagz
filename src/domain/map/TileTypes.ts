/**
 * Типы тайлов карты
 */

import { TileType } from "@/types/pixel-art-game.types";

/**
 * Константы для типов тайлов
 */
export const TILE_TYPES = {
  FLOOR: TileType.FLOOR,
  WALL: TileType.WALL,
  OBSTACLE: TileType.OBSTACLE,
} as const;

/**
 * Проверка, можно ли ходить по тайлу
 */
export function isWalkable(tileType: TileType): boolean {
  return tileType === TileType.FLOOR;
}

