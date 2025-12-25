/**
 * Система опыта и уровней
 * Управляет опытом и повышением уровня
 * Соблюдает принцип Single Responsibility
 */

import type { PlayerStats } from "@/types/pixel-art-game.types";
import { LevelCalculator } from "./LevelCalculator";
import { ITEM_XP_VALUES } from "../items/ItemTypes";
import type { ItemType } from "@/types/pixel-art-game.types";

/**
 * Класс для управления опытом
 */
export class ExperienceSystem {
  /**
   * Рассчитать опыт за предмет
   */
  static calculateExperienceForItem(itemType: ItemType): number {
    return ITEM_XP_VALUES[itemType] || 0;
  }

  /**
   * Добавить опыт и проверить повышение уровня
   */
  static addExperience(
    currentStats: PlayerStats,
    experienceGained: number
  ): {
    newStats: PlayerStats;
    levelIncreased: boolean;
    newLevel: number;
  } {
    const newExperience = currentStats.experience + experienceGained;
    const oldLevel = currentStats.level;
    const newLevel = LevelCalculator.calculateLevel(newExperience);
    const levelIncreased = newLevel > oldLevel;

    const newStats: PlayerStats = {
      ...currentStats,
      experience: newExperience,
      level: newLevel,
      experienceToNextLevel: LevelCalculator.calculateExperienceToNextLevel(newLevel),
    };

    return {
      newStats,
      levelIncreased,
      newLevel,
    };
  }

  /**
   * Получить прогресс до следующего уровня
   */
  static getProgressToNextLevel(stats: PlayerStats): number {
    return LevelCalculator.getProgressToNextLevel(stats.experience, stats.level);
  }

  /**
   * Получить оставшийся опыт до следующего уровня
   */
  static getRemainingExperienceToNextLevel(stats: PlayerStats): number {
    const minXP = LevelCalculator.calculateMinExperienceForLevel(stats.level);
    const currentXP = stats.experience - minXP;
    return Math.max(0, stats.experienceToNextLevel - currentXP);
  }
}
