/**
 * Компонент полоски стамины
 * Соблюдает принцип Single Responsibility
 */

import React, { useEffect, useState } from "react";
import styles from "./GameUI.module.css";

export interface StaminaBarProps {
  readonly current: number;
  readonly max: number;
}

/**
 * Компонент полоски стамины
 */
export const StaminaBar: React.FC<StaminaBarProps> = ({ current, max }) => {
  const [displayValue, setDisplayValue] = useState(current);
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  useEffect(() => {
    // Плавная анимация изменения значения
    const timer = setTimeout(() => {
      setDisplayValue(current);
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [current]);

  return (
    <div className={styles.staminaBar}>
      <div className={styles.staminaBar__label}>
        <span className={styles.staminaBar__icon}>⚡</span>
        <span className={styles.staminaBar__text}>Stamina</span>
      </div>
      <div className={styles.staminaBar__container}>
        <div
          className={styles.staminaBar__fill}
          style={{
            width: `${percentage}%`,
          }}
        />
        <div className={styles.staminaBar__value}>
          {Math.round(displayValue)}/{max}
        </div>
      </div>
    </div>
  );
};

