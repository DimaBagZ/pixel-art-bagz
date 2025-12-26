/**
 * Типы достижений для пиксель-арт игры
 * Соблюдает принцип Single Responsibility
 */

/**
 * Тип достижения пиксель-арт игры
 */
export enum PixelArtAchievementType {
  FIRST_COIN = "FIRST_COIN",
  COINS_10 = "COINS_10",
  COINS_50 = "COINS_50",
  COINS_100 = "COINS_100",
  FIRST_POTION = "FIRST_POTION",
  POTIONS_5 = "POTIONS_5",
  POTIONS_15 = "POTIONS_15",
  FIRST_STAMINA_POTION = "FIRST_STAMINA_POTION",
  STAMINA_POTIONS_10 = "STAMINA_POTIONS_10",
  FIRST_RARE_ITEM = "FIRST_RARE_ITEM",
  ALL_RARE_ITEMS = "ALL_RARE_ITEMS",
  LEVEL_2 = "LEVEL_2",
  LEVEL_5 = "LEVEL_5",
  LEVEL_10 = "LEVEL_10",
  FLOOR_3 = "FLOOR_3",
  FLOOR_5 = "FLOOR_5",
  FLOOR_10 = "FLOOR_10",
  PLAY_TIME_1_HOUR = "PLAY_TIME_1_HOUR",
  COINS_100_SESSION = "COINS_100_SESSION",
  FULL_INVENTORY = "FULL_INVENTORY",
  TRADER = "TRADER",
  TREASURE_HUNTER = "TREASURE_HUNTER",
}

/**
 * Достижение пиксель-арт игры
 */
export interface PixelArtAchievement {
  readonly id: PixelArtAchievementType;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly unlockedAt: number | null;
  readonly progress: number;
  readonly maxProgress: number;
}

/**
 * Коллекция достижений пиксель-арт игры
 */
export interface PixelArtAchievementsData {
  readonly achievements: readonly PixelArtAchievement[];
  readonly version: number;
}
