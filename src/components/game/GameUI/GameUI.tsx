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
  readonly mapLevel?: number;
  readonly isOnExit?: boolean;
  readonly isNearTerminal?: boolean;
  readonly isNearTreasureDoor?: boolean;
  readonly treasureRoomUnlocked?: boolean;
  readonly onGoToNextLevel?: () => void;
}

/**
 * Компонент игрового UI
 */
export const GameUI: React.FC<GameUIProps> = ({
  stats,
  coins,
  inventory,
  mapLevel = 1,
  isOnExit = false,
  isNearTerminal = false,
  isNearTreasureDoor = false,
  treasureRoomUnlocked = false,
  onGoToNextLevel,
}) => {
  // Защита от undefined/null
  const safeInventory = inventory || [];
  const inventoryCount = safeInventory.filter((slot) => slot.item !== null).length;

  return (
    <div className={styles.gameUI}>
      {/* Верхняя панель */}
      <div className={styles.gameUI__topBar}>
        <div className={styles.mapLevelBadge}>
          <span className={styles.mapLevelBadge__label}>ЭТАЖ</span>
          <span className={styles.mapLevelBadge__value}>{mapLevel}</span>
        </div>
        <LevelDisplay level={stats.level} />
        <CoinsDisplay count={coins} />
        <InventoryCounter current={inventoryCount} max={10} />
      </div>

      {/* Левая панель (статистика) */}
      <div className={styles.gameUI__leftPanel}>
        <HealthBar current={stats.health} max={stats.maxHealth} />
        <StaminaBar current={stats.stamina} max={stats.maxStamina} />
      </div>

      {/* Подсказка о выходе */}
      {isOnExit && (
        <div className={styles.exitPrompt}>
          <div className={styles.exitPrompt__content}>
            <span className={styles.exitPrompt__text}>Нажмите чтобы спуститься</span>
            <button
              className={styles.exitPrompt__button}
              onClick={onGoToNextLevel}
              onTouchStart={(e) => {
                e.preventDefault();
                if (onGoToNextLevel) {
                  onGoToNextLevel();
                }
              }}
            >
              ▼ ЭТАЖ {mapLevel + 1}
            </button>
          </div>
        </div>
      )}

      {/* Подсказка о терминале */}
      {isNearTerminal && (
        <div className={styles.interactionPrompt}>
          <div className={styles.interactionPrompt__content}>
            <span className={styles.interactionPrompt__icon}>💻</span>
            <span className={styles.interactionPrompt__text}>
              <span className={styles.interactionPrompt__desktop}>
                Нажмите <kbd className={styles.keyHint}>E</kbd> для торговли
              </span>
              <span className={styles.interactionPrompt__mobile}>
                Нажмите кнопку <span className={styles.keyHint}>E</span> для торговли
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Подсказка о сокровищнице */}
      {isNearTreasureDoor && !treasureRoomUnlocked && (
        <div className={styles.interactionPrompt}>
          <div className={styles.interactionPrompt__contentTreasure}>
            <span className={styles.interactionPrompt__icon}>🔒</span>
            <span className={styles.interactionPrompt__text}>
              <span className={styles.interactionPrompt__desktop}>
                Нажмите <kbd className={styles.keyHint}>E</kbd> чтобы открыть
              </span>
              <span className={styles.interactionPrompt__mobile}>
                Нажмите кнопку <span className={styles.keyHint}>E</span> чтобы открыть
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
