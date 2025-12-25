/**
 * Компонент счетчика инвентаря
 * Соблюдает принцип Single Responsibility
 */

import React from "react";
import styles from "./GameUI.module.css";

export interface InventoryCounterProps {
  readonly current: number;
  readonly max: number;
}

/**
 * Компонент счетчика инвентаря
 */
export const InventoryCounter: React.FC<InventoryCounterProps> = ({
  current,
  max,
}) => {
  const percentage = (current / max) * 100;
  const isFull = current >= max;

  return (
    <div className={styles.inventoryCounter}>
      <span className={styles.inventoryCounter__icon}>📦</span>
      <span
        className={`${styles.inventoryCounter__value} ${
          isFull ? styles["inventoryCounter__value--full"] : ""
        }`}
      >
        {current}/{max}
      </span>
      {isFull && (
        <span className={styles.inventoryCounter__warning}>(Полон)</span>
      )}
    </div>
  );
};

