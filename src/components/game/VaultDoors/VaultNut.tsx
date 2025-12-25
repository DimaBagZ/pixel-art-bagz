/**
 * Компонент гайки ворот бункера
 * Соблюдает принцип Single Responsibility
 */

import React from "react";
import styles from "./VaultDoors.module.css";

export interface VaultNutProps {
  readonly hasSavedGame: boolean;
  readonly onClick: () => void;
  readonly isAnimating?: boolean;
}

/**
 * Компонент гайки с кнопкой
 */
export const VaultNut: React.FC<VaultNutProps> = ({
  hasSavedGame,
  onClick,
  isAnimating = false,
}) => {
  return (
    <div
      className={`${styles.vaultNut} ${isAnimating ? styles["vaultNut--animating"] : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={hasSavedGame ? "Продолжить игру" : "Начать игру"}
    >
      <div className={styles.vaultNut__icon}>
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Внешний круг гайки */}
          <circle cx="40" cy="40" r="35" fill="var(--color-accent)" stroke="var(--color-primary)" strokeWidth="3" />
          {/* Внутренний шестигранник */}
          <polygon
            points="40,15 55,25 55,45 40,55 25,45 25,25"
            fill="var(--color-primary)"
            stroke="var(--color-accent)"
            strokeWidth="2"
          />
          {/* Центральное отверстие */}
          <circle cx="40" cy="40" r="8" fill="var(--color-background)" />
        </svg>
      </div>
      <div className={styles.vaultNut__text}>
        {hasSavedGame ? "Продолжить" : "Начать"}
      </div>
    </div>
  );
};

