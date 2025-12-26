/**
 * Детектор коллизий
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import type { Position, GameItem, GameMap } from "@/types/pixel-art-game.types";
import { TileMap } from "../map/TileMap";

/**
 * Класс для проверки коллизий
 */
export class CollisionDetector {
  private readonly tileMap: TileMap;

  constructor(map: GameMap) {
    // Создаем копию массива для избежания проблем с readonly типами
    const tilesCopy = map.tiles.map(row => [...row]);
    this.tileMap = new TileMap(tilesCopy, map.width, map.height);
  }

  /**
   * Проверить, можно ли двигаться в указанную позицию
   */
  canMoveTo(position: Position): boolean {
    // Проверка границ карты
    if (
      position.x < 0 ||
      position.x >= this.tileMap.getWidth() ||
      position.y < 0 ||
      position.y >= this.tileMap.getHeight()
    ) {
      return false;
    }

    // Проверка проходимости тайла
    return this.tileMap.isWalkable(position);
  }

  /**
   * Проверить коллизию с предметом
   */
  checkItemCollision(playerPosition: Position, items: readonly GameItem[]): GameItem | null {
    for (const item of items) {
      if (item.collected) {
        continue;
      }

      if (this.isPositionEqual(playerPosition, item.position)) {
        return item;
      }
    }

    return null;
  }

  /**
   * Проверить, равны ли позиции
   */
  private isPositionEqual(pos1: Position, pos2: Position): boolean {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  }

  /**
   * Получить все предметы в радиусе
   */
  getItemsInRadius(
    center: Position,
    radius: number,
    items: readonly GameItem[]
  ): readonly GameItem[] {
    return items.filter((item) => {
      if (item.collected) {
        return false;
      }

      const distance = this.calculateDistance(center, item.position);
      return distance <= radius;
    });
  }

  /**
   * Рассчитать расстояние между двумя позициями
   */
  private calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Проверить, находится ли позиция в пределах карты
   */
  isWithinBounds(position: Position): boolean {
    return (
      position.x >= 0 &&
      position.x < this.tileMap.getWidth() &&
      position.y >= 0 &&
      position.y < this.tileMap.getHeight()
    );
  }
}

