/**
 * Компонент графика статистики
 * Простой CSS-based график для визуализации данных
 * Соблюдает принцип Single Responsibility
 */

import React from "react";
import styles from "./StatisticsChart.module.css";

export interface ChartDataPoint {
  readonly label: string;
  readonly value: number;
  readonly color?: string;
}

export interface StatisticsChartProps {
  readonly title: string;
  readonly data: readonly ChartDataPoint[];
  readonly maxValue?: number;
  readonly className?: string;
}

/**
 * Компонент графика статистики
 */
export const StatisticsChart: React.FC<StatisticsChartProps> = ({
  title,
  data,
  maxValue,
  className = "",
}) => {
  // Вычислить максимальное значение, если не указано
  const calculatedMaxValue = maxValue ?? Math.max(...data.map((point) => point.value), 1);

  return (
    <div className={`${styles.statisticsChart} ${className}`}>
      <h3 className={styles.statisticsChart__title}>{title}</h3>
      <div className={styles.statisticsChart__container}>
        {data.map((point, index) => {
          const percentage =
            calculatedMaxValue > 0 ? (point.value / calculatedMaxValue) * 100 : 0;

          return (
            <div key={index} className={styles.statisticsChart__bar}>
              <div className={styles.statisticsChart__barLabel}>{point.label}</div>
              <div className={styles.statisticsChart__barContainer}>
                <div
                  className={styles.statisticsChart__barFill}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: point.color || "var(--color-primary)",
                  }}
                />
                <span className={styles.statisticsChart__barValue}>{point.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
