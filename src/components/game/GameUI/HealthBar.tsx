/**
 * Компонент полоски здоровья
 * Соблюдает принцип Single Responsibility
 */

import React, { useEffect, useState } from "react";
import styles from "./GameUI.module.css";

export interface HealthBarProps {
  readonly current: number;
  readonly max: number;
}

/**
 * Компонент полоски здоровья
 */
export const HealthBar: React.FC<HealthBarProps> = ({ current, max }) => {
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

  const getHealthColor = (): string => {
    if (percentage > 60) {
      return "var(--color-success)";
    } else if (percentage > 30) {
      return "var(--color-warning)";
    } else {
      return "var(--color-error)";
    }
  };

  return (
    <div className={styles.healthBar}>
      <div className={styles.healthBar__label}>
        <span className={styles.healthBar__icon}>❤️</span>
        <span className={styles.healthBar__text}>HP</span>
      </div>
      <div className={styles.healthBar__container}>
        <div
          className={styles.healthBar__fill}
          style={{
            width: `${percentage}%`,
            backgroundColor: getHealthColor(),
          }}
        />
        <div className={styles.healthBar__value}>
          {Math.round(displayValue)}/{max}
        </div>
      </div>
    </div>
  );
};

