/**
 * Компонент достижений
 * Отображает список достижений с прогрессом
 * Соблюдает принцип Single Responsibility
 */

import React from "react";
import type { Achievement } from "@/services/storage/StorageTypes";
import styles from "./Achievements.module.css";

export interface AchievementsProps {
  readonly achievements: readonly Achievement[];
  readonly className?: string;
}

/**
 * Компонент достижений
 */
export const Achievements: React.FC<AchievementsProps> = ({
  achievements,
  className = "",
}) => {
  const unlockedCount = achievements.filter((a) => a.unlockedAt !== null).length;
  const totalCount = achievements.length;

  return (
    <div className={`${styles.achievements} ${className}`}>
      <div className={styles.achievements__header}>
        <h2 className={styles.achievements__title}>Достижения</h2>
        <div className={styles.achievements__progress}>
          {unlockedCount} / {totalCount}
        </div>
      </div>

      <div className={styles.achievements__grid}>
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`${styles.achievements__item} ${
              achievement.unlockedAt !== null
                ? styles["achievements__item--unlocked"]
                : styles["achievements__item--locked"]
            }`}
          >
            <div className={styles.achievements__itemIcon}>
              {achievement.icon}
            </div>
            <div className={styles.achievements__itemContent}>
              <h3 className={styles.achievements__itemName}>
                {achievement.name}
              </h3>
              <p className={styles.achievements__itemDescription}>
                {achievement.description}
              </p>
              {achievement.unlockedAt === null && achievement.maxProgress > 1 && (
                <div className={styles.achievements__itemProgress}>
                  <div className={styles.achievements__itemProgressBar}>
                    <div
                      className={styles.achievements__itemProgressFill}
                      style={{
                        width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                      }}
                    />
                  </div>
                  <span className={styles.achievements__itemProgressText}>
                    {achievement.progress} / {achievement.maxProgress}
                  </span>
                </div>
              )}
              {achievement.unlockedAt !== null && (
                <div className={styles.achievements__itemUnlocked}>
                  Разблокировано
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

