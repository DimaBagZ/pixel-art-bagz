/**
 * Система сбора предметов
 * Обрабатывает логику сбора разных типов предметов
 */

import type {
  GameItem,
  Position,
  ItemCollectionResult,
  InventorySlot,
} from "@/types/pixel-art-game.types";
import { ItemType } from "@/types/pixel-art-game.types";
import {
  ITEM_XP_VALUES,
  POTION_HEALTH_RESTORE,
  STAMINA_POTION_RESTORE,
} from "./ItemTypes";
import { InventoryManager } from "../inventory/InventoryManager";

/**
 * Класс для обработки сбора предметов
 */
export class ItemCollector {
  private readonly inventoryManager: InventoryManager;

  constructor(inventory: readonly InventorySlot[]) {
    this.inventoryManager = new InventoryManager([...inventory]);
  }

  /**
   * Собрать предмет
   */
  collectItem(
    item: GameItem,
    _playerPosition: Position
  ): ItemCollectionResult {
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
    let staminaRestored: number | undefined;
    let addedToInventory = false;

    switch (item.type) {
      case ItemType.COIN:
        experienceGained = ITEM_XP_VALUES[ItemType.COIN];
        break;

      case ItemType.POTION:
        healthRestored = POTION_HEALTH_RESTORE;
        break;

      case ItemType.STAMINA_POTION:
        staminaRestored = STAMINA_POTION_RESTORE;
        break;

      case ItemType.RARE_ITEM:
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
      staminaRestored,
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
