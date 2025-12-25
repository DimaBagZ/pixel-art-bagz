/**
 * Средний уровень ИИ
 * Реализует стратегию: атака → блок → центр → углы → случайный ход
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import type { BoardState, Position } from "@/types/game.types";
import { BaseAIPlayer } from "./BaseAIPlayer";
import { GameValidator } from "./GameValidator";

/**
 * Средний уровень ИИ игрока
 * Это текущая логика из AIPlayer, переименованная в MediumAIPlayer
 */
export class MediumAIPlayer extends BaseAIPlayer {
  /**
   * Делает ход по стратегии
   */
  makeMove(board: BoardState): Position {
    // 1. Попытка выиграть (атака)
    const winningMove = this.findWinningMove(board);
    if (winningMove) {
      return winningMove;
    }

    // 2. Блокировка противника
    const blockingMove = this.findBlockingMove(board);
    if (blockingMove) {
      return blockingMove;
    }

    // 3. Захват центра (если свободен)
    const center = this.getCenter();
    if (GameValidator.isCellEmpty(board, center)) {
      return center;
    }

    // 4. Захват угла (если свободен)
    const corners = this.getCorners();
    const availableCorners = corners.filter((corner) =>
      GameValidator.isCellEmpty(board, corner)
    );

    if (availableCorners.length > 0) {
      return availableCorners[
        Math.floor(Math.random() * availableCorners.length)
      ];
    }

    // 5. Случайный доступный ход
    return this.findRandomMove(board);
  }
}

