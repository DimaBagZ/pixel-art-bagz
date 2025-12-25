/**
 * Управление инвентарем
 * Соблюдает принцип Single Responsibility
 */

import type { GameItem, InventorySlot } from "@/types/pixel-art-game.types";
import { GAME_CONFIG } from "@/utils/pixel-art-constants";
import { goesToInventory } from "../items/ItemTypes";

/**
 * Класс для управления инвентарем
 */
export class InventoryManager {
  private slots: InventorySlot[];

  constructor(initialSlots?: InventorySlot[]) {
    if (initialSlots) {
      this.slots = [...initialSlots];
    } else {
      this.slots = this.createEmptyInventory();
    }
  }

  /**
   * Создать пустой инвентарь
   */
  private createEmptyInventory(): InventorySlot[] {
    return Array.from({ length: GAME_CONFIG.INVENTORY_SIZE }, (_, i) => ({
      index: i,
      item: null,
    }));
  }

  /**
   * Получить все слоты инвентаря
   */
  getSlots(): readonly InventorySlot[] {
    return [...this.slots];
  }

  /**
   * Найти свободный слот
   */
  findFreeSlot(): number | null {
    const freeSlot = this.slots.find((slot) => slot.item === null);
    return freeSlot ? freeSlot.index : null;
  }

  /**
   * Проверить, есть ли свободные слоты
   */
  hasFreeSlots(): boolean {
    return this.findFreeSlot() !== null;
  }

  /**
   * Добавить предмет в инвентарь
   */
  addItem(item: GameItem): boolean {
    // Проверяем, должен ли предмет идти в инвентарь
    if (!goesToInventory(item.type)) {
      return false;
    }

    const freeSlotIndex = this.findFreeSlot();
    if (freeSlotIndex === null) {
      return false; // Инвентарь полон
    }

    this.slots[freeSlotIndex] = {
      index: freeSlotIndex,
      item,
    };

    return true;
  }

  /**
   * Удалить предмет из инвентаря по индексу слота
   */
  removeItem(slotIndex: number): boolean {
    if (slotIndex < 0 || slotIndex >= this.slots.length) {
      return false;
    }

    if (this.slots[slotIndex].item === null) {
      return false; // Слот уже пуст
    }

    this.slots[slotIndex] = {
      index: slotIndex,
      item: null,
    };

    return true;
  }

  /**
   * Удалить предмет из инвентаря по ID предмета
   */
  removeItemById(itemId: string): boolean {
    const slotIndex = this.slots.findIndex(
      (slot) => slot.item?.id === itemId
    );

    if (slotIndex === -1) {
      return false;
    }

    return this.removeItem(slotIndex);
  }

  /**
   * Получить количество занятых слотов
   */
  getUsedSlotsCount(): number {
    return this.slots.filter((slot) => slot.item !== null).length;
  }

  /**
   * Получить количество свободных слотов
   */
  getFreeSlotsCount(): number {
    return GAME_CONFIG.INVENTORY_SIZE - this.getUsedSlotsCount();
  }

  /**
   * Проверить, полон ли инвентарь
   */
  isFull(): boolean {
    return this.getFreeSlotsCount() === 0;
  }
}

