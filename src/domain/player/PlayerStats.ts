/**
 * Управление статистикой персонажа
 * Соблюдает принцип Single Responsibility
 */

import type { PlayerStats } from "@/types/pixel-art-game.types";
import { GAME_CONFIG } from "@/utils/pixel-art-constants";

/**
 * Класс для управления статистикой персонажа
 */
export class PlayerStatsManager {
  private stats: PlayerStats;

  constructor(initialStats?: PlayerStats) {
    this.stats = initialStats || this.createDefaultStats();
  }

  /**
   * Создать статистику по умолчанию
   */
  private createDefaultStats(): PlayerStats {
    return {
      health: GAME_CONFIG.STARTING_HEALTH,
      maxHealth: GAME_CONFIG.MAX_HEALTH,
      stamina: GAME_CONFIG.MAX_STAMINA,
      maxStamina: GAME_CONFIG.MAX_STAMINA,
      level: 1,
      experience: 0,
      experienceToNextLevel: GAME_CONFIG.XP_PER_LEVEL[1] || 10,
    };
  }

  /**
   * Получить текущую статистику
   */
  getStats(): PlayerStats {
    return { ...this.stats };
  }

  /**
   * Восстановить здоровье
   */
  restoreHealth(amount: number): void {
    this.stats = {
      ...this.stats,
      health: Math.min(this.stats.health + amount, this.stats.maxHealth),
    };
  }

  /**
   * Нанести урон
   */
  takeDamage(amount: number): void {
    this.stats = {
      ...this.stats,
      health: Math.max(0, this.stats.health - amount),
    };
  }

  /**
   * Тратить стамину
   */
  drainStamina(amount: number): void {
    this.stats = {
      ...this.stats,
      stamina: Math.max(0, this.stats.stamina - amount),
    };
  }

  /**
   * Восстановить стамину
   */
  restoreStamina(amount: number): void {
    this.stats = {
      ...this.stats,
      stamina: Math.min(this.stats.stamina + amount, this.stats.maxStamina),
    };
  }

  /**
   * Добавить опыт
   * @returns true, если уровень повысился
   */
  addExperience(amount: number): boolean {
    const oldLevel = this.stats.level;
    const newExperience = this.stats.experience + amount;
    const newLevel = this.calculateLevel(newExperience);

    this.stats = {
      ...this.stats,
      experience: newExperience,
      level: newLevel,
      experienceToNextLevel: this.calculateExperienceToNextLevel(newLevel),
    };

    // Возвращаем true, если уровень повысился
    return newLevel > oldLevel;
  }

  /**
   * Рассчитать уровень на основе опыта
   */
  private calculateLevel(experience: number): number {
    let level = 1;
    let totalXP = 0;

    for (let i = 1; i < GAME_CONFIG.XP_PER_LEVEL.length; i++) {
      const xpNeeded = GAME_CONFIG.XP_PER_LEVEL[i] || 0;
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
  private calculateExperienceToNextLevel(level: number): number {
    if (level >= GAME_CONFIG.XP_PER_LEVEL.length) {
      return 0; // Максимальный уровень
    }
    return GAME_CONFIG.XP_PER_LEVEL[level] || 0;
  }

  /**
   * Обновить статистику
   */
  updateStats(updates: Partial<PlayerStats>): void {
    this.stats = {
      ...this.stats,
      ...updates,
    };
  }
}

