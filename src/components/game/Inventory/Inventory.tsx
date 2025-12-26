/**
 * Компонент инвентаря
 * Соблюдает принцип Single Responsibility
 */

"use client";

import React, { useState, useCallback } from "react";
import type { InventorySlot, CollectedResources } from "@/types/pixel-art-game.types";
import { RESOURCE_SELL_PRICES } from "@/types/pixel-art-game.types";
import { InventorySlot as InventorySlotComponent } from "./InventorySlot";
import { useInventory } from "@/hooks/useInventory";
import styles from "./Inventory.module.css";

export interface InventoryProps {
  readonly inventory: readonly InventorySlot[];
  readonly collectedResources: CollectedResources;
  readonly onInventoryChange?: (inventory: readonly InventorySlot[]) => void;
  readonly onSellResources?: () => number;
}

/**
 * Компонент инвентаря
 */
export const Inventory: React.FC<InventoryProps> = ({
  inventory,
  collectedResources,
  onInventoryChange,
  onSellResources,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastSellXp, setLastSellXp] = useState<number | null>(null);
  const { removeItem } = useInventory({
    initialInventory: inventory,
    onInventoryChange,
  });

  const handleRemove = (slotIndex: number): void => {
    removeItem(slotIndex);
  };

  const toggleInventory = (): void => {
    setIsOpen(!isOpen);
    setLastSellXp(null);
  };

  const handleSellResources = useCallback(() => {
    if (onSellResources) {
      const xpGained = onSellResources();
      if (xpGained > 0) {
        setLastSellXp(xpGained);
        setTimeout(() => setLastSellXp(null), 2000);
      }
    }
  }, [onSellResources]);

  const usedSlots = inventory.filter((slot) => slot.item !== null).length;
  const totalResources = collectedResources.coins + collectedResources.healthPotions + collectedResources.staminaPotions;
  const potentialXp = 
    collectedResources.coins * RESOURCE_SELL_PRICES.coins +
    collectedResources.healthPotions * RESOURCE_SELL_PRICES.healthPotions +
    collectedResources.staminaPotions * RESOURCE_SELL_PRICES.staminaPotions;

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
        {totalResources > 0 && (
          <span className={styles.inventoryToggle__resources}>+{totalResources}</span>
        )}
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
              {/* Секция ресурсов */}
              <div className={styles.resourcesSection}>
                <h3 className={styles.resourcesSection__title}>Собранные ресурсы</h3>
                <div className={styles.resourcesGrid}>
                  <div className={styles.resourceItem}>
                    <span className={styles.resourceItem__icon}>🪙</span>
                    <span className={styles.resourceItem__count}>{collectedResources.coins}</span>
                    <span className={styles.resourceItem__label}>Монеты</span>
                  </div>
                  <div className={styles.resourceItem}>
                    <span className={styles.resourceItem__icon}>❤️</span>
                    <span className={styles.resourceItem__count}>{collectedResources.healthPotions}</span>
                    <span className={styles.resourceItem__label}>Зелья HP</span>
                  </div>
                  <div className={styles.resourceItem}>
                    <span className={styles.resourceItem__icon}>💚</span>
                    <span className={styles.resourceItem__count}>{collectedResources.staminaPotions}</span>
                    <span className={styles.resourceItem__label}>Зелья SP</span>
                  </div>
                </div>
                {totalResources > 0 && (
                  <div className={styles.resourcesSection__sell}>
                    <button 
                      className={styles.sellResourcesBtn}
                      onClick={handleSellResources}
                    >
                      💱 Продать все за {potentialXp} XP
                    </button>
                    {lastSellXp !== null && (
                      <div className={styles.sellResourcesBtn__feedback}>
                        +{lastSellXp} XP получено!
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Разделитель */}
              <div className={styles.inventoryDivider} />

              {/* Сетка инвентаря */}
              <h3 className={styles.inventoryGrid__title}>Предметы</h3>
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

