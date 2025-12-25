/**
 * Компонент предмета в инвентаре
 * Соблюдает принцип Single Responsibility
 */

import React from "react";
import type { GameItem } from "@/types/pixel-art-game.types";
import { ItemType } from "@/types/pixel-art-game.types";
import styles from "./Inventory.module.css";

export interface InventoryItemProps {
  readonly item: GameItem;
  readonly onRemove?: () => void;
}

/**
 * Компонент предмета в инвентаре
 */
export const InventoryItem: React.FC<InventoryItemProps> = ({ item, onRemove }) => {
  const getItemIcon = (): string => {
    switch (item.type) {
      case ItemType.RARE_ITEM:
        return "⭐";
      default:
        return "📦";
    }
  };

  const getItemName = (): string => {
    switch (item.type) {
      case ItemType.RARE_ITEM:
        return "Редкий предмет";
      default:
        return "Предмет";
    }
  };

  return (
    <div className={styles.inventoryItem}>
      <div className={styles.inventoryItem__icon}>{getItemIcon()}</div>
      <div className={styles.inventoryItem__info}>
        <div className={styles.inventoryItem__name}>{getItemName()}</div>
        <div className={styles.inventoryItem__id}>ID: {item.id.slice(-6)}</div>
      </div>
      {onRemove && (
        <button
          className={styles.inventoryItem__remove}
          onClick={onRemove}
          aria-label="Удалить предмет"
          title="Удалить предмет"
        >
          ×
        </button>
      )}
    </div>
  );
};

