/**
 * Компонент логотипа игры
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

"use client";

import React from "react";
import Link from "next/link";
import styles from "./Logo.module.css";

export interface LogoProps {
  readonly href?: string;
  readonly className?: string;
  readonly size?: "small" | "medium" | "large";
}

/**
 * Размеры логотипа в пикселях
 */
const SIZE_MAP = {
  small: 40,
  medium: 56,
  large: 72,
} as const;

/**
 * Компонент логотипа
 */
export const Logo: React.FC<LogoProps> = ({
  href = "/welcome",
  className = "",
  size = "medium",
}) => {
  const sizePx = SIZE_MAP[size];
  const logoContent = (
    <div className={`${styles.logo} ${styles[`logo--${size}`]} ${className}`}>
      <div className={styles.logo__container}>
        <svg
          width={sizePx}
          height={sizePx}
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Логотип игры Пиксель Арт Бункер"
          className={styles.logo__svg}
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
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={styles.logo__link}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};
