/**
 * Сервис для работы с достижениями
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import { defaultStorageService } from "./StorageService";
import { STORAGE_KEYS, STORAGE_VERSION, AchievementType } from "./StorageTypes";
import type {
  Achievement,
  AchievementsData,
  GameStatistics,
  GameHistory,
} from "./StorageTypes";
import { AIDifficulty, GameResult } from "@/types/game.types";

/**
 * Определения всех достижений
 */
const ACHIEVEMENT_DEFINITIONS: readonly Achievement[] = [
  {
    id: AchievementType.FIRST_WIN,
    name: "Первая победа",
    description: "Выиграйте свою первую игру",
    icon: "🎉",
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: AchievementType.WIN_STREAK_5,
    name: "Горячая серия",
    description: "Выиграйте 5 игр подряд",
    icon: "🔥",
    unlockedAt: null,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: AchievementType.WIN_STREAK_10,
    name: "Невероятная серия",
    description: "Выиграйте 10 игр подряд",
    icon: "⭐",
    unlockedAt: null,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: AchievementType.PERFECT_GAME,
    name: "Идеальная игра",
    description: "Выиграйте за минимальное количество ходов (5)",
    icon: "💎",
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: AchievementType.HARD_MODE_WIN,
    name: "Мастер сложности",
    description: "Выиграйте на сложном уровне",
    icon: "🏆",
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: AchievementType.TOTAL_WINS_10,
    name: "Новичок",
    description: "Выиграйте 10 игр",
    icon: "🥉",
    unlockedAt: null,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: AchievementType.TOTAL_WINS_50,
    name: "Опытный игрок",
    description: "Выиграйте 50 игр",
    icon: "🥈",
    unlockedAt: null,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: AchievementType.TOTAL_WINS_100,
    name: "Легенда",
    description: "Выиграйте 100 игр",
    icon: "🥇",
    unlockedAt: null,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: AchievementType.NO_LOSSES_5,
    name: "Непобедимый",
    description: "Сыграйте 5 игр без проигрышей",
    icon: "🛡️",
    unlockedAt: null,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: AchievementType.ALL_DIFFICULTIES,
    name: "Универсал",
    description: "Выиграйте на всех уровнях сложности",
    icon: "🎯",
    unlockedAt: null,
    progress: 0,
    maxProgress: 3,
  },
  {
    id: AchievementType.FIRST_LOSS,
    name: "Первый проигрыш",
    description: "Проиграйте свою первую игру",
    icon: "😔",
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: AchievementType.FIRST_DRAW,
    name: "Первая ничья",
    description: "Сыграйте свою первую ничью",
    icon: "🤝",
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: AchievementType.TOTAL_LOSSES_10,
    name: "Стойкость",
    description: "Проиграйте 10 игр (показывает упорство)",
    icon: "💪",
    unlockedAt: null,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: AchievementType.TOTAL_DRAWS_5,
    name: "Упорство",
    description: "Сыграйте 5 ничьих",
    icon: "⚖️",
    unlockedAt: null,
    progress: 0,
    maxProgress: 5,
  },
] as const;

/**
 * Сервис для управления достижениями
 */
export class AchievementsService {
  private readonly storage = defaultStorageService;

  /**
   * Получить все достижения
   */
  getAchievements(): readonly Achievement[] {
    const data = this.storage.get<AchievementsData>(STORAGE_KEYS.ACHIEVEMENTS);

    if (!data || !this.isValidAchievementsData(data)) {
      return this.createEmptyAchievements();
    }

    return this.migrateAchievements(data).achievements;
  }

  /**
   * Проверить и обновить достижения на основе статистики
   */
  checkAchievements(
    statistics: GameStatistics,
    gameHistory: GameHistory
  ): readonly AchievementType[] {
    const achievements = this.getAchievements();
    const newlyUnlocked: AchievementType[] = [];

    const updatedAchievements = achievements.map((achievement) => {
      // Если уже разблокировано, пропускаем
      if (achievement.unlockedAt !== null) {
        return achievement;
      }

      const { progress, unlocked } = this.calculateProgress(
        achievement.id,
        statistics,
        gameHistory
      );

      if (unlocked && achievement.unlockedAt === null) {
        newlyUnlocked.push(achievement.id);
      }

      return {
        ...achievement,
        progress: Math.min(progress, achievement.maxProgress),
        unlockedAt: unlocked ? Date.now() : null,
      };
    });

    // Сохранить обновленные достижения
    const achievementsData: AchievementsData = {
      achievements: updatedAchievements,
      version: STORAGE_VERSION,
    };
    this.storage.set(STORAGE_KEYS.ACHIEVEMENTS, achievementsData);

    return newlyUnlocked;
  }

