/**
 * Сервис для работы со статистикой игр
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import { defaultStorageService } from "./StorageService";
import { STORAGE_KEYS, STORAGE_VERSION } from "./StorageTypes";
import type {
  GameStatistics,
  GameHistory,
  GameHistoryItem,
  GameStats,
} from "./StorageTypes";
import { GameResult, AIDifficulty } from "@/types/game.types";

/**
 * Максимальное количество игр в истории
 */
const MAX_HISTORY_SIZE = 50;

/**
 * Сервис для управления статистикой игр
 */
export class StatisticsService {
  private readonly storage = defaultStorageService;

  /**
   * Получить статистику игр
   */
  getStatistics(): GameStatistics {
    const statistics = this.storage.get<GameStatistics>(STORAGE_KEYS.STATISTICS);

    if (!statistics || !this.isValidStatistics(statistics)) {
      return this.createEmptyStatistics();
    }

    // Миграция данных при необходимости
    return this.migrateStatistics(statistics);
  }

  /**
   * Обновить статистику после игры
   */
  updateStatistics(
    result: GameResult,
    difficulty: AIDifficulty,
    duration?: number,
    promoCode?: string
  ): void {
    const statistics = this.getStatistics();
    const updated = this.calculateUpdatedStatistics(statistics, result, difficulty);

    this.storage.set(STORAGE_KEYS.STATISTICS, updated);

    // Добавить игру в историю
    this.addGameToHistory({
      result,
      difficulty,
      duration,
      promoCode,
    });
  }

  /**
   * Сбросить статистику
   */
  resetStatistics(): void {
    this.storage.remove(STORAGE_KEYS.STATISTICS);
  }

  /**
   * Получить историю игр
   */
  getGameHistory(): GameHistory {
    const history = this.storage.get<GameHistoryItem[]>(STORAGE_KEYS.GAME_HISTORY);

    if (!history || !Array.isArray(history)) {
      return [];
    }

    // Валидация и миграция элементов истории
    const validHistory = history
      .filter((item) => this.isValidHistoryItem(item))
      .map((item) => this.migrateHistoryItem(item));

    // Сохранить мигрированную историю, если были изменения
    const hasChanges = validHistory.some(
      (item, index) => item.result !== history[index]?.result
    );
    if (hasChanges) {
      this.storage.set(STORAGE_KEYS.GAME_HISTORY, validHistory);
    }

    return validHistory;
  }

  /**
   * Добавить игру в историю
   */
  addGameToHistory(game: Omit<GameHistoryItem, "id" | "timestamp">): void {
    const history = this.getGameHistory();
    const newItem: GameHistoryItem = {
      ...game,
      id: this.generateUUID(),
      timestamp: Date.now(),
    };

    // Добавить в начало и ограничить размер
    const updatedHistory: GameHistoryItem[] = [newItem, ...history].slice(
      0,
      MAX_HISTORY_SIZE
    );

    this.storage.set(STORAGE_KEYS.GAME_HISTORY, updatedHistory);
  }

  /**
   * Очистить историю игр
   */
  clearGameHistory(): void {
    this.storage.remove(STORAGE_KEYS.GAME_HISTORY);
  }

