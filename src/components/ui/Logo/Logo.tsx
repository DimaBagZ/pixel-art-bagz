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
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Логотип игры Крестики-нолики"
          className={styles.logo__svg}
        >
          {/* Фон с плавными краями */}
          <rect
            x="4"
            y="4"
            width="64"
            height="64"
            rx="12"
            ry="12"
            className={styles.logo__background}
          />
          {/* X */}
          <path
            d="M24 24L48 48M48 24L24 48"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.logo__x}
          />
          {/* O */}
          <circle
            cx="36"
            cy="36"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className={styles.logo__o}
          />
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
