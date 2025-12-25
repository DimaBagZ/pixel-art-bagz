/**
 * Компонент карточки статистики
 * Переиспользуемый компонент для отображения метрик
 * Соблюдает принцип Single Responsibility
 */

import React from "react";
import styles from "./StatisticsCard.module.css";

export interface StatisticsCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly subtitle?: string;
  readonly icon?: string;
  readonly trend?: "up" | "down" | "neutral";
  readonly className?: string;
}

/**
 * Компонент карточки статистики
 */
export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend = "neutral",
  className = "",
}) => {
  const cardClasses = [
    styles.statisticsCard,
    trend !== "neutral" && styles[`statisticsCard--trend-${trend}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses}>
      <div className={styles.statisticsCard__header}>
        {icon && <span className={styles.statisticsCard__icon}>{icon}</span>}
        <h3 className={styles.statisticsCard__title}>{title}</h3>
      </div>
      <div className={styles.statisticsCard__value}>{value}</div>
      {subtitle && (
        <div className={styles.statisticsCard__subtitle}>{subtitle}</div>
      )}
    </div>
  );
};

