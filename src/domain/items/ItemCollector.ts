/**
 * Система сбора предметов
 * Обрабатывает логику сбора разных типов предметов
 * Соблюдает принцип Single Responsibility
 */

import type {
  GameItem,
  Position,
  ItemCollectionResult,
  InventorySlot,
} from "@/types/pixel-art-game.types";
import { ItemType } from "@/types/pixel-art-game.types";
import {
  givesExperience,
  restoresHealth,
  goesToInventory,
  ITEM_XP_VALUES,
  POTION_HEALTH_RESTORE,
} from "./ItemTypes";
import { InventoryManager } from "../inventory/InventoryManager";

/**
 * Класс для обработки сбора предметов
 */
export class ItemCollector {
  private readonly inventoryManager: InventoryManager;

  constructor(inventory: readonly InventorySlot[]) {
    this.inventoryManager = new InventoryManager(inventory);
  }

  /**
   * Собрать предмет
   */
  collectItem(
    item: GameItem,
    playerPosition: Position
  ): ItemCollectionResult {
    // Проверка, что предмет на позиции игрока
    if (
      item.position.x !== playerPosition.x ||
      item.position.y !== playerPosition.y
    ) {
      return {
        success: false,
        item: null,
        experienceGained: 0,
        addedToInventory: false,
        reason: "Предмет не на позиции игрока",
      };
    }

    // Проверка, что предмет еще не собран
    if (item.collected) {
      return {
        success: false,
        item: null,
        experienceGained: 0,
        addedToInventory: false,
        reason: "Предмет уже собран",
      };
    }

    let experienceGained = 0;
    let healthRestored: number | undefined;
    let addedToInventory = false;

    // Обработка в зависимости от типа предмета
    switch (item.type) {
      case ItemType.COIN:
        // Монета: дает XP, уходит в статистику
        experienceGained = ITEM_XP_VALUES[ItemType.COIN];
        break;

      case ItemType.POTION:
        // Зелье: применяется сразу, восстанавливает HP
        healthRestored = POTION_HEALTH_RESTORE;
        break;

      case ItemType.RARE_ITEM:
        // Редкий предмет: в инвентарь + XP
        experienceGained = ITEM_XP_VALUES[ItemType.RARE_ITEM];
        addedToInventory = this.inventoryManager.addItem(item);
        if (!addedToInventory) {
          return {
            success: false,
            item: null,
            experienceGained: 0,
            addedToInventory: false,
            reason: "Инвентарь полон",
          };
        }
        break;

      default:
        return {
          success: false,
          item: null,
          experienceGained: 0,
          addedToInventory: false,
          reason: "Неизвестный тип предмета",
        };
    }

    return {
      success: true,
      item,
      experienceGained,
      healthRestored,
      addedToInventory,
    };
  }

  /**
   * Получить обновленный инвентарь
   */
  getUpdatedInventory(): readonly InventorySlot[] {
    return this.inventoryManager.getSlots();
  }
}

