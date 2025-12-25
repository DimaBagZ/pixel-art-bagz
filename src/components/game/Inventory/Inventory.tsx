/**
 * Компонент инвентаря
 * Соблюдает принцип Single Responsibility
 */

"use client";

import React, { useState } from "react";
import type { InventorySlot } from "@/types/pixel-art-game.types";
import { InventorySlot as InventorySlotComponent } from "./InventorySlot";
import { useInventory } from "@/hooks/useInventory";
import styles from "./Inventory.module.css";

export interface InventoryProps {
  readonly inventory: readonly InventorySlot[];
  readonly onInventoryChange?: (inventory: readonly InventorySlot[]) => void;
}

/**
 * Компонент инвентаря
 */
export const Inventory: React.FC<InventoryProps> = ({
  inventory,
  onInventoryChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { removeItem } = useInventory({
    initialInventory: inventory,
    onInventoryChange,
  });

  const handleRemove = (slotIndex: number): void => {
    removeItem(slotIndex);
  };

  const toggleInventory = (): void => {
    setIsOpen(!isOpen);
  };

  const usedSlots = inventory.filter((slot) => slot.item !== null).length;

  return (
    <>
      {/* Кнопка открытия инвентаря */}
      <button
        className={styles.inventoryToggle}
        onClick={toggleInventory}
        aria-label="Открыть инвентарь"
        title="Инвентарь"
      >
        <span className={styles.inventoryToggle__icon}>📦</span>
        <span className={styles.inventoryToggle__count}>{usedSlots}/10</span>
      </button>

      {/* Модальное окно инвентаря */}
      {isOpen && (
        <div className={styles.inventoryOverlay} onClick={toggleInventory}>
          <div
            className={styles.inventoryModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.inventoryModal__header}>
              <h2 className={styles.inventoryModal__title}>Инвентарь</h2>
              <button
                className={styles.inventoryModal__close}
                onClick={toggleInventory}
                aria-label="Закрыть инвентарь"
              >
                ×
              </button>
            </div>

            <div className={styles.inventoryModal__content}>
              <div className={styles.inventoryGrid}>
                {inventory.map((slot) => (
                  <InventorySlotComponent
                    key={slot.index}
                    slot={slot}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              <div className={styles.inventoryModal__footer}>
                <div className={styles.inventoryModal__stats}>
                  Занято: {usedSlots} / 10
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

