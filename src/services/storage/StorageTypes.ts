/**
 * Типы для клиентского хранилища
 * Строгая типизация без использования any
 */

import type { AIDifficulty, GameResult } from "@/types/game.types";

/**
 * Ключи для localStorage
 */
export const STORAGE_KEYS = {
  USER_PROFILE: "ttt_user_profile",
  STATISTICS: "ttt_statistics",
  GAME_HISTORY: "ttt_game_history",
  SETTINGS: "ttt_settings",
  ACHIEVEMENTS: "ttt_achievements",
  PIXEL_ART_GAME_STATE: "pixel_art_game_state", // Сохранение состояния пиксель-арт игры
} as const;

/**
 * Версия данных (для миграций)
 */
export const STORAGE_VERSION = 1;

/**
 * Профиль пользователя
 */
export interface UserProfile {
  readonly id: string;
  readonly name: string;
  readonly avatarId: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly preferredDifficulty?: AIDifficulty; // Опционально для обратной совместимости
  readonly version: number;
}

/**
 * Настройки пользователя
 */
export interface UserSettings {
  readonly userId: string;
  readonly difficulty: AIDifficulty;
  readonly avatarId: string;
  readonly soundEnabled?: boolean;
  readonly animationsEnabled?: boolean;
}

/**
 * Статистика игры по уровню сложности
 */
export interface GameStats {
  readonly wins: number;
  readonly losses: number;
  readonly draws: number;
  readonly winRate: number;
}

/**
 * Общая статистика игр
 */
export interface GameStatistics {
  readonly totalGames: number;
  readonly wins: number;
  readonly losses: number;
  readonly draws: number;
  readonly winRate: number;
  readonly currentStreak: number;
  readonly bestStreak: number;
  readonly gamesByDifficulty: Record<AIDifficulty, GameStats>;
  readonly lastPlayed: number;
  readonly version: number;
}

/**
 * Элемент истории игры
 */
export interface GameHistoryItem {
  readonly id: string;
  readonly result: GameResult;
  readonly difficulty: AIDifficulty;
  readonly duration?: number;
  readonly timestamp: number;
  readonly promoCode?: string;
}

/**
 * История игр (максимум 50 последних)
 */
export type GameHistory = readonly GameHistoryItem[];

/**
 * Данные для создания профиля
 */
export interface CreateProfileData {
  readonly name: string;
  readonly avatarId: string; // Будет валидирован через AvatarValidator
  readonly preferredDifficulty?: AIDifficulty; // Опционально для новой игры
}

/**
 * Тип достижения
 */
export enum AchievementType {
  FIRST_WIN = "FIRST_WIN",
  WIN_STREAK_5 = "WIN_STREAK_5",
  WIN_STREAK_10 = "WIN_STREAK_10",
  PERFECT_GAME = "PERFECT_GAME",
  HARD_MODE_WIN = "HARD_MODE_WIN",
  TOTAL_WINS_10 = "TOTAL_WINS_10",
  TOTAL_WINS_50 = "TOTAL_WINS_50",
  TOTAL_WINS_100 = "TOTAL_WINS_100",
  NO_LOSSES_5 = "NO_LOSSES_5",
  ALL_DIFFICULTIES = "ALL_DIFFICULTIES",
  FIRST_LOSS = "FIRST_LOSS",
  FIRST_DRAW = "FIRST_DRAW",
  TOTAL_LOSSES_10 = "TOTAL_LOSSES_10",
  TOTAL_DRAWS_5 = "TOTAL_DRAWS_5",
}

/**
 * Достижение
 */
export interface Achievement {
  readonly id: AchievementType;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly unlockedAt: number | null; // timestamp или null если не разблокировано
  readonly progress: number; // 0-100
  readonly maxProgress: number;
}

/**
 * Коллекция достижений
 */
export interface AchievementsData {
  readonly achievements: readonly Achievement[];
  readonly version: number;
}
