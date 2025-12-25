/**
 * Компонент слота инвентаря
 * Соблюдает принцип Single Responsibility
 */

import React from "react";
import type { InventorySlot as InventorySlotType } from "@/types/pixel-art-game.types";
import { InventoryItem } from "./InventoryItem";
import styles from "./Inventory.module.css";

export interface InventorySlotProps {
  readonly slot: InventorySlotType;
  readonly onRemove?: (slotIndex: number) => void;
}

/**
 * Компонент слота инвентаря
 */
export const InventorySlot: React.FC<InventorySlotProps> = ({ slot, onRemove }) => {
  const handleRemove = (): void => {
    if (onRemove) {
      onRemove(slot.index);
    }
  };

  return (
    <div className={styles.inventorySlot}>
      {slot.item ? (
        <InventoryItem item={slot.item} onRemove={handleRemove} />
      ) : (
        <div className={styles.inventorySlot__empty}>
          <span className={styles.inventorySlot__emptyIcon}>📦</span>
          <span className={styles.inventorySlot__emptyText}>Пусто</span>
        </div>
      )}
    </div>
  );
};
