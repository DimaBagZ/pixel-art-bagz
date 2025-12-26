/**
 * Сервис для сохранения и загрузки состояния игры
 * Поддерживает миграцию старых сохранений
 */

import { StorageService } from "./StorageService";
import { STORAGE_KEYS } from "./StorageTypes";
import type { GameState, SavedGameState } from "@/types/pixel-art-game.types";
import { GAME_CONFIG } from "@/utils/pixel-art-constants";

/**
 * Сервис для работы с сохраненным состоянием игры
 */
export class GameStateService {
  private readonly storage: StorageService;

  constructor(storage: StorageService = new StorageService()) {
    this.storage = storage;
  }

  /**
   * Сохранить состояние игры
   */
  saveGameState(gameState: GameState): boolean {
    try {
      const savedState: SavedGameState = {
        version: GAME_CONFIG.SAVE_VERSION,
        timestamp: Date.now(),
        gameState: {
          ...gameState,
          lastSaveTime: Date.now(),
        },
      };

      const success = this.storage.set<SavedGameState>(
        STORAGE_KEYS.PIXEL_ART_GAME_STATE,
        savedState
      );

      return success;
    } catch (error) {
      console.error("Ошибка сохранения состояния игры:", error);
      return false;
    }
  }

  /**
   * Загрузить сохраненное состояние игры
   */
  loadGameState(): GameState | null {
    try {
      const savedState = this.storage.get<SavedGameState>(
        STORAGE_KEYS.PIXEL_ART_GAME_STATE
      );

      if (!savedState) {
        return null;
      }

      // Проверка версии сохранения
      if (savedState.version !== GAME_CONFIG.SAVE_VERSION) {
        console.warn(
          `Версия сохранения (${savedState.version}) не совпадает с текущей (${GAME_CONFIG.SAVE_VERSION}). Удаляем старое сохранение.`
        );
        // Удаляем старое несовместимое сохранение
        this.deleteGameState();
        return null;
      }

      // Валидация сохраненного состояния
      if (!this.validateGameState(savedState.gameState)) {
        console.warn("Сохраненное состояние игры невалидно. Удаляем.");
        this.deleteGameState();
        return null;
      }

      return savedState.gameState;
    } catch (error) {
      console.error("Ошибка загрузки состояния игры:", error);
      return null;
    }
  }

  /**
   * Проверить наличие сохраненного состояния
   */
  hasSavedGame(): boolean {
    return this.storage.exists(STORAGE_KEYS.PIXEL_ART_GAME_STATE);
  }

  /**
   * Удалить сохраненное состояние игры
   */
  deleteGameState(): boolean {
    try {
      const success = this.storage.remove(STORAGE_KEYS.PIXEL_ART_GAME_STATE);
      return success;
    } catch (error) {
      console.error("Ошибка удаления состояния игры:", error);
      return false;
    }
  }

  /**
   * Валидация состояния игры (DOOM-style с пиксельными координатами)
   */
  private validateGameState(gameState: GameState): boolean {
    try {
      // Проверка обязательных полей
      if (
        !gameState.player ||
        !gameState.map ||
        !gameState.items ||
        !gameState.inventory
      ) {
        return false;
      }

      // Проверка позиции игрока (теперь в пикселях)
      const maxX = gameState.map.width * GAME_CONFIG.TILE_SIZE;
      const maxY = gameState.map.height * GAME_CONFIG.TILE_SIZE;

      if (
        gameState.player.position.x < 0 ||
        gameState.player.position.x >= maxX ||
        gameState.player.position.y < 0 ||
        gameState.player.position.y >= maxY
      ) {
        return false;
      }

      // Проверка наличия новых полей (angle, velocity)
      if (typeof gameState.player.angle !== "number" || !gameState.player.velocity) {
        return false;
      }

      // Проверка статистики игрока
      if (
        gameState.player.stats.health < 0 ||
        gameState.player.stats.health > gameState.player.stats.maxHealth ||
        gameState.player.stats.stamina < 0 ||
        gameState.player.stats.stamina > gameState.player.stats.maxStamina ||
        gameState.player.stats.level < 1
      ) {
        return false;
      }

      // Проверка инвентаря
      if (gameState.inventory.length !== GAME_CONFIG.INVENTORY_SIZE) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Получить метаданные сохранения
   */
  getSaveMetadata(): { version: number; timestamp: number } | null {
    const savedState = this.storage.get<SavedGameState>(
      STORAGE_KEYS.PIXEL_ART_GAME_STATE
    );

    if (!savedState) {
      return null;
    }

    return {
      version: savedState.version,
      timestamp: savedState.timestamp,
    };
  }
}

/**
 * Экземпляр сервиса по умолчанию
 */
export const gameStateService = new GameStateService();
