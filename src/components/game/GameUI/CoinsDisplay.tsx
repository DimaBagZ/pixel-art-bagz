/**
 * Компонент отображения монет
 * Соблюдает принцип Single Responsibility
 */

import React, { useEffect, useState } from "react";
import styles from "./GameUI.module.css";

export interface CoinsDisplayProps {
  readonly count: number;
}

/**
 * Компонент отображения монет
 */
export const CoinsDisplay: React.FC<CoinsDisplayProps> = ({ count }) => {
  const [displayCount, setDisplayCount] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (count !== displayCount) {
      setIsAnimating(true);
      // Плавное изменение значения
      const timer = setTimeout(() => {
        setDisplayCount(count);
        setIsAnimating(false);
      }, 300);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [count, displayCount]);

  return (
    <div className={styles.coinsDisplay}>
      <span className={styles.coinsDisplay__icon}>💰</span>
      <span
        className={`${styles.coinsDisplay__value} ${
          isAnimating ? styles["coinsDisplay__value--animating"] : ""
        }`}
      >
        {displayCount}
      </span>
    </div>
  );
};

