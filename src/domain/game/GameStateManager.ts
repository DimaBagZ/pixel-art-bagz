/**
 * Менеджер состояния игры - DOOM-style
 * Управляет созданием и валидацией состояния игры
 */

import type { GameState, Position, GameMap } from "@/types/pixel-art-game.types";
import { TileType, Direction, MovementType } from "@/types/pixel-art-game.types";
import { GAME_CONFIG } from "@/utils/pixel-art-constants";
import { MapGenerator } from "./MapGenerator";
import { ItemSpawner } from "../items/ItemSpawner";

/**
 * Найти безопасную позицию для спавна игрока (подальше от выхода)
 */
function findSafeSpawnPosition(map: GameMap): Position {
  const tileSize = GAME_CONFIG.TILE_SIZE;
  const floorPositions: { x: number; y: number; distance: number }[] = [];

  // Находим позицию выхода
  let exitX = map.width - 1;
  let exitY = map.height - 1;

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (map.tiles[y]?.[x]?.type === TileType.EXIT) {
        exitX = x;
        exitY = y;
      }
    }
  }

  // Собираем все позиции пола с расстоянием от выхода
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (map.tiles[y]?.[x]?.type === TileType.FLOOR) {
        const distance = Math.abs(x - exitX) + Math.abs(y - exitY);
        floorPositions.push({ x, y, distance });
      }
    }
  }

  // Сортируем по расстоянию от выхода (дальше = лучше для старта)
  floorPositions.sort((a, b) => b.distance - a.distance);

  // Берём одну из дальних позиций
  if (floorPositions.length > 0) {
    const pos = floorPositions[0];
    return {
      x: pos.x * tileSize + tileSize / 2,
      y: pos.y * tileSize + tileSize / 2,
    };
  }

  // Fallback: центр карты
  return {
    x: Math.floor(map.width / 2) * tileSize + tileSize / 2,
    y: Math.floor(map.height / 2) * tileSize + tileSize / 2,
  };
}

/**
 * Класс для управления состоянием игры
 */
export class GameStateManager {
  /**
   * Создать начальное состояние игры для определённого уровня
   */
  static createInitialState(mapLevel: number = 1): GameState {
    const mapGenerator = new MapGenerator(mapLevel);
    const map = mapGenerator.generateMap();

    // Безопасная начальная позиция игрока (подальше от выхода)
    const startPosition = findSafeSpawnPosition(map);

    // Генерация предметов с учётом уровня
    const itemSpawner = new ItemSpawner(map, mapLevel);
    const items = itemSpawner.spawnAllItems();

    return {
      player: {
        position: startPosition,
        direction: Direction.DOWN,
        angle: 90,
        movementType: MovementType.IDLE,
        stats: {
          health: GAME_CONFIG.STARTING_HEALTH,
          maxHealth: GAME_CONFIG.MAX_HEALTH,
          stamina: GAME_CONFIG.MAX_STAMINA,
          maxStamina: GAME_CONFIG.MAX_STAMINA,
          level: 1,
          experience: 0,
          experienceToNextLevel: GAME_CONFIG.XP_PER_LEVEL[1] || 10,
        },
        isMoving: false,
        velocity: { x: 0, y: 0 },
      },
      map,
      items,
      inventory: Array.from({ length: GAME_CONFIG.INVENTORY_SIZE }, (_, i) => ({
        index: i,
        item: null,
      })),
      coins: 0,
      collectedResources: {
        coins: 0,
        healthPotions: 0,
        staminaPotions: 0,
      },
      isPaused: false,
      isGameStarted: false,
      gameStartTime: Date.now(),
      lastSaveTime: Date.now(),
      mapLevel,
    };
  }

  /**
   * Создать состояние для следующего уровня (сохраняя прогресс игрока)
   */
  static createNextLevelState(currentState: GameState): GameState {
    const nextLevel = currentState.mapLevel + 1;
    const mapGenerator = new MapGenerator(nextLevel);
    const map = mapGenerator.generateMap();

    const startPosition = findSafeSpawnPosition(map);

    const itemSpawner = new ItemSpawner(map, nextLevel);
    const items = itemSpawner.spawnAllItems();

    return {
      player: {
        ...currentState.player,
        position: startPosition,
        direction: Direction.DOWN,
        angle: 90,
        movementType: MovementType.IDLE,
        isMoving: false,
        velocity: { x: 0, y: 0 },
        // Восстанавливаем немного здоровья и стамины при переходе
        stats: {
          ...currentState.player.stats,
          health: Math.min(
            currentState.player.stats.health + 20,
            currentState.player.stats.maxHealth
          ),
          stamina: currentState.player.stats.maxStamina,
        },
      },
      map,
      items,
      inventory: currentState.inventory, // Инвентарь сохраняется
      coins: currentState.coins, // Монеты сохраняются
      collectedResources: currentState.collectedResources, // Ресурсы сохраняются
      isPaused: false,
      isGameStarted: true,
      gameStartTime: currentState.gameStartTime,
      lastSaveTime: Date.now(),
      mapLevel: nextLevel,
      treasureRoomUnlocked: false, // Сбрасываем для нового уровня!
    };
  }

  /**
   * Валидация состояния игры
   */
  static validateGameState(state: GameState): boolean {
    try {
      if (!state.player || !state.map || !state.items || !state.inventory) {
        return false;
      }

      const maxX = state.map.width * GAME_CONFIG.TILE_SIZE;
      const maxY = state.map.height * GAME_CONFIG.TILE_SIZE;

      if (
        state.player.position.x < 0 ||
        state.player.position.x >= maxX ||
        state.player.position.y < 0 ||
        state.player.position.y >= maxY
      ) {
        return false;
      }

      if (
        state.player.stats.health < 0 ||
        state.player.stats.health > state.player.stats.maxHealth ||
        state.player.stats.stamina < 0 ||
        state.player.stats.stamina > state.player.stats.maxStamina ||
        state.player.stats.level < 1
      ) {
        return false;
      }

      if (state.inventory.length !== GAME_CONFIG.INVENTORY_SIZE) {
        return false;
      }

      if (state.coins < 0) {
        return false;
      }

      // Проверяем mapLevel
      if (typeof state.mapLevel !== "number" || state.mapLevel < 1) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Миграция старого состояния в новый формат
   */
  static migrateState(oldState: GameState): GameState {
    const tileSize = GAME_CONFIG.TILE_SIZE;
    const needsMigration = oldState.player.position.x < oldState.map.width * 2;

    // Добавляем mapLevel если его нет
    const mapLevel = oldState.mapLevel ?? 1;

    // Добавляем collectedResources если их нет
    const collectedResources = oldState.collectedResources ?? {
      coins: 0,
      healthPotions: 0,
      staminaPotions: 0,
    };

    if (!needsMigration) {
      return {
        ...oldState,
        mapLevel,
        collectedResources,
        player: {
          ...oldState.player,
          angle: oldState.player.angle ?? 90,
          velocity: oldState.player.velocity ?? { x: 0, y: 0 },
        },
      };
    }

    return {
      ...oldState,
      mapLevel,
      collectedResources,
      player: {
        ...oldState.player,
        position: {
          x: oldState.player.position.x * tileSize + tileSize / 2,
          y: oldState.player.position.y * tileSize + tileSize / 2,
        },
        angle: 90,
        velocity: { x: 0, y: 0 },
      },
      items: oldState.items.map((item) => ({
        ...item,
        position: {
          x: item.position.x * tileSize + tileSize / 2,
          y: item.position.y * tileSize + tileSize / 2,
        },
      })),
    };
  }
}