  /**
   * Вычислить прогресс достижения
   */
  private calculateProgress(
    achievementId: AchievementType,
    statistics: GameStatistics,
    gameHistory: GameHistory
  ): { progress: number; unlocked: boolean } {
    switch (achievementId) {
      case AchievementType.FIRST_WIN:
        return {
          progress: statistics.wins > 0 ? 1 : 0,
          unlocked: statistics.wins >= 1,
        };

      case AchievementType.WIN_STREAK_5:
        return {
          progress: Math.min(statistics.currentStreak, 5),
          unlocked: statistics.currentStreak >= 5,
        };

      case AchievementType.WIN_STREAK_10:
        return {
          progress: Math.min(statistics.currentStreak, 10),
          unlocked: statistics.currentStreak >= 10,
        };

      case AchievementType.PERFECT_GAME:
        // Проверяем последние игры на идеальную победу (5 ходов)
        const perfectGame = gameHistory.some(
          (game) =>
            game.result === GameResult.WIN &&
            game.duration !== undefined &&
            game.duration <= 30 // Примерно 5 ходов * 6 секунд
        );
        return {
          progress: perfectGame ? 1 : 0,
          unlocked: perfectGame,
        };

      case AchievementType.HARD_MODE_WIN:
        return {
          progress: statistics.gamesByDifficulty[AIDifficulty.HARD].wins > 0 ? 1 : 0,
          unlocked: statistics.gamesByDifficulty[AIDifficulty.HARD].wins >= 1,
        };

      case AchievementType.TOTAL_WINS_10:
        return {
          progress: Math.min(statistics.wins, 10),
          unlocked: statistics.wins >= 10,
        };

      case AchievementType.TOTAL_WINS_50:
        return {
          progress: Math.min(statistics.wins, 50),
          unlocked: statistics.wins >= 50,
        };

      case AchievementType.TOTAL_WINS_100:
        return {
          progress: Math.min(statistics.wins, 100),
          unlocked: statistics.wins >= 100,
        };

      case AchievementType.NO_LOSSES_5:
        // Проверяем последние 5 игр на отсутствие проигрышей
        const recentGames = gameHistory.slice(0, 5);
        const noLosses =
          recentGames.length === 5 &&
          recentGames.every(
            (game) => game.result === GameResult.WIN || game.result === GameResult.DRAW
          );
        const noLossesCount = recentGames.filter(
          (game) => game.result === GameResult.WIN || game.result === GameResult.DRAW
        ).length;
        return {
          progress: Math.min(noLossesCount, 5),
          unlocked: noLosses,
        };

      case AchievementType.ALL_DIFFICULTIES:
        const easyWin = statistics.gamesByDifficulty[AIDifficulty.EASY].wins > 0;
        const mediumWin = statistics.gamesByDifficulty[AIDifficulty.MEDIUM].wins > 0;
        const hardWin = statistics.gamesByDifficulty[AIDifficulty.HARD].wins > 0;
        const progress = (easyWin ? 1 : 0) + (mediumWin ? 1 : 0) + (hardWin ? 1 : 0);
        return {
          progress,
          unlocked: progress >= 3,
        };

      case AchievementType.FIRST_LOSS:
        return {
          progress: statistics.losses > 0 ? 1 : 0,
          unlocked: statistics.losses >= 1,
        };

      case AchievementType.FIRST_DRAW:
        return {
          progress: statistics.draws > 0 ? 1 : 0,
          unlocked: statistics.draws >= 1,
        };

      case AchievementType.TOTAL_LOSSES_10:
        return {
          progress: Math.min(statistics.losses, 10),
          unlocked: statistics.losses >= 10,
        };

      case AchievementType.TOTAL_DRAWS_5:
        return {
          progress: Math.min(statistics.draws, 5),
          unlocked: statistics.draws >= 5,
        };

      default:
        return { progress: 0, unlocked: false };
    }
  }

  /**
   * Создать пустую коллекцию достижений
   */
  private createEmptyAchievements(): readonly Achievement[] {
    return ACHIEVEMENT_DEFINITIONS.map((achievement) => ({
      ...achievement,
      unlockedAt: null,
      progress: 0,
    }));
  }

  /**
   * Валидация данных достижений
   */
  private isValidAchievementsData(data: unknown): data is AchievementsData {
    if (typeof data !== "object" || data === null) {
      return false;
    }

    const d = data as Record<string, unknown>;

    return (
      Array.isArray(d.achievements) &&
      typeof d.version === "number" &&
      d.achievements.every((achievement: unknown) => this.isValidAchievement(achievement))
    );
  }

  /**
   * Валидация достижения
   */
  private isValidAchievement(achievement: unknown): achievement is Achievement {
    if (typeof achievement !== "object" || achievement === null) {
      return false;
    }

    const a = achievement as Record<string, unknown>;

    return (
      typeof a.id === "string" &&
      typeof a.name === "string" &&
      typeof a.description === "string" &&
      typeof a.icon === "string" &&
      (a.unlockedAt === null || typeof a.unlockedAt === "number") &&
      typeof a.progress === "number" &&
      typeof a.maxProgress === "number"
    );
  }

  /**
   * Миграция достижений
   */
  private migrateAchievements(data: AchievementsData): AchievementsData {
    if (data.version === STORAGE_VERSION) {
      return data;
    }

    // Миграция: убедиться, что все достижения присутствуют
    const allAchievements = ACHIEVEMENT_DEFINITIONS.map((def) => {
      const existing = data.achievements.find((a) => a.id === def.id);
      return existing || { ...def, unlockedAt: null, progress: 0 };
    });

    const migrated: AchievementsData = {
      achievements: allAchievements,
      version: STORAGE_VERSION,
    };

    this.storage.set(STORAGE_KEYS.ACHIEVEMENTS, migrated);

    return migrated;
  }

  /**
   * Сбросить все достижения
   */
  resetAchievements(): void {
    this.storage.remove(STORAGE_KEYS.ACHIEVEMENTS);
  }
}

/**
 * Экземпляр сервиса по умолчанию
 */
export const achievementsService = new AchievementsService();
