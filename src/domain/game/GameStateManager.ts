/**
 * Менеджер состояния игры
 * Управляет созданием и валидацией состояния игры
 * Соблюдает принцип Single Responsibility
 */

import type { GameState, Position } from "@/types/pixel-art-game.types";
import { GAME_CONFIG } from "@/utils/pixel-art-constants";
import { MapGenerator } from "./MapGenerator";
import { ItemSpawner } from "../items/ItemSpawner";

/**
 * Класс для управления состоянием игры
 */
export class GameStateManager {
  /**
   * Создать начальное состояние игры
   */
  static createInitialState(): GameState {
    const mapGenerator = new MapGenerator();
    const map = mapGenerator.generateMap();

    // Начальная позиция игрока (центр карты)
    const startPosition: Position = {
      x: Math.floor(map.width / 2),
      y: Math.floor(map.height / 2),
    };

    // Генерация предметов
    const itemSpawner = new ItemSpawner(map);
    const items = itemSpawner.spawnAllItems();

    return {
      player: {
        position: startPosition,
        direction: "DOWN" as const,
        movementType: "IDLE" as const,
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
      },
      map,
      items,
      inventory: Array.from({ length: GAME_CONFIG.INVENTORY_SIZE }, (_, i) => ({
        index: i,
        item: null,
      })),
      coins: 0,
      isPaused: false,
      isGameStarted: false,
      gameStartTime: Date.now(),
      lastSaveTime: Date.now(),
    };
  }

  /**
   * Валидация состояния игры
   */
  static validateGameState(state: GameState): boolean {
    try {
      // Проверка обязательных полей
      if (!state.player || !state.map || !state.items || !state.inventory) {
        return false;
      }

      // Проверка позиции игрока
      if (
        state.player.position.x < 0 ||
        state.player.position.x >= state.map.width ||
        state.player.position.y < 0 ||
        state.player.position.y >= state.map.height
      ) {
        return false;
      }

      // Проверка статистики игрока
      if (
        state.player.stats.health < 0 ||
        state.player.stats.health > state.player.stats.maxHealth ||
        state.player.stats.stamina < 0 ||
        state.player.stats.stamina > state.player.stats.maxStamina ||
        state.player.stats.level < 1
      ) {
        return false;
      }

      // Проверка инвентаря
      if (state.inventory.length !== GAME_CONFIG.INVENTORY_SIZE) {
        return false;
      }

      // Проверка монет
      if (state.coins < 0) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}

