/**
 * Хук для управления инвентарем
 * Соблюдает принцип Single Responsibility
 */

import { useState, useCallback } from "react";
import type { InventorySlot, GameItem } from "@/types/pixel-art-game.types";
import { InventoryManager } from "@/domain/inventory/InventoryManager";
import { InventoryValidator } from "@/domain/inventory/InventoryValidator";

export interface UseInventoryOptions {
  readonly initialInventory?: readonly InventorySlot[];
  readonly onInventoryChange?: (inventory: readonly InventorySlot[]) => void;
}

export interface UseInventoryReturn {
  readonly inventory: readonly InventorySlot[];
  readonly addItem: (item: GameItem) => boolean;
  readonly removeItem: (slotIndex: number) => boolean;
  readonly removeItemById: (itemId: string) => boolean;
  readonly getUsedSlotsCount: () => number;
  readonly getFreeSlotsCount: () => number;
  readonly isFull: () => boolean;
}

/**
 * Хук для управления инвентарем
 */
export const useInventory = (options?: UseInventoryOptions): UseInventoryReturn => {
  const initialInventory = options?.initialInventory || [];
  const [inventory, setInventory] = useState<readonly InventorySlot[]>(initialInventory);

  /**
   * Добавить предмет в инвентарь
   */
  const addItem = useCallback(
    (item: GameItem): boolean => {
      const validation = InventoryValidator.canAddItem(item, inventory);
      if (!validation.canAdd) {
        return false;
      }

      const manager = new InventoryManager(inventory);
      const success = manager.addItem(item);

      if (success) {
        const newInventory = manager.getSlots();
        setInventory(newInventory);

        if (options?.onInventoryChange) {
          options.onInventoryChange(newInventory);
        }
      }

      return success;
    },
    [inventory, options]
  );

  /**
   * Удалить предмет из инвентаря по индексу слота
   */
  const removeItem = useCallback(
    (slotIndex: number): boolean => {
      const validation = InventoryValidator.canRemoveItem(slotIndex, inventory);
      if (!validation.canRemove) {
        return false;
      }

      const manager = new InventoryManager(inventory);
      const success = manager.removeItem(slotIndex);

      if (success) {
        const newInventory = manager.getSlots();
        setInventory(newInventory);

        if (options?.onInventoryChange) {
          options.onInventoryChange(newInventory);
        }
      }

      return success;
    },
    [inventory, options]
  );

  /**
   * Удалить предмет из инвентаря по ID
   */
  const removeItemById = useCallback(
    (itemId: string): boolean => {
      const manager = new InventoryManager(inventory);
      const success = manager.removeItemById(itemId);

      if (success) {
        const newInventory = manager.getSlots();
        setInventory(newInventory);

        if (options?.onInventoryChange) {
          options.onInventoryChange(newInventory);
        }
      }

      return success;
    },
    [inventory, options]
  );

  /**
   * Получить количество занятых слотов
   */
  const getUsedSlotsCount = useCallback((): number => {
    const manager = new InventoryManager(inventory);
    return manager.getUsedSlotsCount();
  }, [inventory]);

  /**
   * Получить количество свободных слотов
   */
  const getFreeSlotsCount = useCallback((): number => {
    const manager = new InventoryManager(inventory);
    return manager.getFreeSlotsCount();
  }, [inventory]);

  /**
   * Проверить, полон ли инвентарь
   */
  const isFull = useCallback((): boolean => {
    const manager = new InventoryManager(inventory);
    return manager.isFull();
  }, [inventory]);

  return {
    inventory,
    addItem,
    removeItem,
    removeItemById,
    getUsedSlotsCount,
    getFreeSlotsCount,
    isFull,
  };
};

