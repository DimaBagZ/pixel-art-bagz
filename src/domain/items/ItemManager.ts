/**
 * Менеджер предметов на карте
 * Управляет предметами и их состоянием
 * Соблюдает принцип Single Responsibility
 */

import type { GameItem, Position } from "@/types/pixel-art-game.types";
import { ItemType } from "@/types/pixel-art-game.types";

/**
 * Класс для управления предметами
 */
export class ItemManager {
  private items: GameItem[];

  constructor(initialItems: readonly GameItem[] = []) {
    this.items = [...initialItems];
  }

  /**
   * Получить все предметы
   */
  getAllItems(): readonly GameItem[] {
    return [...this.items];
  }

  /**
   * Получить несобранные предметы
   */
  getUncollectedItems(): readonly GameItem[] {
    return this.items.filter((item) => !item.collected);
  }

  /**
   * Получить предмет по ID
   */
  getItemById(itemId: string): GameItem | null {
    return this.items.find((item) => item.id === itemId) || null;
  }

  /**
   * Получить предметы по типу
   */
  getItemsByType(type: ItemType): readonly GameItem[] {
    return this.items.filter((item) => item.type === type);
  }

  /**
   * Получить предметы на позиции
   */
  getItemsAtPosition(position: Position): readonly GameItem[] {
    return this.items.filter(
      (item) =>
        !item.collected &&
        item.position.x === position.x &&
        item.position.y === position.y
    );
  }

  /**
   * Добавить предмет
   */
  addItem(item: GameItem): void {
    // Проверка на дубликаты
    if (this.items.some((existingItem) => existingItem.id === item.id)) {
      return;
    }

    this.items.push(item);
  }

  /**
   * Удалить предмет
   */
  removeItem(itemId: string): boolean {
    const index = this.items.findIndex((item) => item.id === itemId);
    if (index === -1) {
      return false;
    }

    this.items.splice(index, 1);
    return true;
  }

  /**
   * Отметить предмет как собранный
   */
  markAsCollected(itemId: string): boolean {
    const item = this.getItemById(itemId);
    if (!item || item.collected) {
      return false;
    }

    const index = this.items.findIndex((i) => i.id === itemId);
    if (index === -1) {
      return false;
    }

    this.items[index] = {
      ...this.items[index],
      collected: true,
    };

    return true;
  }

  /**
   * Получить количество несобранных предметов
   */
  getUncollectedCount(): number {
    return this.items.filter((item) => !item.collected).length;
  }

  /**
   * Получить количество предметов по типу
   */
  getCountByType(type: ItemType): number {
    return this.items.filter((item) => item.type === type).length;
  }

  /**
   * Получить количество собранных предметов по типу
   */
  getCollectedCountByType(type: ItemType): number {
    return this.items.filter((item) => item.type === type && item.collected).length;
  }
}

