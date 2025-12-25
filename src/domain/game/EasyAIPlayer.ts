/**
 * Легкий уровень ИИ
 * 30% правильных ходов, 70% случайных
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import type { BoardState, Position } from "@/types/game.types";
import { BaseAIPlayer } from "./BaseAIPlayer";
import { GameValidator } from "./GameValidator";

/**
 * Вероятность правильного хода (30%)
 */
const SMART_MOVE_PROBABILITY = 0.3;

/**
 * Легкий уровень ИИ игрока
 */
export class EasyAIPlayer extends BaseAIPlayer {
  /**
   * Делает ход
   * С вероятностью 30% делает правильный ход, иначе случайный
   */
  makeMove(board: BoardState): Position {
    const shouldMakeSmartMove = Math.random() < SMART_MOVE_PROBABILITY;

    if (shouldMakeSmartMove) {
      // Попытка сделать правильный ход
      const smartMove = this.findSmartMove(board);
      if (smartMove) {
        return smartMove;
      }
    }

    // Случайный ход
    return this.findRandomMove(board);
  }

  /**
   * Находит правильный ход (атака, блок, центр, углы)
   */
  private findSmartMove(board: BoardState): Position | null {
    // 1. Попытка выиграть
    const winningMove = this.findWinningMove(board);
    if (winningMove) {
      return winningMove;
    }

    // 2. Блокировка противника
    const blockingMove = this.findBlockingMove(board);
    if (blockingMove) {
      return blockingMove;
    }

    // 3. Захват центра
    const center = this.getCenter();
    if (GameValidator.isCellEmpty(board, center)) {
      return center;
    }

    // 4. Захват угла
    const corners = this.getCorners();
    const availableCorners = corners.filter((corner) =>
      GameValidator.isCellEmpty(board, corner)
    );

    if (availableCorners.length > 0) {
      return availableCorners[
        Math.floor(Math.random() * availableCorners.length)
      ];
    }

    return null;
  }
}

