/**
 * Типы статистики для пиксель-арт игры
 * Соблюдает принцип Single Responsibility
 */

/**
 * Статистика пиксель-арт игры
 */
export interface PixelArtGameStatistics {
  readonly totalCoinsCollected: number;
  readonly totalPotionsCollected: number;
  readonly totalRareItemsCollected: number;
  readonly currentLevel: number;
  readonly maxLevel: number;
  readonly totalExperience: number;
  readonly totalPlayTime: number; // в миллисекундах
  readonly lastPlayed: number;
  readonly sessionsCount: number;
  readonly version: number;
}

/**
 * История сессий игры
 */
export interface GameSession {
  readonly id: string;
  readonly startTime: number;
  readonly endTime?: number;
  readonly duration?: number; // в миллисекундах
  readonly coinsCollected: number;
  readonly potionsCollected: number;
  readonly rareItemsCollected: number;
  readonly experienceGained: number;
  readonly levelReached: number;
}

/**
 * Пустая статистика
 */
export const createEmptyStatistics = (): PixelArtGameStatistics => ({
  totalCoinsCollected: 0,
  totalPotionsCollected: 0,
  totalRareItemsCollected: 0,
  currentLevel: 1,
  maxLevel: 1,
  totalExperience: 0,
  totalPlayTime: 0,
  lastPlayed: 0,
  sessionsCount: 0,
  version: 1,
});
