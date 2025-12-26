/**
 * Основной хук игры - DOOM-style
 * Оптимизирован для минимизации React ререндеров
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { PixelArtGameEngine } from "@/domain/game/PixelArtGameEngine";
import { ItemCollector } from "@/domain/items/ItemCollector";
import { ExperienceSystem } from "@/domain/experience/ExperienceSystem";
import { useKeyboard } from "./useKeyboard";
import { useGameState } from "./useGameState";
import { usePixelArtAchievements } from "./usePixelArtAchievements";
import { usePixelArtStatistics } from "./usePixelArtStatistics";
import type {
  GameState,
  Direction,
  MovementType,
  ItemCollectionResult,
  Position,
  InventorySlot,
  PlayerStats,
} from "@/types/pixel-art-game.types";
import { TileType, ItemType } from "@/types/pixel-art-game.types";
import { GAME_CONFIG, MAP_LEVEL_CONFIG } from "@/utils/pixel-art-constants";
import { GameStateManager } from "@/domain/game/GameStateManager";
import { userStorageService } from "@/services/storage";
import { pixelArtStatisticsService } from "@/services/storage/PixelArtStatisticsService";
import { CHARACTER_PRESETS } from "@/components/game/CharacterCreation/CharacterCreation";

export interface UsePixelArtGameOptions {
  readonly initialState?: GameState | null;
  readonly enabled?: boolean;
  readonly onStateChange?: (state: GameState) => void;
  readonly onAchievementUnlocked?: (achievementIds: readonly string[]) => void;
}

export interface UsePixelArtGameReturn {
  readonly gameState: GameState;
  readonly getGameState: () => GameState;
  readonly updateGame: (deltaTime: number) => void;
  readonly handleMove: (direction: Direction, movementType: MovementType) => void;
  readonly handleStop: () => void;
  readonly startGame: (initialStats?: PlayerStats) => void;
  readonly resetGame: () => void;
  readonly restartGame: () => void;
  readonly pauseGame: () => void;
  readonly resumeGame: () => void;
  readonly updateInventory: (inventory: readonly InventorySlot[]) => void;
  readonly goToNextLevel: () => void;
  readonly sellItem: (slotIndex: number) => number; // Продать предмет, возвращает полученный опыт
  readonly sellResources: () => number; // Продать все ресурсы, возвращает полученный опыт
  readonly unlockTreasureRoom: () => void; // Открыть сокровищницу
  readonly isLoading: boolean;
  readonly isOnExit: boolean;
  readonly isNearTerminal: boolean;
  readonly isNearTreasureDoor: boolean;
}

const directionToAngle: Record<Direction, number> = {
  UP: 270,
  DOWN: 90,
  LEFT: 180,
  RIGHT: 0,
};

const directionToVector: Record<Direction, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const checkMapCollision = (
  x: number,
  y: number,
  map: GameState["map"],
  radius: number = GAME_CONFIG.PLAYER_RADIUS
): boolean => {
  const tileSize = GAME_CONFIG.TILE_SIZE;
  const checkPoints = [
    { x: x - radius, y: y - radius },
    { x: x + radius, y: y - radius },
    { x: x - radius, y: y + radius },
    { x: x + radius, y: y + radius },
    { x: x, y: y - radius },
    { x: x, y: y + radius },
    { x: x - radius, y: y },
    { x: x + radius, y: y },
  ];

  for (const point of checkPoints) {
    const tileX = Math.floor(point.x / tileSize);
    const tileY = Math.floor(point.y / tileSize);
    if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) {
      return true;
    }
    const tile = map.tiles[tileY]?.[tileX];
    if (!tile || tile.type === TileType.WALL || tile.type === TileType.OBSTACLE) {
      return true;
    }
    // Закрытые двери - препятствие
    if (
      tile.type === TileType.DOOR ||
      tile.type === TileType.DOOR_WIDE ||
      tile.type === TileType.TREASURE_DOOR
    ) {
      return true;
    }
    // Открытые двери и проходимые тайлы - можно пройти
  }
  return false;
};

// Проверка и открытие двери рядом с игроком
const checkAndOpenDoors = (
  playerX: number,
  playerY: number,
  map: GameState["map"],
  doorOpenRadius: number = GAME_CONFIG.TILE_SIZE * 1.5
): { doorOpened: boolean; updatedTiles: typeof map.tiles } => {
  const tileSize = GAME_CONFIG.TILE_SIZE;
  let doorOpened = false;
  const updatedTiles = map.tiles.map((row) => row.map((tile) => ({ ...tile })));

  // Проверяем тайлы вокруг игрока
  const playerTileX = Math.floor(playerX / tileSize);
  const playerTileY = Math.floor(playerY / tileSize);

  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const tileX = playerTileX + dx;
      const tileY = playerTileY + dy;

      if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) continue;

      const tile = updatedTiles[tileY]?.[tileX];
      if (!tile) continue;

      // Расстояние от центра тайла до игрока
      const tileCenterX = tileX * tileSize + tileSize / 2;
      const tileCenterY = tileY * tileSize + tileSize / 2;
      const distance = Math.sqrt(
        Math.pow(playerX - tileCenterX, 2) + Math.pow(playerY - tileCenterY, 2)
      );

      if (distance < doorOpenRadius) {
        // Обычная дверь
        if (tile.type === TileType.DOOR) {
          updatedTiles[tileY][tileX] = { ...tile, type: TileType.DOOR_OPEN };
          doorOpened = true;
        }
        // Широкая дверь (sci-fi)
        else if (tile.type === TileType.DOOR_WIDE) {
          updatedTiles[tileY][tileX] = { ...tile, type: TileType.DOOR_WIDE_OPEN };
          doorOpened = true;
        }
        // Дверь сокровищницы НЕ открывается автоматически (нужен ребус)
      }
    }
  }

  return { doorOpened, updatedTiles };
};

const checkItemPickup = (
  playerPos: Position,
  items: readonly GameState["items"][number][],
  pickupRadius: number = GAME_CONFIG.ITEM_PICKUP_RADIUS
): GameState["items"][number] | null => {
  for (const item of items) {
    if (item.collected) continue;
    const dx = playerPos.x - item.position.x;
    const dy = playerPos.y - item.position.y;
    if (Math.sqrt(dx * dx + dy * dy) < pickupRadius) {
      return item;
    }
  }
  return null;
};

// Проверка, находится ли игрок на выходе
const checkOnExit = (
  playerPos: Position,
  map: GameState["map"],
  exitRadius: number = GAME_CONFIG.EXIT_RADIUS
): boolean => {
  const tileSize = GAME_CONFIG.TILE_SIZE;

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tile = map.tiles[y]?.[x];
      if (tile && tile.type === TileType.EXIT) {
        const exitCenterX = x * tileSize + tileSize / 2;
        const exitCenterY = y * tileSize + tileSize / 2;
        const dx = playerPos.x - exitCenterX;
        const dy = playerPos.y - exitCenterY;
        if (Math.sqrt(dx * dx + dy * dy) < exitRadius) {
          return true;
        }
      }
    }
  }
  return false;
};

// Проверка близости к терминалу
const checkNearTerminal = (
  playerPos: Position,
  map: GameState["map"],
  radius: number = GAME_CONFIG.TILE_SIZE * 1.5
): boolean => {
  const tileSize = GAME_CONFIG.TILE_SIZE;

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tile = map.tiles[y]?.[x];
      if (tile && tile.type === TileType.TERMINAL) {
        const terminalCenterX = x * tileSize + tileSize / 2;
        const terminalCenterY = y * tileSize + tileSize / 2;
        const dx = playerPos.x - terminalCenterX;
        const dy = playerPos.y - terminalCenterY;
        if (Math.sqrt(dx * dx + dy * dy) < radius) {
          return true;
        }
      }
    }
  }
  return false;
};

// Проверка близости к двери сокровищницы
const checkNearTreasureDoor = (
  playerPos: Position,
  map: GameState["map"],
  radius: number = GAME_CONFIG.TILE_SIZE * 1.5
): boolean => {
  const tileSize = GAME_CONFIG.TILE_SIZE;

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tile = map.tiles[y]?.[x];
      if (tile && tile.type === TileType.TREASURE_DOOR) {
        const doorCenterX = x * tileSize + tileSize / 2;
        const doorCenterY = y * tileSize + tileSize / 2;
        const dx = playerPos.x - doorCenterX;
        const dy = playerPos.y - doorCenterY;
        if (Math.sqrt(dx * dx + dy * dy) < radius) {
          return true;
        }
      }
    }
  }
  return false;
};

// Частота обновления HUD (мс)
const HUD_UPDATE_INTERVAL = 50;

/**
 * Основной хук игры
 */
