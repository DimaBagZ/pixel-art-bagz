/**
 * Управление картой тайлов
 * Соблюдает принцип Single Responsibility
 */

import type { Position, Tile, TileType } from "@/types/pixel-art-game.types";
import { isWalkable } from "./TileTypes";

/**
 * Класс для работы с картой тайлов
 */
export class TileMap {
  private readonly tiles: Tile[][];
  private readonly width: number;
  private readonly height: number;

  constructor(tiles: Tile[][], width: number, height: number) {
    this.tiles = tiles;
    this.width = width;
    this.height = height;
  }

  /**
   * Получить тайл по позиции
   */
  getTile(position: Position): Tile | null {
    if (
      position.x < 0 ||
      position.x >= this.width ||
      position.y < 0 ||
      position.y >= this.height
    ) {
      return null;
    }

    return this.tiles[position.y]?.[position.x] || null;
  }

  /**
   * Получить тип тайла по позиции
   */
  getTileType(position: Position): TileType | null {
    const tile = this.getTile(position);
    return tile?.type || null;
  }

  /**
   * Проверить, можно ли ходить по позиции
   */
  isWalkable(position: Position): boolean {
    const tileType = this.getTileType(position);
    if (!tileType) {
      return false;
    }
    return isWalkable(tileType);
  }

  /**
   * Получить все тайлы
   */
  getAllTiles(): readonly Tile[][] {
    return this.tiles;
  }

  /**
   * Получить ширину карты
   */
  getWidth(): number {
    return this.width;
  }

  /**
   * Получить высоту карты
   */
  getHeight(): number {
    return this.height;
  }
}

