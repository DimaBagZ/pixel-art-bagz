/**
 * Калькулятор уровней и опыта
 * Рассчитывает уровни на основе опыта
 * Соблюдает принцип Single Responsibility
 */

import { GAME_CONFIG } from "@/utils/pixel-art-constants";

/**
 * Класс для расчета уровней
 */
export class LevelCalculator {
  /**
   * Рассчитать уровень на основе опыта
   */
  static calculateLevel(experience: number): number {
    let level = 1;
    let totalXP = 0;

    for (let i = 1; i < GAME_CONFIG.XP_PER_LEVEL.length; i++) {
      const xpNeeded = GAME_CONFIG.XP_PER_LEVEL[i];
      if (xpNeeded === undefined) {
        break;
      }

      if (experience >= totalXP + xpNeeded) {
        totalXP += xpNeeded;
        level = i + 1;
      } else {
        break;
      }
    }

    return level;
  }

  /**
   * Рассчитать опыт до следующего уровня
   */
  static calculateExperienceToNextLevel(level: number): number {
    if (level >= GAME_CONFIG.XP_PER_LEVEL.length) {
      return 0; // Максимальный уровень
    }

    const xpNeeded = GAME_CONFIG.XP_PER_LEVEL[level];
    return xpNeeded || 0;
  }

  /**
   * Рассчитать минимальный опыт для уровня
   */
  static calculateMinExperienceForLevel(level: number): number {
    if (level <= 1) {
      return 0;
    }

    let totalXP = 0;
    for (let i = 1; i < level && i < GAME_CONFIG.XP_PER_LEVEL.length; i++) {
      const xpNeeded = GAME_CONFIG.XP_PER_LEVEL[i];
      if (xpNeeded !== undefined) {
        totalXP += xpNeeded;
      }
    }

    return totalXP;
  }

  /**
   * Проверить, достигнут ли уровень
   */
  static isLevelReached(experience: number, targetLevel: number): boolean {
    const currentLevel = this.calculateLevel(experience);
    return currentLevel >= targetLevel;
  }

  /**
   * Получить прогресс до следующего уровня (0-1)
   */
  static getProgressToNextLevel(experience: number, level: number): number {
    const minXP = this.calculateMinExperienceForLevel(level);
    const xpToNext = this.calculateExperienceToNextLevel(level);

    if (xpToNext === 0) {
      return 1; // Максимальный уровень
    }

    const currentXP = experience - minXP;
    return Math.min(1, Math.max(0, currentXP / xpToNext));
  }
}