export const usePixelArtGame = (
  options?: UsePixelArtGameOptions
): UsePixelArtGameReturn => {
  const { initialState, enabled = true, onStateChange } = options || {};

  usePixelArtAchievements();
  usePixelArtStatistics();
  const {
    savedState,
    isLoading: isLoadingSave,
    saveGameState,
    forceSaveGameState,
  } = useGameState();

  // Engine и state refs
  const engineRef = useRef<PixelArtGameEngine | null>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const isEngineInitialized = useRef(false);
  const forceSaveGameStateRef = useRef<((state: GameState) => void) | null>(null);

  const keyboardStateRef = useRef<{
    direction: Direction | null;
    movementType: MovementType;
  }>({
    direction: null,
    movementType: "IDLE" as MovementType,
  });

  // React state для HUD (обновляется периодически)
  const [hudGameState, setHudGameState] = useState<GameState | null>(null);

  // React state для UI флагов
  const [uiState, setUiState] = useState<{
    isGameStarted: boolean;
    isPaused: boolean;
    isOnExit: boolean;
    isNearTerminal: boolean;
    isNearTreasureDoor: boolean;
  }>({
    isGameStarted: false,
    isPaused: false,
    isOnExit: false,
    isNearTerminal: false,
    isNearTreasureDoor: false,
  });

  // Ref для хранения текущих UI значений (избегаем проблем с замыканиями)
  const uiStateRef = useRef(uiState);
  useEffect(() => {
    uiStateRef.current = uiState;
  }, [uiState]);

  // Ref для forceSaveGameState (чтобы использовать в updateGame без зависимостей)
  useEffect(() => {
    forceSaveGameStateRef.current = forceSaveGameState;
  }, [forceSaveGameState]);

  // Инициализация движка (ждём загрузки сохранения)
  useEffect(() => {
    // Если ещё загружаем сохранение, ждём
    if (isLoadingSave) return;

    // Если engine уже создан, не пересоздаём
    if (isEngineInitialized.current) return;

    const gameState = initialState || savedState;
    let engine: PixelArtGameEngine;

    if (gameState) {
      engine = new PixelArtGameEngine(gameState);
    } else {
      engine = new PixelArtGameEngine();
    }

    // Применяем характеристики персонажа из профиля
    const profile = userStorageService.getProfile();
    if (profile) {
      const currentState = engine.getGameState();
      let needsUpdate = false;
      const updatedStats = { ...currentState.player.stats };

      // Применяем характеристики выбранного класса персонажа
      // Проверяем, нужно ли применять (если текущие значения не соответствуют классу)
      if (profile.selectedCharacterClass) {
        const preset = CHARACTER_PRESETS[profile.selectedCharacterClass];
        if (preset) {
          // Применяем только если значения не соответствуют классу (игра новая или класс изменился)
          const baseMaxHealth = preset.stats.maxHealth;
          const baseMaxStamina = preset.stats.maxStamina;
          const staminaBonus = (profile.staminaUpgrades ?? 0) * 10;
          const expectedMaxStamina = baseMaxStamina + staminaBonus;

          // Если текущие значения не соответствуют классу, применяем
          if (
            currentState.player.stats.maxHealth !== baseMaxHealth ||
            currentState.player.stats.maxStamina !== expectedMaxStamina
          ) {
            updatedStats.health = preset.stats.health;
            updatedStats.maxHealth = preset.stats.maxHealth;
            updatedStats.stamina = preset.stats.stamina;
            updatedStats.maxStamina = preset.stats.maxStamina;
            needsUpdate = true;
          }
        }
      }

      // Применяем бонус стамины из профиля (если еще не применен выше)
      const staminaBonus = (profile.staminaUpgrades ?? 0) * 10;
      if (staminaBonus > 0 && !needsUpdate) {
        const newMaxStamina = updatedStats.maxStamina + staminaBonus;
        if (currentState.player.stats.maxStamina !== newMaxStamina) {
          updatedStats.maxStamina = newMaxStamina;
          updatedStats.stamina = Math.min(
            updatedStats.stamina + staminaBonus,
            newMaxStamina
          );
          needsUpdate = true;
        }
      } else if (staminaBonus > 0 && needsUpdate) {
        // Если уже обновляли характеристики класса, добавляем бонус стамины
        updatedStats.maxStamina = updatedStats.maxStamina + staminaBonus;
        updatedStats.stamina = Math.min(
          updatedStats.stamina + staminaBonus,
          updatedStats.maxStamina
        );
      }

      // Обновляем состояние если нужно
      if (needsUpdate) {
        engine.updateGameState({
          ...currentState,
          player: {
            ...currentState.player,
            stats: updatedStats,
          },
        });
      }
    }

    engineRef.current = engine;
    gameStateRef.current = engine.getGameState();
    setHudGameState(engine.getGameState());
    isEngineInitialized.current = true;

    const state = engine.getGameState();
    setUiState({
      isGameStarted: state.isGameStarted,
      isPaused: state.isPaused,
      isOnExit: false,
      isNearTerminal: false,
      isNearTreasureDoor: false,
    });
  }, [isLoadingSave, initialState, savedState]);

  // Периодическое обновление HUD state
  useEffect(() => {
    if (!uiState.isGameStarted || uiState.isPaused) return;

    const updateHud = () => {
      const currentState = gameStateRef.current;
      if (currentState) {
        setHudGameState(currentState);
      }
    };

    const interval = setInterval(updateHud, HUD_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [uiState.isGameStarted, uiState.isPaused]);

  /**
   * Получить актуальное состояние игры (для Canvas)
   */
  const getGameState = useCallback((): GameState => {
    if (gameStateRef.current) return gameStateRef.current;
    if (engineRef.current) return engineRef.current.getGameState();

    // Fallback
    return {
      player: {
        position: { x: 0, y: 0 },
        direction: "DOWN" as Direction,
        angle: 90,
        movementType: "IDLE" as MovementType,
        stats: {
          health: 100,
          maxHealth: 100,
          stamina: 100,
          maxStamina: 100,
          level: 1,
          experience: 0,
          experienceToNextLevel: 10,
        },
        isMoving: false,
        velocity: { x: 0, y: 0 },
      },
      map: { width: 0, height: 0, tiles: [] },
      items: [],
      inventory: [],
      coins: 0,
      collectedResources: {
        coins: 0,
        healthPotions: 0,
        staminaPotions: 0,
      },
      isPaused: false,
      isGameStarted: false,
      gameStartTime: 0,
      lastSaveTime: 0,
      mapLevel: 1,
    } as GameState;
  }, []);

  /**
   * Обновление игры
   */
  const updateGame = useCallback(
    (deltaTime: number): void => {
      const engine = engineRef.current;
      if (!engine) return;

      const currentState = engine.getGameState();
      if (!currentState.isGameStarted || currentState.isPaused) return;

      let newState = { ...currentState };
      let hasChanges = false;

      // Обработка движения
      const keyboardState = keyboardStateRef.current;

      if (keyboardState.direction) {
        let speed: number = GAME_CONFIG.WALK_SPEED;
        let finalMovementType: MovementType = keyboardState.movementType;

        if (keyboardState.movementType === "RUN") {
          if (currentState.player.stats.stamina > 0) {
            speed = GAME_CONFIG.RUN_SPEED;
          } else {
            finalMovementType = "WALK" as MovementType;
          }
        }

        const dirVector = directionToVector[keyboardState.direction];
        const targetAngle = directionToAngle[keyboardState.direction];
        const moveX = dirVector.x * speed * deltaTime;
        const moveY = dirVector.y * speed * deltaTime;
        const newX = currentState.player.position.x + moveX;
        const newY = currentState.player.position.y + moveY;

        if (!checkMapCollision(newX, newY, currentState.map)) {
          newState.player = {
            ...currentState.player,
            position: { x: newX, y: newY },
            angle: targetAngle,
            direction: keyboardState.direction,
            movementType: finalMovementType,
            isMoving: true,
            velocity: { x: moveX, y: moveY },
          };
          hasChanges = true;
        } else if (
          !checkMapCollision(newX, currentState.player.position.y, currentState.map)
        ) {
          newState.player = {
            ...currentState.player,
            position: { x: newX, y: currentState.player.position.y },
            angle: targetAngle,
            direction: keyboardState.direction,
            movementType: finalMovementType,
            isMoving: true,
            velocity: { x: moveX, y: 0 },
          };
          hasChanges = true;
        } else if (
          !checkMapCollision(currentState.player.position.x, newY, currentState.map)
        ) {
          newState.player = {
            ...currentState.player,
            position: { x: currentState.player.position.x, y: newY },
            angle: targetAngle,
            direction: keyboardState.direction,
            movementType: finalMovementType,
            isMoving: true,
            velocity: { x: 0, y: moveY },
          };
          hasChanges = true;
        } else if (currentState.player.angle !== targetAngle) {
          newState.player = {
            ...currentState.player,
            angle: targetAngle,
            direction: keyboardState.direction,
            isMoving: false,
            velocity: { x: 0, y: 0 },
          };
          hasChanges = true;
        }
      } else if (
        currentState.player.isMoving ||
        currentState.player.movementType !== "IDLE"
      ) {
        newState.player = {
          ...currentState.player,
          isMoving: false,
          movementType: "IDLE" as MovementType,
          velocity: { x: 0, y: 0 },
        };
        hasChanges = true;
      }

      // Проверка и открытие дверей рядом с игроком
      const { doorOpened, updatedTiles } = checkAndOpenDoors(
        newState.player.position.x,
        newState.player.position.y,
        newState.map
      );
      if (doorOpened) {
        newState.map = { ...newState.map, tiles: updatedTiles };
        hasChanges = true;
      }

      // Обновление стамины
      if (newState.player.movementType === "RUN" && newState.player.isMoving) {
        const newStamina = Math.max(
          0,
          newState.player.stats.stamina - GAME_CONFIG.STAMINA_DRAIN_RATE * deltaTime
        );
        newState.player = {
          ...newState.player,
          stats: { ...newState.player.stats, stamina: newStamina },
        };
        hasChanges = true;
      } else if (newState.player.stats.stamina < newState.player.stats.maxStamina) {
        const newStamina = Math.min(
          newState.player.stats.maxStamina,
          newState.player.stats.stamina + GAME_CONFIG.STAMINA_RECOVERY_RATE * deltaTime
        );
        newState.player = {
          ...newState.player,
          stats: { ...newState.player.stats, stamina: newStamina },
        };
        hasChanges = true;
      }

      // Проверка сбора предметов
      const collectedItem = checkItemPickup(newState.player.position, newState.items);
      if (collectedItem) {
        const itemCollector = new ItemCollector(newState.inventory);
        const result: ItemCollectionResult = itemCollector.collectItem(
          collectedItem,
          newState.player.position
        );

        if (result.success && result.item) {
          newState.items = newState.items.map((item) =>
            item.id === result.item!.id ? { ...item, collected: true } : item
          );

          // Обновляем накопительную статистику при сборе предмета
          // Для всех типов кроме RARE_ITEM (который обрабатывается отдельно при добавлении в инвентарь)
          if (result.item.type !== ItemType.RARE_ITEM) {
            // Явно приводим тип к ItemType для надежности
            const itemType = result.item.type as ItemType;
            pixelArtStatisticsService.incrementItemCount(itemType);
          }

          if (result.experienceGained > 0) {
            const oldLevel = newState.player.stats.level;
            const expResult = ExperienceSystem.addExperience(
              newState.player.stats,
              result.experienceGained
            );
            newState.player = { ...newState.player, stats: expResult.newStats };

            // Если произошел левел-ап, принудительно сохраняем состояние
            if (expResult.newStats.level > oldLevel) {
              // Обновляем engine сначала
              engine.updateGameState(newState);
              const updatedState = engine.getGameState();
              gameStateRef.current = updatedState;
              // Принудительно сохраняем без дебаунса
              if (forceSaveGameStateRef.current) {
                forceSaveGameStateRef.current(updatedState);
              }
            }
          }

          if (result.healthRestored) {
            newState.player = {
              ...newState.player,
              stats: {
                ...newState.player.stats,
                health: Math.min(
                  newState.player.stats.maxHealth,
                  newState.player.stats.health + result.healthRestored
                ),
              },
            };
          }

          if (result.staminaRestored) {
            newState.player = {
              ...newState.player,
              stats: {
                ...newState.player.stats,
                stamina: Math.min(
                  newState.player.stats.maxStamina,
                  newState.player.stats.stamina + result.staminaRestored
                ),
              },
            };
          }

          // Обновляем счётчики собранных ресурсов
          if (result.item.type === ItemType.COIN) {
            newState.coins += 1;
            newState.collectedResources = {
              ...newState.collectedResources,
              coins: newState.collectedResources.coins + 1,
            };
          } else if (result.item.type === ItemType.POTION) {
            newState.collectedResources = {
              ...newState.collectedResources,
              healthPotions: newState.collectedResources.healthPotions + 1,
            };
          } else if (result.item.type === ItemType.STAMINA_POTION) {
            newState.collectedResources = {
              ...newState.collectedResources,
              staminaPotions: newState.collectedResources.staminaPotions + 1,
            };
          }

          if (result.addedToInventory) {
            newState.inventory = itemCollector.getUpdatedInventory();

            // Если редкий предмет добавлен в инвентарь, обновляем статистику
            if (result.item.type === ItemType.RARE_ITEM) {
              pixelArtStatisticsService.incrementItemCount(ItemType.RARE_ITEM);
            }
          }

          hasChanges = true;
        }
      }

      // Проверка на выход и близость к объектам
      const onExit = checkOnExit(newState.player.position, newState.map);
      const nearTerminal = checkNearTerminal(newState.player.position, newState.map);
      const nearTreasureDoor = checkNearTreasureDoor(
        newState.player.position,
        newState.map
      );

      // Используем ref для сравнения (актуальные значения)
      const currentUiState = uiStateRef.current;
      if (
        onExit !== currentUiState.isOnExit ||
        nearTerminal !== currentUiState.isNearTerminal ||
        nearTreasureDoor !== currentUiState.isNearTreasureDoor
      ) {
        setUiState((prev) => ({
          ...prev,
          isOnExit: onExit,
          isNearTerminal: nearTerminal,
          isNearTreasureDoor: nearTreasureDoor,
        }));
      }

      // Обновление engine
      if (hasChanges) {
        engine.updateGameState(newState);
        gameStateRef.current = engine.getGameState();
      }
    },
    [] // Убираем зависимости - используем refs
  );

  const handleMove = useCallback(
    (direction: Direction, movementType: MovementType): void => {
      keyboardStateRef.current = { direction, movementType };
    },
    []
  );

  const handleStop = useCallback((): void => {
    keyboardStateRef.current = {
      direction: null,
      movementType: "IDLE" as MovementType,
    };
  }, []);

  const startGame = useCallback(
    (initialStats?: PlayerStats): void => {
      const engine = engineRef.current;
      if (!engine) return;

      // Если переданы начальные характеристики, применяем их
      if (initialStats) {
        const currentState = engine.getGameState();
        const profile = userStorageService.getProfile();
        const staminaBonus = (profile?.staminaUpgrades ?? 0) * 10;

        engine.updateGameState({
          ...currentState,
          player: {
            ...currentState.player,
            stats: {
              ...initialStats,
              maxStamina: initialStats.maxStamina + staminaBonus,
              stamina: initialStats.stamina + staminaBonus,
            },
          },
        });
      }

      engine.startGame();
      const newState = engine.getGameState();
      gameStateRef.current = newState;
      setHudGameState(newState);

      setUiState({
        isGameStarted: true,
        isPaused: false,
        isOnExit: false,
        isNearTerminal: false,
        isNearTreasureDoor: false,
      });

      if (onStateChange) {
        onStateChange(newState);
      }
    },
    [onStateChange]
  );

  const resetGame = useCallback((): void => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.reset();
    const newState = engine.getGameState();
    gameStateRef.current = newState;
    setHudGameState(newState);

    setUiState({
      isGameStarted: false,
      isPaused: false,
      isOnExit: false,
      isNearTerminal: false,
      isNearTreasureDoor: false,
    });

    if (onStateChange) {
      onStateChange(newState);
    }
  }, [onStateChange]);

  const pauseGame = useCallback((): void => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.pause();
    const newState = engine.getGameState();
    gameStateRef.current = newState;
    setHudGameState(newState);
    setUiState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resumeGame = useCallback((): void => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.resume();
    const newState = engine.getGameState();
    gameStateRef.current = newState;
    setHudGameState(newState);
    setUiState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  // Начать игру заново (с удалением сохранения)
  const restartGame = useCallback((): void => {
    // Удаляем сохранение
    try {
      localStorage.removeItem("pixel_art_game_state");
    } catch (e) {
      console.error("Ошибка удаления сохранения:", e);
    }

    // Создаём новый engine
    const newEngine = new PixelArtGameEngine();

    // Применяем бонус стамины из профиля
    const profile = userStorageService.getProfile();
    if (profile && profile.staminaUpgrades && profile.staminaUpgrades > 0) {
      const staminaBonus = profile.staminaUpgrades * 10;
      const currentState = newEngine.getGameState();
      const newMaxStamina = GAME_CONFIG.MAX_STAMINA + staminaBonus;

      newEngine.updateGameState({
        ...currentState,
        player: {
          ...currentState.player,
          stats: {
            ...currentState.player.stats,
            maxStamina: newMaxStamina,
            stamina: newMaxStamina, // Восстанавливаем стамину до максимума
          },
        },
      });
    }

    engineRef.current = newEngine;

    // Запускаем игру
    newEngine.startGame();
    const newState = newEngine.getGameState();
    gameStateRef.current = newState;
    setHudGameState(newState);

    setUiState({
      isGameStarted: true,
      isPaused: false,
      isOnExit: false,
      isNearTerminal: false,
      isNearTreasureDoor: false,
    });

    if (onStateChange) {
      onStateChange(newState);
    }
  }, [onStateChange]);

  // Обновить инвентарь
  const updateInventory = useCallback((inventory: readonly InventorySlot[]): void => {
    const engine = engineRef.current;
    if (!engine) return;

    const currentState = engine.getGameState();
    const newState = {
      ...currentState,
      inventory: [...inventory],
    };

    engine.updateGameState(newState);
    gameStateRef.current = engine.getGameState();
    setHudGameState(engine.getGameState());
  }, []);

  // Переход на следующий уровень
  const goToNextLevel = useCallback((): void => {
    const engine = engineRef.current;
    if (!engine) return;

    const currentState = engine.getGameState();

    // Проверяем, не достигли ли максимального уровня
    if (currentState.mapLevel >= MAP_LEVEL_CONFIG.MAX_LEVEL) {
      console.log("Достигнут максимальный уровень!");
      return;
    }

    // Создаём состояние для следующего уровня
    const nextLevelState = GameStateManager.createNextLevelState(currentState);

    // Обновляем engine
    engine.updateGameState(nextLevelState);
    gameStateRef.current = engine.getGameState();
    setHudGameState(engine.getGameState());

    // Сбрасываем флаг выхода
    setUiState((prev) => ({ ...prev, isOnExit: false }));

    // Сохраняем состояние
    saveGameState(nextLevelState);

    console.log(`Переход на уровень ${nextLevelState.mapLevel}`);
  }, [saveGameState]);

  // Продать предмет за опыт
  const sellItem = useCallback(
    (slotIndex: number): number => {
      const engine = engineRef.current;
      if (!engine) return 0;

      const currentState = engine.getGameState();
      const slot = currentState.inventory[slotIndex];
      if (!slot || !slot.item) return 0;

      // Импортируем цены
      const { ITEM_SELL_PRICES } = require("@/types/pixel-art-game.types");
      const xpGain = ITEM_SELL_PRICES[slot.item.type] || 0;

      // Удаляем предмет из инвентаря
      const newInventory = currentState.inventory.map((s, i) =>
        i === slotIndex ? { ...s, item: null } : s
      );

      // Добавляем опыт через ExperienceSystem (правильно обрабатывает множественные левел-апы)
      const oldLevel = currentState.player.stats.level;
      const expResult = ExperienceSystem.addExperience(currentState.player.stats, xpGain);

      const newState = {
        ...currentState,
        inventory: newInventory,
        player: {
          ...currentState.player,
          stats: expResult.newStats,
        },
      };

      engine.updateGameState(newState);
      const updatedState = engine.getGameState();
      gameStateRef.current = updatedState;
      setHudGameState(updatedState);

      // Обновляем статистику продажи
      pixelArtStatisticsService.incrementItemsSold();

      // Если произошел левел-ап (может быть несколько уровней), принудительно сохраняем
      if (expResult.levelIncreased && expResult.newLevel > oldLevel) {
        forceSaveGameState(updatedState);
      }

      return xpGain;
    },
    [forceSaveGameState]
  );

  // Продать все ресурсы за опыт
  const sellResources = useCallback((): number => {
    const engine = engineRef.current;
    if (!engine) return 0;

    const currentState = engine.getGameState();
    const resources = currentState.collectedResources;

    // Проверяем есть ли что продавать
    if (
      resources.coins === 0 &&
      resources.healthPotions === 0 &&
      resources.staminaPotions === 0
    ) {
      return 0;
    }

    // Импортируем цены
    const { RESOURCE_SELL_PRICES } = require("@/types/pixel-art-game.types");
    const xpGain =
      resources.coins * RESOURCE_SELL_PRICES.coins +
      resources.healthPotions * RESOURCE_SELL_PRICES.healthPotions +
      resources.staminaPotions * RESOURCE_SELL_PRICES.staminaPotions;

    // Добавляем опыт через ExperienceSystem (правильно обрабатывает множественные левел-апы)
    const oldLevel = currentState.player.stats.level;
    const expResult = ExperienceSystem.addExperience(currentState.player.stats, xpGain);

    const newState = {
      ...currentState,
      collectedResources: {
        coins: 0,
        healthPotions: 0,
        staminaPotions: 0,
      },
      player: {
        ...currentState.player,
        stats: expResult.newStats,
      },
    };

    engine.updateGameState(newState);
    const updatedState = engine.getGameState();
    gameStateRef.current = updatedState;
    setHudGameState(updatedState);

    // Обновляем статистику продажи (продажа всех ресурсов = 1 продажа)
    if (xpGain > 0) {
      pixelArtStatisticsService.incrementItemsSold();
    }

    // Если произошел левел-ап (может быть несколько уровней), принудительно сохраняем
    if (expResult.levelIncreased && expResult.newLevel > oldLevel) {
      forceSaveGameState(updatedState);
    }

    return xpGain;
  }, [forceSaveGameState]);

  // Открыть дверь сокровищницы
  const unlockTreasureRoom = useCallback((): void => {
    const engine = engineRef.current;
    if (!engine) return;

    const currentState = engine.getGameState();

    // Находим все TREASURE_DOOR и открываем их
    const newTiles = currentState.map.tiles.map((row) =>
      row.map((tile) =>
        tile.type === TileType.TREASURE_DOOR
          ? { ...tile, type: TileType.TREASURE_DOOR_OPEN }
          : tile
      )
    );

    const newState = {
      ...currentState,
      map: { ...currentState.map, tiles: newTiles },
      treasureRoomUnlocked: true,
    };

    engine.updateGameState(newState);
    gameStateRef.current = engine.getGameState();
    setHudGameState(engine.getGameState());

    // Убираем флаг близости к двери
    setUiState((prev) => ({ ...prev, isNearTreasureDoor: false }));
  }, []);

  // Автосохранение
  useEffect(() => {
    if (!uiState.isGameStarted) return;

    const timer = setInterval(() => {
      const state = gameStateRef.current;
      if (state) {
        saveGameState(state);
      }
    }, GAME_CONFIG.AUTO_SAVE_INTERVAL);

    return () => clearInterval(timer);
  }, [uiState.isGameStarted, saveGameState]);

  // Сохранение при закрытии страницы
  useEffect(() => {
    const handleBeforeUnload = () => {
      const state = gameStateRef.current;
      if (state && state.isGameStarted) {
        // Принудительное сохранение (синхронное)
        try {
          const savedState = {
            version: GAME_CONFIG.SAVE_VERSION,
            timestamp: Date.now(),
            gameState: { ...state, lastSaveTime: Date.now() },
          };
          localStorage.setItem("pixel_art_game_state", JSON.stringify(savedState));
        } catch (e) {
          console.error("Ошибка сохранения при закрытии:", e);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Сохраняем при размонтировании компонента (переход на другую страницу)
      const state = gameStateRef.current;
      if (state && state.isGameStarted) {
        try {
          forceSaveGameStateRef.current?.(state);
        } catch (e) {
          console.error("Ошибка сохранения при размонтировании:", e);
        }
      }
    };
  }, []);

  // Обработка клавиатуры
  useKeyboard({
    enabled: enabled && uiState.isGameStarted && !uiState.isPaused,
    onMove: (direction, movementType) => {
      keyboardStateRef.current = { direction, movementType };
    },
    onStop: () => {
      keyboardStateRef.current = {
        direction: null,
        movementType: "IDLE" as MovementType,
      };
    },
  });

  // gameState для HUD компонентов
  const gameState = hudGameState || getGameState();

  return {
    gameState,
    getGameState,
    updateGame,
    handleMove,
    handleStop,
    startGame,
    resetGame,
    restartGame,
    pauseGame,
    resumeGame,
    updateInventory,
    goToNextLevel,
    sellItem,
    sellResources,
    unlockTreasureRoom,
    isLoading: isLoadingSave || !isEngineInitialized.current,
    isOnExit: uiState.isOnExit,
    isNearTerminal: uiState.isNearTerminal,
    isNearTreasureDoor: uiState.isNearTreasureDoor,
  };
};
