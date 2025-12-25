/**
 * Игровой движок для пиксель-арт игры
 * Управляет состоянием игры и логикой
 * Соблюдает принцип Single Responsibility
 */

import type { GameState } from "@/types/pixel-art-game.types";
import { GameStateManager } from "./GameStateManager";

/**
 * Класс игрового движка
 */
export class PixelArtGameEngine {
  private gameState: GameState;

  constructor(initialState?: GameState) {
    if (initialState && GameStateManager.validateGameState(initialState)) {
      this.gameState = initialState;
    } else {
      this.gameState = GameStateManager.createInitialState();
    }
  }

  /**
   * Получить текущее состояние игры
   */
  getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * Обновить состояние игры
   */
  updateGameState(updates: Partial<GameState>): void {
    this.gameState = {
      ...this.gameState,
      ...updates,
    };
  }

  /**
   * Сбросить игру
   */
  reset(): void {
    this.gameState = GameStateManager.createInitialState();
  }

  /**
   * Пауза игры
   */
  pause(): void {
    this.gameState = {
      ...this.gameState,
      isPaused: true,
    };
  }

  /**
   * Возобновить игру
   */
  resume(): void {
    this.gameState = {
      ...this.gameState,
      isPaused: false,
    };
  }

  /**
   * Начать игру
   */
  startGame(): void {
    this.gameState = {
      ...this.gameState,
      isGameStarted: true,
      gameStartTime: Date.now(),
    };
  }
}