  /**
   * Создать пустую статистику
   */
  private createEmptyStatistics(): GameStatistics {
    const emptyStats: GameStats = {
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
    };

    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      currentStreak: 0,
      bestStreak: 0,
      gamesByDifficulty: {
        [AIDifficulty.EASY]: { ...emptyStats },
        [AIDifficulty.MEDIUM]: { ...emptyStats },
        [AIDifficulty.HARD]: { ...emptyStats },
      },
      lastPlayed: 0,
      version: STORAGE_VERSION,
    };
  }

  /**
   * Вычислить обновленную статистику
   */
  private calculateUpdatedStatistics(
    current: GameStatistics,
    result: GameResult,
    difficulty: AIDifficulty
  ): GameStatistics {
    const totalGames = current.totalGames + 1;
    let wins = current.wins;
    let losses = current.losses;
    let draws = current.draws;
    let currentStreak = current.currentStreak;
    let bestStreak = current.bestStreak;

    // Обновить общую статистику
    if (result === GameResult.WIN) {
      wins += 1;
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else if (result === GameResult.DRAW) {
      draws += 1;
      currentStreak = 0;
    } else if (result === GameResult.LOSE) {
      losses += 1;
      currentStreak = 0;
    }
    // IN_PROGRESS не должен попадать в статистику

    // Вычислить процент побед
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    // Обновить статистику по сложности
    const difficultyStats = current.gamesByDifficulty[difficulty];
    let difficultyWins = difficultyStats.wins;
    let difficultyLosses = difficultyStats.losses;
    let difficultyDraws = difficultyStats.draws;

    if (result === GameResult.WIN) {
      difficultyWins += 1;
    } else if (result === GameResult.DRAW) {
      difficultyDraws += 1;
    } else if (result === GameResult.LOSE) {
      difficultyLosses += 1;
    }
    // IN_PROGRESS не должен попадать в статистику

    const difficultyTotal = difficultyWins + difficultyLosses + difficultyDraws;
    const difficultyWinRate =
      difficultyTotal > 0 ? (difficultyWins / difficultyTotal) * 100 : 0;

    const updatedDifficultyStats: GameStats = {
      wins: difficultyWins,
      losses: difficultyLosses,
      draws: difficultyDraws,
      winRate: difficultyWinRate,
    };

    return {
      totalGames,
      wins,
      losses,
      draws,
      winRate: Math.round(winRate * 100) / 100, // Округление до 2 знаков
      currentStreak,
      bestStreak,
      gamesByDifficulty: {
        ...current.gamesByDifficulty,
        [difficulty]: updatedDifficultyStats,
      },
      lastPlayed: Date.now(),
      version: STORAGE_VERSION,
    };
  }

  /**
   * Валидация статистики
   */
  private isValidStatistics(statistics: unknown): statistics is GameStatistics {
    if (typeof statistics !== "object" || statistics === null) {
      return false;
    }

    const s = statistics as Record<string, unknown>;

    return (
      typeof s.totalGames === "number" &&
      typeof s.wins === "number" &&
      typeof s.losses === "number" &&
      typeof s.draws === "number" &&
      typeof s.winRate === "number" &&
      typeof s.currentStreak === "number" &&
      typeof s.bestStreak === "number" &&
      typeof s.lastPlayed === "number" &&
      typeof s.gamesByDifficulty === "object" &&
      s.gamesByDifficulty !== null
    );
  }

  /**
   * Валидация элемента истории
   */
  private isValidHistoryItem(item: unknown): item is GameHistoryItem {
    if (typeof item !== "object" || item === null) {
      return false;
    }

    const i = item as Record<string, unknown>;

    return (
      typeof i.id === "string" &&
      typeof i.result === "string" &&
      typeof i.difficulty === "string" &&
      typeof i.timestamp === "number" &&
      (i.duration === undefined || typeof i.duration === "number") &&
      (i.promoCode === undefined || typeof i.promoCode === "string")
    );
  }

  /**
   * Миграция элемента истории (исправление старых данных)
   * IN_PROGRESS в истории означает некорректные данные - исправляем на LOSE
   */
  private migrateHistoryItem(item: GameHistoryItem): GameHistoryItem {
    // Если результат IN_PROGRESS, это некорректно для завершенной игры
    // Исправляем на LOSE (проигрыш), так как победы сохранялись правильно
    if (item.result === GameResult.IN_PROGRESS) {
      return {
        ...item,
        result: GameResult.LOSE,
      };
    }

    return item;
  }

  /**
   * Миграция статистики при изменении версии
   */
  private migrateStatistics(statistics: GameStatistics): GameStatistics {
    if (statistics.version === STORAGE_VERSION) {
      return statistics;
    }

    // Миграция на новую версию
    const migrated: GameStatistics = {
      ...statistics,
      version: STORAGE_VERSION,
      // Убедиться, что все уровни сложности присутствуют
      gamesByDifficulty: {
        [AIDifficulty.EASY]: statistics.gamesByDifficulty[AIDifficulty.EASY] || {
          wins: 0,
          losses: 0,
          draws: 0,
          winRate: 0,
        },
        [AIDifficulty.MEDIUM]: statistics.gamesByDifficulty[AIDifficulty.MEDIUM] || {
          wins: 0,
          losses: 0,
          draws: 0,
          winRate: 0,
        },
        [AIDifficulty.HARD]: statistics.gamesByDifficulty[AIDifficulty.HARD] || {
          wins: 0,
          losses: 0,
          draws: 0,
          winRate: 0,
        },
      },
    };

    // Сохранить мигрированную статистику
    this.storage.set(STORAGE_KEYS.STATISTICS, migrated);

    return migrated;
  }

  /**
   * Генерация UUID
   */
  private generateUUID(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  }
}

/**
 * Экземпляр сервиса по умолчанию
 */
export const statisticsService = new StatisticsService();
