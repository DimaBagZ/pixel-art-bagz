/**
 * Типы для DOOM-style игры
 * Строгая типизация без использования any
 */

/**
 * Позиция на карте (в пикселях для плавного движения)
 */
export interface Position {
  readonly x: number;
  readonly y: number;
}

/**
 * Позиция в тайлах
 */
export interface TilePosition {
  readonly tileX: number;
  readonly tileY: number;
}

/**
 * Направление движения (legacy, для совместимости)
 */
export enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

/**
 * Тип движения
 */
export enum MovementType {
  WALK = "WALK",
  RUN = "RUN",
  IDLE = "IDLE",
}

/**
 * Тип предмета
 */
export enum ItemType {
  COIN = "COIN", // Монета (дает XP, уходит в статистику)
  POTION = "POTION", // Зелье здоровья (красное, восстанавливает HP)
  STAMINA_POTION = "STAMINA_POTION", // Зелье стамины (зелёное, восстанавливает стамину)
  RARE_ITEM = "RARE_ITEM", // Редкий предмет (в инвентарь, дает больше XP)
}

/**
 * Предмет на карте
 */
export interface GameItem {
  readonly id: string;
  readonly type: ItemType;
  readonly position: Position;
  readonly collected: boolean;
  readonly spawnTime: number; // время появления (для анимации)
}

/**
 * Статистика персонажа
 */
export interface PlayerStats {
  readonly health: number;
  readonly maxHealth: number;
  readonly stamina: number;
  readonly maxStamina: number;
  readonly level: number;
  readonly experience: number;
  readonly experienceToNextLevel: number;
}

/**
 * Состояние персонажа (DOOM-style)
 */
export interface PlayerState {
  readonly position: Position;
  readonly direction: Direction;
  readonly angle: number; // Угол поворота в градусах (0-360)
  readonly movementType: MovementType;
  readonly stats: PlayerStats;
  readonly isMoving: boolean;
  readonly velocity: Position; // Текущая скорость для плавного движения
}

/**
 * Тип тайла карты
 */
export enum TileType {
  FLOOR = "FLOOR", // Пол (можно ходить)
  WALL = "WALL", // Стена (препятствие)
  OBSTACLE = "OBSTACLE", // Препятствие (можно обойти)
  DOOR = "DOOR", // Одиночная дверь (открывается при приближении)
  DOOR_OPEN = "DOOR_OPEN", // Открытая дверь (можно проходить)
  DOOR_WIDE = "DOOR_WIDE", // Широкая дверь (2-3 клетки, sci-fi)
  DOOR_WIDE_OPEN = "DOOR_WIDE_OPEN", // Открытая широкая дверь
  EXIT = "EXIT", // Выход на следующий уровень
  TERMINAL = "TERMINAL", // Торговый терминал
  FLOOR_LIGHT = "FLOOR_LIGHT", // Освещённый пол (для торговой комнаты)
  TREASURE_DOOR = "TREASURE_DOOR", // Дверь в сокровищницу (требует ребус)
  TREASURE_DOOR_OPEN = "TREASURE_DOOR_OPEN", // Открытая дверь в сокровищницу
}

/**
 * Тайл карты
 */
export interface Tile {
  readonly type: TileType;
  readonly position: Position;
}

/**
 * Карта игры
 */
export interface GameMap {
  readonly width: number;
  readonly height: number;
  readonly tiles: readonly Tile[][];
}

/**
 * Слот инвентаря
 */
export interface InventorySlot {
  readonly index: number;
  readonly item: GameItem | null;
}

/**
 * Собранные ресурсы (монеты, зелья)
 */
export interface CollectedResources {
  readonly coins: number;
  readonly healthPotions: number;
  readonly staminaPotions: number;
}

/**
 * Состояние игры
 */
export interface GameState {
  readonly player: PlayerState;
  readonly map: GameMap;
  readonly items: readonly GameItem[];
  readonly inventory: readonly InventorySlot[];
  readonly coins: number; // общее количество собранных монет
  readonly collectedResources: CollectedResources; // каунтеры ресурсов для продажи
  readonly isPaused: boolean;
  readonly isGameStarted: boolean; // игра начата (ворота открыты)
  readonly gameStartTime: number;
  readonly lastSaveTime: number;
  readonly mapLevel: number; // текущий уровень карты (1, 2, 3...)
  readonly treasureRoomUnlocked?: boolean; // открыта ли сокровищница на текущем уровне
}

/**
 * Цены продажи предметов (опыт)
 */
export const ITEM_SELL_PRICES: Record<ItemType, number> = {
  [ItemType.COIN]: 5,
  [ItemType.POTION]: 15,
  [ItemType.STAMINA_POTION]: 12,
  [ItemType.RARE_ITEM]: 50,
};

/**
 * Цены продажи ресурсов (опыт за единицу)
 */
export const RESOURCE_SELL_PRICES = {
  coins: 2, // опыт за монету
  healthPotions: 8, // опыт за зелье здоровья
  staminaPotions: 6, // опыт за зелье стамины
} as const;

/**
 * Сохраненное состояние игры
 */
export interface SavedGameState {
  readonly version: number;
  readonly timestamp: number;
  readonly gameState: GameState;
}

/**
 * Результат движения
 */
export interface MovementResult {
  readonly success: boolean;
  readonly newPosition: Position;
  readonly reason?: string;
}

/**
 * Результат сбора предмета
 */
export interface ItemCollectionResult {
  readonly success: boolean;
  readonly item: GameItem | null;
  readonly experienceGained: number;
  readonly healthRestored?: number;
  readonly staminaRestored?: number;
  readonly addedToInventory: boolean;
  readonly reason?: string;
}
