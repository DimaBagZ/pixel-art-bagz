/**
 * Основной хук игры
 * Координирует все системы игры
 * Соблюдает принцип Single Responsibility
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { PixelArtGameEngine } from "@/domain/game/PixelArtGameEngine";
import { PlayerController } from "@/domain/player/PlayerController";
import { MovementSystem } from "@/domain/player/MovementSystem";
import { ItemCollector } from "@/domain/items/ItemCollector";
import { CollisionDetector } from "@/domain/game/CollisionDetector";
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
} from "@/types/pixel-art-game.types";
import { GAME_CONFIG } from "@/utils/pixel-art-constants";

export interface UsePixelArtGameOptions {
  readonly initialState?: GameState | null;
  readonly enabled?: boolean;
  readonly onStateChange?: (state: GameState) => void;
  readonly onAchievementUnlocked?: (achievementIds: readonly string[]) => void;
}

export interface UsePixelArtGameReturn {
  readonly gameState: GameState;
  readonly updateGame: (deltaTime: number) => void;
  readonly handleMove: (direction: Direction, movementType: MovementType) => void;
  readonly startGame: () => void;
  readonly resetGame: () => void;
  readonly pauseGame: () => void;
  readonly resumeGame: () => void;
}

/**
 * Основной хук игры
 */
