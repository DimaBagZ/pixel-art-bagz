/**
 * Сервис для работы с достижениями пиксель-арт игры
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import { defaultStorageService } from "./StorageService";
import { STORAGE_KEYS, STORAGE_VERSION } from "./StorageTypes";
import type { PixelArtAchievement, PixelArtAchievementsData } from "@/types/pixel-art-achievements.types";
import { PixelArtAchievementType } from "@/types/pixel-art-achievements.types";
import type { PixelArtGameStatistics } from "@/types/pixel-art-statistics.types";
import type { GameState } from "@/types/pixel-art-game.types";

/**
 * Определения всех достижений пиксель-арт игры
 */
const ACHIEVEMENT_DEFINITIONS: readonly PixelArtAchievement[] = [
  {
    id: PixelArtAchievementType.FIRST_COIN,
    name: "Первая монета",
    description: "Соберите свою первую монету",
    icon: "💰",
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: PixelArtAchievementType.COINS_10,
    name: "Новичок-коллекционер",
    description: "Соберите 10 монет",
    icon: "🪙",
    unlockedAt: null,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: PixelArtAchievementType.COINS_50,
    name: "Опытный коллекционер",
    description: "Соберите 50 монет",
    icon: "💵",
    unlockedAt: null,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: PixelArtAchievementType.COINS_100,
    name: "Мастер коллекционирования",
    description: "Соберите 100 монет",
    icon: "💎",
    unlockedAt: null,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: PixelArtAchievementType.FIRST_POTION,
    name: "Первое зелье",
    description: "Соберите своё первое зелье здоровья",
    icon: "🧪",
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: PixelArtAchievementType.POTIONS_5,
    name: "Алхимик-новичок",
    description: "Соберите 5 зелий здоровья",
    icon: "⚗️",
    unlockedAt: null,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: PixelArtAchievementType.POTIONS_15,
    name: "Мастер алхимии",
    description: "Соберите 15 зелий здоровья",
    icon: "🔮",
    unlockedAt: null,
    progress: 0,
    maxProgress: 15,
  },
  {
    id: PixelArtAchievementType.FIRST_STAMINA_POTION,
    name: "Энергетик",
    description: "Соберите своё первое зелье стамины",
    icon: "💚",
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: PixelArtAchievementType.STAMINA_POTIONS_10,
    name: "Марафонец",
    description: "Соберите 10 зелий стамины",
    icon: "🏃",
    unlockedAt: null,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: PixelArtAchievementType.FIRST_RARE_ITEM,
    name: "Первая находка",
    description: "Соберите свой первый редкий предмет",
    icon: "⭐",
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: PixelArtAchievementType.ALL_RARE_ITEMS,
    name: "Полная коллекция",
    description: "Соберите 10 редких предметов",
    icon: "🏆",
    unlockedAt: null,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: PixelArtAchievementType.LEVEL_2,
    name: "Первый уровень",
    description: "Достигните 2 уровня персонажа",
    icon: "📈",
    unlockedAt: null,
    progress: 0,
    maxProgress: 2,
  },
  {
    id: PixelArtAchievementType.LEVEL_5,
    name: "Опытный",
    description: "Достигните 5 уровня персонажа",
    icon: "🌟",
    unlockedAt: null,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: PixelArtAchievementType.LEVEL_10,
    name: "Ветеран",
    description: "Достигните 10 уровня персонажа",
    icon: "👑",
    unlockedAt: null,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: PixelArtAchievementType.FLOOR_3,
    name: "Исследователь",
    description: "Доберитесь до 3-го этажа",
    icon: "🚪",
    unlockedAt: null,
    progress: 0,
    maxProgress: 3,
  },
  {
    id: PixelArtAchievementType.FLOOR_5,
    name: "Глубокий спуск",
    description: "Доберитесь до 5-го этажа",
    icon: "⬇️",
    unlockedAt: null,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: PixelArtAchievementType.FLOOR_10,
    name: "Легенда бункера",
    description: "Доберитесь до 10-го этажа",
    icon: "🏛️",
    unlockedAt: null,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: PixelArtAchievementType.PLAY_TIME_1_HOUR,
    name: "Выживший",
    description: "Проведите 1 час в игре",
    icon: "⏰",
    unlockedAt: null,
    progress: 0,
    maxProgress: 3600000, // 1 час в миллисекундах
  },
  {
    id: PixelArtAchievementType.COINS_100_SESSION,
    name: "Богатая сессия",
    description: "Соберите 100 монет за одну сессию",
    icon: "💸",
    unlockedAt: null,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: PixelArtAchievementType.FULL_INVENTORY,
    name: "Полный инвентарь",
    description: "Заполните весь инвентарь (10 слотов)",
    icon: "📦",
    unlockedAt: null,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: PixelArtAchievementType.TRADER,
    name: "Торговец",
    description: "Продайте 10 предметов на терминале",
    icon: "💱",
    unlockedAt: null,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: PixelArtAchievementType.TREASURE_HUNTER,
    name: "Охотник за сокровищами",
    description: "Откройте 3 сокровищницы",
    icon: "🔐",
    unlockedAt: null,
    progress: 0,
    maxProgress: 3,
  },
] as const;

