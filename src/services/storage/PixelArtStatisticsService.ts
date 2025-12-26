/**
 * Сервис для работы с накопительной статистикой пиксель-арт игры
 * Хранит статистику отдельно от состояния игры, чтобы не терять данные при продаже предметов
 */

import { defaultStorageService } from "./StorageService";
import { STORAGE_VERSION } from "./StorageTypes";
import type { PixelArtGameStatistics } from "@/types/pixel-art-statistics.types";
import { createEmptyStatistics } from "@/types/pixel-art-statistics.types";
import type { GameState } from "@/types/pixel-art-game.types";
import { ItemType } from "@/types/pixel-art-game.types";

/**
 * Данные статистики для хранения
 */
interface PixelArtStatisticsData {
  readonly statistics: PixelArtGameStatistics;
  readonly version: number;
  readonly lastSessionUpdateTime?: number; // Время последнего обновления сессии
  readonly currentSessionStartTime?: number; // Время начала текущей сессии в браузере
}

/**
 * Сервис для управления накопительной статистикой
 */
export class PixelArtStatisticsService {
  private readonly storage = defaultStorageService;
  private readonly storageKey = "pixel_art_statistics";

  /**
   * Получить статистику
   */
  getStatistics(): PixelArtGameStatistics {
    const data = this.storage.get<PixelArtStatisticsData>(this.storageKey);

    if (!data || !this.isValidStatisticsData(data)) {
      return createEmptyStatistics();
    }

    return this.migrateStatistics(data).statistics;
  }

  /**
   * Обновить статистику на основе текущего состояния игры
   * Обновляет только динамические значения (уровень, этаж, опыт), не накопительные счетчики
   */
  updateStatistics(gameState: GameState): PixelArtGameStatistics {
    const data = this.storage.get<PixelArtStatisticsData>(this.storageKey);
    const currentStats = data?.statistics || createEmptyStatistics();
    const now = Date.now();

    // Вычисляем время игры для текущей сессии
    let totalPlayTime = currentStats.totalPlayTime;
    let sessionsCount = currentStats.sessionsCount;
    let currentSessionStartTime = data?.currentSessionStartTime;

    if (gameState.isGameStarted) {
      // Если это новая сессия в браузере (нет currentSessionStartTime или игра только что запущена)
      if (
        !currentSessionStartTime ||
        (gameState.gameStartTime &&
          gameState.gameStartTime > (data?.lastSessionUpdateTime || 0))
      ) {
        // Новая сессия - увеличиваем счетчик
        sessionsCount = currentStats.sessionsCount + 1;
        // Запоминаем время начала текущей сессии
        currentSessionStartTime = now;
      }

      // Добавляем время с последнего обновления
      const lastUpdate = data?.lastSessionUpdateTime || currentSessionStartTime || now;
      if (now > lastUpdate && currentSessionStartTime) {
        // Добавляем только новое время (не считаем повторно уже учтенное)
        const timeDelta = now - lastUpdate;
        totalPlayTime = currentStats.totalPlayTime + timeDelta;
      }
    } else {
      // Игра не запущена - сбрасываем время начала сессии
      currentSessionStartTime = undefined;
    }

    // Обновляем только динамические значения, накопительные счетчики не трогаем
    const newStats: PixelArtGameStatistics = {
      ...currentStats,
      currentLevel: gameState.player.stats.level,
      maxLevel: Math.max(currentStats.maxLevel, gameState.player.stats.level),
      maxFloor: Math.max(currentStats.maxFloor, gameState.mapLevel ?? 1),
      totalExperience: Math.max(
        currentStats.totalExperience,
        gameState.player.stats.experience
      ),
      totalPlayTime,
      sessionsCount,
      lastPlayed: gameState.lastSaveTime,
    };

    // Сохраняем статистику с временем последнего обновления
    const newData: PixelArtStatisticsData = {
      statistics: newStats,
      version: STORAGE_VERSION,
      lastSessionUpdateTime: now,
      currentSessionStartTime,
    };
    this.storage.set(this.storageKey, newData);

    return newStats;
  }

  /**
   * Увеличить счетчик собранных предметов
   */
  incrementItemCount(itemType: ItemType): void {
    const currentStats = this.getStatistics();
    let newStats: PixelArtGameStatistics;

    switch (itemType) {
      case ItemType.COIN:
        newStats = {
          ...currentStats,
          totalCoinsCollected: currentStats.totalCoinsCollected + 1,
        };
        break;
      case ItemType.POTION:
        newStats = {
          ...currentStats,
          totalPotionsCollected: currentStats.totalPotionsCollected + 1,
        };
        break;
      case ItemType.STAMINA_POTION:
        newStats = {
          ...currentStats,
          totalStaminaPotionsCollected: currentStats.totalStaminaPotionsCollected + 1,
        };
        break;
      case ItemType.RARE_ITEM:
        newStats = {
          ...currentStats,
          totalRareItemsCollected: currentStats.totalRareItemsCollected + 1,
        };
        break;
      default:
        return;
    }

    this.saveStatistics(newStats);
  }

  /**
   * Увеличить счетчик проданных предметов
   */
  incrementItemsSold(): void {
    const currentStats = this.getStatistics();
    const newStats: PixelArtGameStatistics = {
      ...currentStats,
      itemsSold: currentStats.itemsSold + 1,
    };
    this.saveStatistics(newStats);
  }

  /**
   * Сохранить статистику
   */
  private saveStatistics(statistics: PixelArtGameStatistics): void {
    const existingData = this.storage.get<PixelArtStatisticsData>(this.storageKey);
    const data: PixelArtStatisticsData = {
      statistics,
      version: STORAGE_VERSION,
      lastSessionUpdateTime: existingData?.lastSessionUpdateTime,
      currentSessionStartTime: existingData?.currentSessionStartTime,
    };
    this.storage.set(this.storageKey, data);
  }

  /**
   * Валидация данных статистики
   */
  private isValidStatisticsData(data: unknown): data is PixelArtStatisticsData {
    if (typeof data !== "object" || data === null) {
      return false;
    }

    const d = data as Record<string, unknown>;

    return (
      typeof d.statistics === "object" &&
      d.statistics !== null &&
      typeof d.version === "number"
    );
  }

  /**
   * Миграция статистики
   */
  private migrateStatistics(data: PixelArtStatisticsData): PixelArtStatisticsData {
    if (data.version === STORAGE_VERSION) {
      return data;
    }

    // Миграция: убедиться, что все поля присутствуют
    const migrated: PixelArtStatisticsData = {
      statistics: {
        ...createEmptyStatistics(),
        ...data.statistics,
      },
      version: STORAGE_VERSION,
      lastSessionUpdateTime: data.lastSessionUpdateTime,
      currentSessionStartTime: data.currentSessionStartTime,
    };

    this.storage.set(this.storageKey, migrated);
    return migrated;
  }

  /**
   * Сбросить статистику
   */
  resetStatistics(): void {
    this.storage.remove(this.storageKey);
  }
}

/**
 * Экземпляр сервиса по умолчанию
 */
export const pixelArtStatisticsService = new PixelArtStatisticsService();
