/**
 * Валидатор инвентаря
 * Проверяет операции с инвентарем
 * Соблюдает принцип Single Responsibility
 */

import type { InventorySlot, GameItem } from "@/types/pixel-art-game.types";
import { GAME_CONFIG } from "@/utils/pixel-art-constants";
import { goesToInventory } from "../items/ItemTypes";

/**
 * Класс для валидации операций с инвентарем
 */
export class InventoryValidator {
  /**
   * Валидировать структуру инвентаря
   */
  static validateInventoryStructure(inventory: readonly InventorySlot[]): boolean {
    // Проверка размера
    if (inventory.length !== GAME_CONFIG.INVENTORY_SIZE) {
      return false;
    }

    // Проверка индексов
    for (let i = 0; i < inventory.length; i++) {
      if (inventory[i].index !== i) {
        return false;
      }
    }

    return true;
  }

  /**
   * Проверить, можно ли добавить предмет в инвентарь
   */
  static canAddItem(
    item: GameItem,
    inventory: readonly InventorySlot[]
  ): { canAdd: boolean; reason?: string } {
    // Проверка типа предмета
    if (!goesToInventory(item.type)) {
      return {
        canAdd: false,
        reason: "Этот тип предмета не может быть добавлен в инвентарь",
      };
    }

    // Проверка наличия свободных слотов
    const freeSlots = inventory.filter((slot) => slot.item === null);
    if (freeSlots.length === 0) {
      return {
        canAdd: false,
        reason: "Инвентарь полон",
      };
    }

    // Проверка на дубликаты (опционально, можно разрешить)
    const existingItem = inventory.find((slot) => slot.item?.id === item.id);
    if (existingItem) {
      return {
        canAdd: false,
        reason: "Предмет уже есть в инвентаре",
      };
    }

    return { canAdd: true };
  }

  /**
   * Проверить, можно ли удалить предмет из инвентаря
   */
  static canRemoveItem(
    slotIndex: number,
    inventory: readonly InventorySlot[]
  ): { canRemove: boolean; reason?: string } {
    // Проверка границ
    if (slotIndex < 0 || slotIndex >= inventory.length) {
      return {
        canRemove: false,
        reason: "Неверный индекс слота",
      };
    }

    // Проверка наличия предмета
    if (inventory[slotIndex].item === null) {
      return {
        canRemove: false,
        reason: "Слот пуст",
      };
    }

    return { canRemove: true };
  }

  /**
   * Валидировать предмет
   */
  static validateItem(item: GameItem | null): boolean {
    if (item === null) {
      return true; // Пустой слот валиден
    }

    // Проверка обязательных полей
    if (!item.id || !item.type || !item.position) {
      return false;
    }

    // Проверка позиции
    if (
      typeof item.position.x !== "number" ||
      typeof item.position.y !== "number" ||
      item.position.x < 0 ||
      item.position.y < 0
    ) {
      return false;
    }

    return true;
  }
}

