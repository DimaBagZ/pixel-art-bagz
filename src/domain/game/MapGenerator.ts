/**
 * Генератор карты для игры
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import type { Position, Tile, GameMap } from "@/types/pixel-art-game.types";
import { TileType } from "@/types/pixel-art-game.types";
import { GAME_CONFIG } from "@/utils/pixel-art-constants";

/**
 * Класс для генерации карты
 */
export class MapGenerator {
  private readonly width: number;
  private readonly height: number;

  constructor(
    width: number = GAME_CONFIG.MAP_WIDTH,
    height: number = GAME_CONFIG.MAP_HEIGHT
  ) {
    this.width = width;
    this.height = height;
  }

  /**
   * Генерировать карту
   */
  generateMap(): GameMap {
    const tiles = this.generateTiles();

    return {
      width: this.width,
      height: this.height,
      tiles,
    };
  }

  /**
   * Генерировать тайлы карты
   */
  private generateTiles(): Tile[][] {
    const tiles: Tile[][] = [];

    for (let y = 0; y < this.height; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < this.width; x++) {
        const tileType = this.determineTileType(x, y);
        row.push({
          type: tileType,
          position: { x, y },
        });
      }
      tiles.push(row);
    }

    return tiles;
  }

  /**
   * Определить тип тайла на основе позиции
   */
  private determineTileType(x: number, y: number): TileType {
    // Границы карты - стены
    if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
      return TileType.WALL;
    }

    // Случайные препятствия (10% вероятность)
    if (Math.random() < 0.1) {
      return TileType.OBSTACLE;
    }

    // Остальное - пол
    return TileType.FLOOR;
  }

  /**
   * Валидация карты
   */
  validateMap(map: GameMap): boolean {
    // Проверка размеров
    if (map.width !== this.width || map.height !== this.height) {
      return false;
    }

    // Проверка наличия тайлов
    if (map.tiles.length !== this.height) {
      return false;
    }

    for (let y = 0; y < this.height; y++) {
      if (map.tiles[y].length !== this.width) {
        return false;
      }
    }

    // Проверка наличия проходимых тайлов (должен быть хотя бы один)
    let hasWalkableTile = false;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (map.tiles[y][x].type === TileType.FLOOR) {
          hasWalkableTile = true;
          break;
        }
      }
      if (hasWalkableTile) {
        break;
      }
    }

    return hasWalkableTile;
  }

  /**
   * Получить случайную позицию на полу
   */
  getRandomFloorPosition(map: GameMap): Position | null {
    const floorPositions: Position[] = [];

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (map.tiles[y][x].type === TileType.FLOOR) {
          floorPositions.push({ x, y });
        }
      }
    }

    if (floorPositions.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * floorPositions.length);
    return floorPositions[randomIndex] || null;
  }
}
