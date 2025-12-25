/**
 * Компонент игрового UI
 * Композиция всех UI элементов
 * Соблюдает принцип Single Responsibility
 */

import React from "react";
import type { PlayerStats, InventorySlot } from "@/types/pixel-art-game.types";
import { HealthBar } from "./HealthBar";
import { StaminaBar } from "./StaminaBar";
import { LevelDisplay } from "./LevelDisplay";
import { CoinsDisplay } from "./CoinsDisplay";
import { InventoryCounter } from "./InventoryCounter";
import styles from "./GameUI.module.css";

export interface GameUIProps {
  readonly stats: PlayerStats;
  readonly coins: number;
  readonly inventory: readonly InventorySlot[];
}

/**
 * Компонент игрового UI
 */
export const GameUI: React.FC<GameUIProps> = ({ stats, coins, inventory }) => {
  const inventoryCount = inventory.filter((slot) => slot.item !== null).length;

  return (
    <div className={styles.gameUI}>
      {/* Верхняя панель */}
      <div className={styles.gameUI__topBar}>
        <LevelDisplay level={stats.level} />
        <CoinsDisplay count={coins} />
        <InventoryCounter current={inventoryCount} max={10} />
      </div>

      {/* Левая панель (статистика) */}
      <div className={styles.gameUI__leftPanel}>
        <HealthBar current={stats.health} max={stats.maxHealth} />
        <StaminaBar current={stats.stamina} max={stats.maxStamina} />
      </div>
    </div>
  );
};

