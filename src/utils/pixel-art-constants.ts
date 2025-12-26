/**
 * Константы для DOOM-style игры
 */

/**
 * Настройки уровней карты (размер увеличивается с каждым уровнем)
 */
export const MAP_LEVEL_CONFIG = {
  // Базовый размер карты
  BASE_WIDTH: 24,
  BASE_HEIGHT: 24,

  // Увеличение размера за каждый уровень
  WIDTH_PER_LEVEL: 6,
  HEIGHT_PER_LEVEL: 6,

  // Максимальный размер
  MAX_WIDTH: 64,
  MAX_HEIGHT: 64,

  // Максимальный уровень (бесконечно, но размер перестаёт расти после этого)
  MAX_LEVEL: 99,

  // Количество предметов увеличивается с уровнем
  COINS_BASE: 15,
  COINS_PER_LEVEL: 5,
  POTIONS_BASE: 5,
  POTIONS_PER_LEVEL: 2,
  STAMINA_POTIONS_BASE: 3,
  STAMINA_POTIONS_PER_LEVEL: 1,
  RARE_ITEMS_BASE: 2,
  RARE_ITEMS_PER_LEVEL: 1,
} as const;

/**
 * Получить размер карты для уровня
 */
export function getMapSizeForLevel(level: number): { width: number; height: number } {
  const clampedLevel = Math.min(level, MAP_LEVEL_CONFIG.MAX_LEVEL);
  return {
    width: Math.min(
      MAP_LEVEL_CONFIG.BASE_WIDTH + (clampedLevel - 1) * MAP_LEVEL_CONFIG.WIDTH_PER_LEVEL,
      MAP_LEVEL_CONFIG.MAX_WIDTH
    ),
    height: Math.min(
      MAP_LEVEL_CONFIG.BASE_HEIGHT +
        (clampedLevel - 1) * MAP_LEVEL_CONFIG.HEIGHT_PER_LEVEL,
      MAP_LEVEL_CONFIG.MAX_HEIGHT
    ),
  };
}

/**
 * Получить количество предметов для уровня
 */
export function getItemCountsForLevel(level: number): {
  coins: number;
  potions: number;
  staminaPotions: number;
  rareItems: number;
} {
  const clampedLevel = Math.min(level, MAP_LEVEL_CONFIG.MAX_LEVEL);
  return {
    coins:
      MAP_LEVEL_CONFIG.COINS_BASE + (clampedLevel - 1) * MAP_LEVEL_CONFIG.COINS_PER_LEVEL,
    potions:
      MAP_LEVEL_CONFIG.POTIONS_BASE +
      (clampedLevel - 1) * MAP_LEVEL_CONFIG.POTIONS_PER_LEVEL,
    staminaPotions:
      MAP_LEVEL_CONFIG.STAMINA_POTIONS_BASE +
      (clampedLevel - 1) * MAP_LEVEL_CONFIG.STAMINA_POTIONS_PER_LEVEL,
    rareItems:
      MAP_LEVEL_CONFIG.RARE_ITEMS_BASE +
      (clampedLevel - 1) * MAP_LEVEL_CONFIG.RARE_ITEMS_PER_LEVEL,
  };
}

/**
 * Конфигурация игры
 */
export const GAME_CONFIG = {
  // Размер карты (для обратной совместимости, используется getMapSizeForLevel)
  MAP_WIDTH: 24,
  MAP_HEIGHT: 24,

  // Размер тайла в пикселях
  TILE_SIZE: 48,

  // DOOM-style движение (пиксели в секунду)
  WALK_SPEED: 150, // пиксели в секунду при ходьбе
  RUN_SPEED: 280, // пиксели в секунду при беге
  ROTATION_SPEED: 180, // градусы в секунду при повороте

  // Радиус коллизии игрока (в пикселях)
  PLAYER_RADIUS: 12,

  // Стамина
  MAX_STAMINA: 100,
  STAMINA_DRAIN_RATE: 15, // трата стамины в секунду при беге
  STAMINA_RECOVERY_RATE: 8, // восстановление стамины в секунду

  // Здоровье
  MAX_HEALTH: 100,
  STARTING_HEALTH: 100,

  // Опыт
  COIN_XP_VALUE: 1, // XP за монету
  RARE_ITEM_XP_VALUE: 10, // XP за редкий предмет

  // Уровни (прогрессия опыта)
  XP_PER_LEVEL: [
    0, // Level 1 (старт)
    10, // Level 2
    25, // Level 3
    50, // Level 4
    100, // Level 5
    200, // Level 6
    350, // Level 7
    550, // Level 8
    800, // Level 9
    1200, // Level 10
    1700, // Level 11
    2300, // Level 12
    3000, // Level 13
    3800, // Level 14
    4700, // Level 15
  ],

  // Инвентарь
  INVENTORY_SIZE: 10,

  // Предметы на карте (базовые значения для уровня 1)
  COINS_COUNT: 15,
  POTIONS_COUNT: 5,
  RARE_ITEMS_COUNT: 2,

  // Радиус подбора предметов (в пикселях)
  ITEM_PICKUP_RADIUS: 24,
  ITEM_SIZE: 16, // размер предмета для рендеринга

  // Зелья
  POTION_HEALTH_RESTORE: 25, // восстановление HP от зелья
  STAMINA_POTION_RESTORE: 40, // восстановление стамины от зелья

  // Автосохранение
  AUTO_SAVE_INTERVAL: 5000, // каждые 5 секунд

  // Версия сохранения
  SAVE_VERSION: 13, // версия 13: добавлены collectedResources для каунтеров ресурсов

  // Освещение
  AMBIENT_LIGHT: 0.3, // базовое освещение (0-1)
  LIGHT_RADIUS: 200, // радиус света от игрока

  // Эффекты
  CAMERA_SMOOTHING: 0.1, // плавность камеры (0-1)

  // Радиус активации выхода (в пикселях)
  EXIT_RADIUS: 24,
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
