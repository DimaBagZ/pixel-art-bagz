/**
 * Константы для пиксель-арт игры
 */

/**
 * Конфигурация игры
 */
export const GAME_CONFIG = {
  // Размер карты
  MAP_WIDTH: 40,
  MAP_HEIGHT: 40,
  
  // Размер тайла в пикселях
  TILE_SIZE: 32,
  
  // Скорость движения
  WALK_SPEED: 0.3,      // секунд на тайл
  RUN_SPEED: 0.15,      // секунд на тайл (в 2 раза быстрее)
  
  // Стамина
  MAX_STAMINA: 100,
  STAMINA_DRAIN_RATE: 2,      // трата стамины в секунду при беге
  STAMINA_RECOVERY_RATE: 1,   // восстановление стамины в секунду
  
  // Здоровье
  MAX_HEALTH: 100,
  STARTING_HEALTH: 100,
  
  // Опыт
  COIN_XP_VALUE: 1,           // XP за монету
  RARE_ITEM_XP_VALUE: 10,     // XP за редкий предмет
  
  // Уровни (прогрессия опыта)
  XP_PER_LEVEL: [
    0,    // Level 1 (старт)
    10,   // Level 2
    25,   // Level 3
    50,   // Level 4
    100,  // Level 5
    200,  // Level 6
    350,  // Level 7
    550,  // Level 8
    800,  // Level 9
    1200, // Level 10
    1700, // Level 11
    2300, // Level 12
    3000, // Level 13
    3800, // Level 14
    4700, // Level 15
  ],
  
  // Инвентарь
  INVENTORY_SIZE: 10,
  
  // Предметы на карте
  COINS_COUNT: 50,             // количество монет
  POTIONS_COUNT: 15,           // количество зелий
  RARE_ITEMS_COUNT: 5,         // количество редких предметов (меньше)
  
  // Зелья
  POTION_HEALTH_RESTORE: 25,   // восстановление HP от зелья
  
  // Автосохранение
  AUTO_SAVE_INTERVAL: 5000,    // каждые 5 секунд
  
  // Версия сохранения
  SAVE_VERSION: 1,
} as const;

/**
 * Сообщения игры
 */
export const GAME_MESSAGES = {
  GAME_STARTED: "Игра начата",
  GAME_PAUSED: "Игра приостановлена",
  GAME_RESUMED: "Игра возобновлена",
  ITEM_COLLECTED: (itemType: string) => `Собран предмет: ${itemType}`,
  LEVEL_UP: (level: number) => `Уровень повышен до ${level}!`,
  HEALTH_RESTORED: (amount: number) => `Восстановлено здоровья: ${amount}`,
  STAMINA_DEPLETED: "Стамина закончилась, переключение на шаг",
  INVENTORY_FULL: "Инвентарь полон",
  CANNOT_MOVE: "Невозможно двигаться в этом направлении",
} as const;

/**
 * Направления движения (для удобства)
 */
export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
} as const;

