/**
 * Компонент отображения промокода
 * Соблюдает принцип Single Responsibility
 */

import React from "react";
import styles from "./PromoCode.module.css";

export interface PromoCodeProps {
  readonly code: string;
  readonly className?: string;
}

/**
 * Компонент промокода
 */
export const PromoCode: React.FC<PromoCodeProps> = ({
  code,
  className = "",
}) => {
  return (
    <div className={`${styles.promoCode} ${className}`}>
      <span className={styles.promoCode__label}>Ваш промокод:</span>
      <span className={styles.promoCode__code}>{code}</span>
    </div>
  );
};

