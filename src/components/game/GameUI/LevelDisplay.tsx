/**
 * Компонент отображения уровня
 * Соблюдает принцип Single Responsibility
 */

import React from "react";
import styles from "./GameUI.module.css";

export interface LevelDisplayProps {
  readonly level: number;
}

/**
 * Компонент отображения уровня
 */
export const LevelDisplay: React.FC<LevelDisplayProps> = ({ level }) => {
  return (
    <div className={styles.levelDisplay}>
      <span className={styles.levelDisplay__label}>LVL</span>
      <span className={styles.levelDisplay__value}>{level}</span>
    </div>
  );
};

