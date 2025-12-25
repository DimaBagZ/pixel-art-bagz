/**
 * Типы для пиксель-арт игры
 * Строгая типизация без использования any
 */

/**
 * Позиция на карте (в тайлах)
 */
export interface Position {
  readonly x: number;
  readonly y: number;
}

/**
 * Направление движения
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
  POTION = "POTION", // Зелье (применяется сразу, восстанавливает HP)
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
 * Состояние персонажа
 */
export interface PlayerState {
  readonly position: Position;
  readonly direction: Direction;
  readonly movementType: MovementType;
  readonly stats: PlayerStats;
  readonly isMoving: boolean;
}

/**
 * Тип тайла карты
 */
export enum TileType {
  FLOOR = "FLOOR", // Пол (можно ходить)
  WALL = "WALL", // Стена (препятствие)
  OBSTACLE = "OBSTACLE", // Препятствие (можно обойти)
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
 * Состояние игры
 */
export interface GameState {
  readonly player: PlayerState;
  readonly map: GameMap;
  readonly items: readonly GameItem[];
  readonly inventory: readonly InventorySlot[];
  readonly coins: number; // общее количество собранных монет
  readonly isPaused: boolean;
  readonly isGameStarted: boolean; // игра начата (ворота открыты)
  readonly gameStartTime: number;
  readonly lastSaveTime: number;
}

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
  readonly addedToInventory: boolean;
  readonly reason?: string;
}
