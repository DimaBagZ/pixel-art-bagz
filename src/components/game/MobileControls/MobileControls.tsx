/**
 * Компонент мобильного управления
 * Виртуальные кнопки для управления персонажем на мобильных устройствах
 */

"use client";

import React, { useState, useCallback, useRef } from "react";
import type { Direction, MovementType } from "@/types/pixel-art-game.types";
import {
  Direction as DirectionEnum,
  MovementType as MovementTypeEnum,
} from "@/types/pixel-art-game.types";
import styles from "./MobileControls.module.css";

export interface MobileControlsProps {
  readonly onMove: (direction: Direction, movementType: MovementType) => void;
  readonly onStop: () => void;
  readonly onInteract: () => void;
  readonly enabled?: boolean;
}

/**
 * Компонент мобильного управления
 */
export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onStop,
  onInteract,
  enabled = true,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const activeDirectionRef = useRef<Direction | null>(null);

  const handleDirectionPress = useCallback(
    (direction: Direction): void => {
      if (!enabled) return;

      activeDirectionRef.current = direction;
      const movementType = isRunning ? MovementTypeEnum.RUN : MovementTypeEnum.WALK;
      onMove(direction, movementType);
    },
    [enabled, isRunning, onMove]
  );

  const handleDirectionRelease = useCallback((): void => {
    if (!enabled) return;

    activeDirectionRef.current = null;
    onStop();
  }, [enabled, onStop]);

  const handleRunToggle = useCallback((): void => {
    if (!enabled) return;

    setIsRunning((prev) => {
      const newRunningState = !prev;
      // Если есть активное направление, обновляем движение с новым типом
      if (activeDirectionRef.current) {
        const movementType = newRunningState ? MovementTypeEnum.RUN : MovementTypeEnum.WALK;
        onMove(activeDirectionRef.current, movementType);
      }
      return newRunningState;
    });
  }, [enabled, onMove]);

  const handleInteract = useCallback((): void => {
    if (!enabled) return;
    onInteract();
  }, [enabled, onInteract]);

  if (!enabled) {
    return null;
  }

  return (
    <div className={styles.mobileControls}>
      {/* Кнопка бега - слева от стрелок */}
      <button
        className={`${styles.runButton} ${isRunning ? styles.runButton__active : ""}`}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleRunToggle();
        }}
        onMouseUp={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleRunToggle();
        }}
        aria-label={isRunning ? "Выключить бег" : "Включить бег"}
        aria-pressed={isRunning}
      >
        🏃
      </button>

      {/* Блок управления - справа */}
      <div className={styles.mobileControls__right}>
        {/* Кнопка взаимодействия - выше стрелок */}
        <button
          className={styles.interactButton}
          onTouchStart={handleInteract}
          onClick={handleInteract}
          aria-label="Взаимодействие"
        >
          E
        </button>

        {/* Виртуальный джойстик для движения - в самом низу */}
        <div className={styles.mobileControls__movement}>
          <div className={styles.movementPad}>
            <button
              className={`${styles.movementButton} ${styles.movementButton__up}`}
              onTouchStart={() => handleDirectionPress(DirectionEnum.UP)}
              onTouchEnd={handleDirectionRelease}
              onMouseDown={() => handleDirectionPress(DirectionEnum.UP)}
              onMouseUp={handleDirectionRelease}
              onMouseLeave={handleDirectionRelease}
              aria-label="Вверх"
            >
              ↑
            </button>
            <div className={styles.movementButton__row}>
              <button
                className={`${styles.movementButton} ${styles.movementButton__left}`}
                onTouchStart={() => handleDirectionPress(DirectionEnum.LEFT)}
                onTouchEnd={handleDirectionRelease}
                onMouseDown={() => handleDirectionPress(DirectionEnum.LEFT)}
                onMouseUp={handleDirectionRelease}
                onMouseLeave={handleDirectionRelease}
                aria-label="Влево"
              >
                ←
              </button>
              <button
                className={`${styles.movementButton} ${styles.movementButton__down}`}
                onTouchStart={() => handleDirectionPress(DirectionEnum.DOWN)}
                onTouchEnd={handleDirectionRelease}
                onMouseDown={() => handleDirectionPress(DirectionEnum.DOWN)}
                onMouseUp={handleDirectionRelease}
                onMouseLeave={handleDirectionRelease}
                aria-label="Вниз"
              >
                ↓
              </button>
              <button
                className={`${styles.movementButton} ${styles.movementButton__right}`}
                onTouchStart={() => handleDirectionPress(DirectionEnum.RIGHT)}
                onTouchEnd={handleDirectionRelease}
                onMouseDown={() => handleDirectionPress(DirectionEnum.RIGHT)}
                onMouseUp={handleDirectionRelease}
                onMouseLeave={handleDirectionRelease}
                aria-label="Вправо"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