export const usePixelArtGame = (
  options?: UsePixelArtGameOptions
): UsePixelArtGameReturn => {
  const {
    initialState,
    enabled = true,
    onStateChange,
    onAchievementUnlocked,
  } = options || {};
  const { checkAchievements } = usePixelArtAchievements();
  const { statistics } = usePixelArtStatistics();

  // Загрузка сохраненного состояния
  const { savedState, saveGameState } = useGameState();
  const initialGameState = initialState || savedState;

  // Инициализация движка
  const engineRef = useRef<PixelArtGameEngine | null>(null);
  const playerControllerRef = useRef<PlayerController | null>(null);
  const movementSystemRef = useRef<MovementSystem | null>(null);
  const collisionDetectorRef = useRef<CollisionDetector | null>(null);

  const [gameState, setGameState] = useState<GameState>(() => {
    if (initialGameState) {
      const engine = new PixelArtGameEngine(initialGameState);
      return engine.getGameState();
    }
    const engine = new PixelArtGameEngine();
    return engine.getGameState();
  });

  // Инициализация систем
  useEffect(() => {
    const engine = new PixelArtGameEngine(gameState);
    engineRef.current = engine;

    const map = engine.getGameState().map;
    const playerState = engine.getGameState().player;

    playerControllerRef.current = new PlayerController(map, playerState.position);
    movementSystemRef.current = new MovementSystem(playerState.stats);
    collisionDetectorRef.current = new CollisionDetector(map);
  }, []);

  /**
   * Обновление игры
   */
  const updateGame = useCallback(
    (deltaTime: number): void => {
      if (!enabled || gameState.isPaused || !gameState.isGameStarted) {
        return;
      }

      const engine = engineRef.current;
      const movementSystem = movementSystemRef.current;
      if (!engine || !movementSystem) {
        return;
      }

      const currentState = engine.getGameState();
      let newState = { ...currentState };

      // Обновление стамины
      const movementUpdate = movementSystem.updateMovement(
        currentState.player.movementType,
        deltaTime
      );

      if (movementUpdate.staminaDrained > 0 || movementUpdate.staminaRestored > 0) {
        const currentStats = newState.player.stats;
        let newStamina = currentStats.stamina;

        if (movementUpdate.staminaDrained > 0) {
          newStamina = Math.max(0, newStamina - movementUpdate.staminaDrained);
        }

        if (movementUpdate.staminaRestored > 0) {
          newStamina = Math.min(
            currentStats.maxStamina,
            newStamina + movementUpdate.staminaRestored
          );
        }

        newState.player = {
          ...newState.player,
          stats: {
            ...currentStats,
            stamina: newStamina,
          },
        };
      }

      // Проверка сбора предметов
      const collisionDetector = collisionDetectorRef.current;
      if (collisionDetector) {
        const collectedItem = collisionDetector.checkItemCollision(
          newState.player.position,
          newState.items
        );

        if (collectedItem) {
          const itemCollector = new ItemCollector(newState.inventory);
          const result: ItemCollectionResult = itemCollector.collectItem(
            collectedItem,
            newState.player.position
          );

          if (result.success && result.item) {
            // Обновление предметов
            newState.items = newState.items.map((item) =>
              item.id === result.item!.id ? { ...item, collected: true } : item
            );

            // Обработка опыта
            if (result.experienceGained > 0) {
              const expResult = ExperienceSystem.addExperience(
                newState.player.stats,
                result.experienceGained
              );
              const oldLevel = newState.player.stats.level;
              newState.player = {
                ...newState.player,
                stats: expResult.newStats,
              };

              // Проверка достижений при повышении уровня
              if (
                expResult.newStats.level > oldLevel &&
                newState.isGameStarted &&
                !newState.isPaused
              ) {
                const updatedStatistics = {
                  ...statistics,
                  totalCoinsCollected: newState.coins,
                  totalPotionsCollected: newState.items.filter(
                    (item) => item.type === "POTION" && item.collected
                  ).length,
                  totalRareItemsCollected: newState.items.filter(
                    (item) => item.type === "RARE_ITEM" && item.collected
                  ).length,
                  currentLevel: expResult.newStats.level,
                  maxLevel: expResult.newStats.level,
                  totalExperience: expResult.newStats.experience,
                };
                const newlyUnlocked = checkAchievements(updatedStatistics, newState);
                if (newlyUnlocked.length > 0 && onAchievementUnlocked) {
                  onAchievementUnlocked(newlyUnlocked);
                }
              }
            }

            // Обработка здоровья (зелье)
            if (result.healthRestored) {
              const currentStats = newState.player.stats;
              newState.player = {
                ...newState.player,
                stats: {
                  ...currentStats,
                  health: Math.min(
                    currentStats.maxHealth,
                    currentStats.health + result.healthRestored
                  ),
                },
              };
            }

            // Обновление монет
            if (result.item.type === "COIN") {
              newState.coins += 1;
            }

            // Обновление инвентаря
            if (result.addedToInventory) {
              newState.inventory = itemCollector.getUpdatedInventory();
            }

            // Проверка достижений после сбора предмета
            if (newState.isGameStarted && !newState.isPaused) {
              const updatedStatistics = {
                ...statistics,
                totalCoinsCollected: newState.coins,
                totalPotionsCollected: newState.items.filter(
                  (item) => item.type === "POTION" && item.collected
                ).length,
                totalRareItemsCollected: newState.items.filter(
                  (item) => item.type === "RARE_ITEM" && item.collected
                ).length,
                currentLevel: newState.player.stats.level,
                maxLevel: newState.player.stats.level,
                totalExperience: newState.player.stats.experience,
              };
              const newlyUnlocked = checkAchievements(updatedStatistics, newState);
              if (newlyUnlocked.length > 0 && onAchievementUnlocked) {
                onAchievementUnlocked(newlyUnlocked);
              }
            }
          }
        }
      }

      // Обновление состояния
      engine.updateGameState(newState);
      const updatedState = engine.getGameState();
      setGameState(updatedState);

      if (onStateChange) {
        onStateChange(updatedState);
      }
    },
    [
      enabled,
      gameState.isPaused,
      gameState.isGameStarted,
      onStateChange,
      statistics,
      checkAchievements,
      onAchievementUnlocked,
    ]
  );

  /**
   * Обработка движения
   */
  const handleMove = useCallback(
    (direction: Direction, movementType: MovementType): void => {
      const engine = engineRef.current;
      const playerController = playerControllerRef.current;
      const movementSystem = movementSystemRef.current;
      const collisionDetector = collisionDetectorRef.current;

      if (!engine || !playerController || !movementSystem || !collisionDetector) {
        return;
      }

      const currentState = engine.getGameState();

      // Проверка стамины для бега
      let finalMovementType: MovementType = movementType;
      if (movementType === "RUN" && currentState.player.stats.stamina <= 0) {
        finalMovementType = "WALK" as MovementType;
      }

      // Попытка движения
      const moved = playerController.tryMove(direction, finalMovementType);

      if (moved) {
        const newPosition = playerController.getPosition();
        const newState = {
          ...currentState,
          player: {
            ...currentState.player,
            position: newPosition,
            direction,
            movementType: finalMovementType,
            isMoving: true,
          },
        };

        engine.updateGameState(newState);
        const updatedState = engine.getGameState();
        setGameState(updatedState);

        if (onStateChange) {
          onStateChange(updatedState);
        }
      }
    },
    [onStateChange]
  );

  /**
   * Запуск игры
   */
  const startGame = useCallback((): void => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }

    engine.startGame();
    const newState = engine.getGameState();
    setGameState(newState);

    if (onStateChange) {
      onStateChange(newState);
    }
  }, [onStateChange]);

  /**
   * Сброс игры
   */
  const resetGame = useCallback((): void => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }

    engine.reset();
    const newState = engine.getGameState();
    setGameState(newState);

    // Переинициализация контроллеров
    playerControllerRef.current = new PlayerController(
      newState.map,
      newState.player.position
    );
    movementSystemRef.current = new MovementSystem(newState.player.stats);
    collisionDetectorRef.current = new CollisionDetector(newState.map);

    if (onStateChange) {
      onStateChange(newState);
    }
  }, [onStateChange]);

  /**
   * Пауза игры
   */
  const pauseGame = useCallback((): void => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }

    engine.pause();
    const newState = engine.getGameState();
    setGameState(newState);
  }, []);

  /**
   * Возобновление игры
   */
  const resumeGame = useCallback((): void => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }

    engine.resume();
    const newState = engine.getGameState();
    setGameState(newState);
  }, []);

  // Автосохранение
  useEffect(() => {
    if (!gameState.isGameStarted) {
      return;
    }

    const timer = setTimeout(() => {
      saveGameState(gameState);
    }, GAME_CONFIG.AUTO_SAVE_INTERVAL);

    return () => {
      clearTimeout(timer);
    };
  }, [gameState, saveGameState]);

  // Обработка клавиатуры
  useKeyboard({
    enabled: enabled && gameState.isGameStarted && !gameState.isPaused,
    onMove: handleMove,
    onStop: () => {
      const engine = engineRef.current;
      if (!engine) {
        return;
      }

      const currentState = engine.getGameState();
      const newState: Partial<GameState> = {
        player: {
          ...currentState.player,
          isMoving: false,
          movementType: "IDLE" as MovementType,
        },
      };

      engine.updateGameState(newState);
      setGameState(engine.getGameState());
    },
  });

  return {
    gameState,
    updateGame,
    handleMove,
    startGame,
    resetGame,
    pauseGame,
    resumeGame,
  };
};