/**
 * Сервис для управления достижениями пиксель-арт игры
 */
export class PixelArtAchievementsService {
  private readonly storage = defaultStorageService;
  private readonly storageKey = "pixel_art_achievements";

  /**
   * Получить все достижения
   */
  getAchievements(): readonly PixelArtAchievement[] {
    const data = this.storage.get<PixelArtAchievementsData>(this.storageKey);

    if (!data || !this.isValidAchievementsData(data)) {
      return this.createEmptyAchievements();
    }

    return this.migrateAchievements(data).achievements;
  }

  /**
   * Проверить и обновить достижения на основе статистики и состояния игры
   */
  checkAchievements(
    statistics: PixelArtGameStatistics,
    gameState: GameState
  ): readonly PixelArtAchievementType[] {
    const achievements = this.getAchievements();
    const newlyUnlocked: PixelArtAchievementType[] = [];

    const updatedAchievements = achievements.map((achievement) => {
      // Если уже разблокировано, пропускаем
      if (achievement.unlockedAt !== null) {
        return achievement;
      }

      const { progress, unlocked } = this.calculateProgress(
        achievement.id,
        statistics,
        gameState
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
    const achievementsData: PixelArtAchievementsData = {
      achievements: updatedAchievements,
      version: STORAGE_VERSION,
    };
    this.storage.set(this.storageKey, achievementsData);

    return newlyUnlocked;
  }

  /**
   * Вычислить прогресс достижения
   */
  private calculateProgress(
    achievementId: PixelArtAchievementType,
    statistics: PixelArtGameStatistics,
    gameState: GameState
  ): { progress: number; unlocked: boolean } {
    switch (achievementId) {
      case PixelArtAchievementType.FIRST_COIN:
        return {
          progress: statistics.totalCoinsCollected > 0 ? 1 : 0,
          unlocked: statistics.totalCoinsCollected >= 1,
        };

      case PixelArtAchievementType.COINS_10:
        return {
          progress: Math.min(statistics.totalCoinsCollected, 10),
          unlocked: statistics.totalCoinsCollected >= 10,
        };

      case PixelArtAchievementType.COINS_50:
        return {
          progress: Math.min(statistics.totalCoinsCollected, 50),
          unlocked: statistics.totalCoinsCollected >= 50,
        };

      case PixelArtAchievementType.COINS_100:
        return {
          progress: Math.min(statistics.totalCoinsCollected, 100),
          unlocked: statistics.totalCoinsCollected >= 100,
        };

      case PixelArtAchievementType.FIRST_POTION:
        return {
          progress: statistics.totalPotionsCollected > 0 ? 1 : 0,
          unlocked: statistics.totalPotionsCollected >= 1,
        };

      case PixelArtAchievementType.POTIONS_5:
        return {
          progress: Math.min(statistics.totalPotionsCollected, 5),
          unlocked: statistics.totalPotionsCollected >= 5,
        };

      case PixelArtAchievementType.POTIONS_15:
        return {
          progress: Math.min(statistics.totalPotionsCollected, 15),
          unlocked: statistics.totalPotionsCollected >= 15,
        };

      case PixelArtAchievementType.FIRST_STAMINA_POTION:
        return {
          progress: (statistics.totalStaminaPotionsCollected ?? 0) > 0 ? 1 : 0,
          unlocked: (statistics.totalStaminaPotionsCollected ?? 0) >= 1,
        };

      case PixelArtAchievementType.STAMINA_POTIONS_10:
        return {
          progress: Math.min(statistics.totalStaminaPotionsCollected ?? 0, 10),
          unlocked: (statistics.totalStaminaPotionsCollected ?? 0) >= 10,
        };

      case PixelArtAchievementType.FIRST_RARE_ITEM:
        return {
          progress: statistics.totalRareItemsCollected > 0 ? 1 : 0,
          unlocked: statistics.totalRareItemsCollected >= 1,
        };

      case PixelArtAchievementType.ALL_RARE_ITEMS:
        return {
          progress: Math.min(statistics.totalRareItemsCollected, 10),
          unlocked: statistics.totalRareItemsCollected >= 10,
        };

      case PixelArtAchievementType.LEVEL_2:
        return {
          progress: Math.min(gameState.player.stats.level, 2),
          unlocked: gameState.player.stats.level >= 2,
        };

      case PixelArtAchievementType.LEVEL_5:
        return {
          progress: Math.min(gameState.player.stats.level, 5),
          unlocked: gameState.player.stats.level >= 5,
        };

      case PixelArtAchievementType.LEVEL_10:
        return {
          progress: Math.min(gameState.player.stats.level, 10),
          unlocked: gameState.player.stats.level >= 10,
        };

      case PixelArtAchievementType.FLOOR_3:
        return {
          progress: Math.min(gameState.mapLevel, 3),
          unlocked: gameState.mapLevel >= 3,
        };

      case PixelArtAchievementType.FLOOR_5:
        return {
          progress: Math.min(gameState.mapLevel, 5),
          unlocked: gameState.mapLevel >= 5,
        };

      case PixelArtAchievementType.FLOOR_10:
        return {
          progress: Math.min(gameState.mapLevel, 10),
          unlocked: gameState.mapLevel >= 10,
        };

      case PixelArtAchievementType.PLAY_TIME_1_HOUR:
        return {
          progress: Math.min(statistics.totalPlayTime, 3600000),
          unlocked: statistics.totalPlayTime >= 3600000,
        };

      case PixelArtAchievementType.COINS_100_SESSION:
        // Проверяем монеты в текущей сессии
        const sessionCoins = gameState.coins;
        return {
          progress: Math.min(sessionCoins, 100),
          unlocked: sessionCoins >= 100,
        };

      case PixelArtAchievementType.FULL_INVENTORY:
        // Проверяем заполненность инвентаря
        const usedSlots = gameState.inventory.filter((slot) => slot.item !== null).length;
        return {
          progress: Math.min(usedSlots, 10),
          unlocked: usedSlots >= 10,
        };

      case PixelArtAchievementType.TRADER:
        return {
          progress: Math.min(statistics.itemsSold ?? 0, 10),
          unlocked: (statistics.itemsSold ?? 0) >= 10,
        };

      case PixelArtAchievementType.TREASURE_HUNTER:
        return {
          progress: Math.min(statistics.treasuresOpened ?? 0, 3),
          unlocked: (statistics.treasuresOpened ?? 0) >= 3,
        };

      default:
        return { progress: 0, unlocked: false };
    }
  }

  /**
   * Создать пустую коллекцию достижений
   */
  private createEmptyAchievements(): readonly PixelArtAchievement[] {
    return ACHIEVEMENT_DEFINITIONS.map((achievement) => ({
      ...achievement,
      unlockedAt: null,
      progress: 0,
    }));
  }

  /**
   * Валидация данных достижений
   */
  private isValidAchievementsData(data: unknown): data is PixelArtAchievementsData {
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
  private isValidAchievement(achievement: unknown): achievement is PixelArtAchievement {
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
  private migrateAchievements(data: PixelArtAchievementsData): PixelArtAchievementsData {
    if (data.version === STORAGE_VERSION) {
      return data;
    }

    // Миграция: убедиться, что все достижения присутствуют
    const allAchievements = ACHIEVEMENT_DEFINITIONS.map((def) => {
      const existing = data.achievements.find((a) => a.id === def.id);
      return existing || { ...def, unlockedAt: null, progress: 0 };
    });

    const migrated: PixelArtAchievementsData = {
      achievements: allAchievements,
      version: STORAGE_VERSION,
    };

    this.storage.set(this.storageKey, migrated);

    return migrated;
  }

  /**
   * Сбросить все достижения
   */
  resetAchievements(): void {
    this.storage.remove(this.storageKey);
  }
}

/**
 * Экземпляр сервиса по умолчанию
 */
export const pixelArtAchievementsService = new PixelArtAchievementsService();

