/**
 * Компонент анимированной иконки статистики
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import React from "react";
import styles from "./StatsIcon.module.css";

export interface StatsIconProps {
  readonly className?: string;
  readonly size?: number;
}

/**
 * Компонент анимированной иконки статистики
 */
export const StatsIcon: React.FC<StatsIconProps> = ({ className = "", size = 24 }) => {
  return (
    <svg
      className={`${styles.statsIcon} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Статистика"
    >
      {/* График - линии */}
      <path
        d="M3 18L7 14L11 16L15 10L19 12V18H3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.statsIcon__chart}
      />
      {/* Точки на графике */}
      <circle
        cx="3"
        cy="18"
        r="2"
        fill="currentColor"
        className={styles.statsIcon__dot}
      />
      <circle
        cx="7"
        cy="14"
        r="2"
        fill="currentColor"
        className={styles.statsIcon__dot}
      />
      <circle
        cx="11"
        cy="16"
        r="2"
        fill="currentColor"
        className={styles.statsIcon__dot}
      />
      <circle
        cx="15"
        cy="10"
        r="2"
        fill="currentColor"
        className={styles.statsIcon__dot}
      />
      <circle
        cx="19"
        cy="12"
        r="2"
        fill="currentColor"
        className={styles.statsIcon__dot}
      />
    </svg>
  );
};
