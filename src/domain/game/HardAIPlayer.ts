/**
 * Сложный уровень ИИ
 * Реализует алгоритм минимакс для идеальной игры
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import type { BoardState, Position, GameResult } from "@/types/game.types";
import { Player, GameResult as GameResultEnum } from "@/types/game.types";
import { BaseAIPlayer } from "./BaseAIPlayer";
import { GameValidator } from "./GameValidator";
import { WINNING_LINES } from "@/utils/constants";

/**
 * Оценка позиции для минимакс алгоритма
 */
const SCORES = {
  WIN: 10,
  LOSS: -10,
  DRAW: 0,
} as const;

/**
 * Сложный уровень ИИ игрока
 * Использует минимакс алгоритм для идеальной игры
 */
export class HardAIPlayer extends BaseAIPlayer {
  /**
   * Делает ход используя минимакс алгоритм
   */
  makeMove(board: BoardState): Position {
    const bestMove = this.findBestMove(board);
    return bestMove;
  }

  /**
   * Находит лучший ход используя минимакс
   */
  private findBestMove(board: BoardState): Position {
    let bestScore = -Infinity;
    let bestMove: Position | null = null;

    const availableMoves = this.getAvailableMoves(board);

    for (const move of availableMoves) {
      // Создаем копию доски с новым ходом
      const newBoard = this.makeMoveOnBoard(board, move, this.player);

      // Оцениваем этот ход
      const score = this.minimax(newBoard, 0, false);

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    // Если не нашли лучший ход (не должно произойти), возвращаем первый доступный
    return bestMove || availableMoves[0];
  }

  /**
   * Минимакс алгоритм
   */
  private minimax(
    board: BoardState,
    depth: number,
    isMaximizing: boolean
  ): number {
    const result = this.evaluateBoard(board);

    // Если игра окончена, возвращаем оценку
    if (result !== GameResultEnum.IN_PROGRESS) {
      if (result === GameResultEnum.WIN) {
        // Проверяем, кто выиграл
        const winner = this.getWinner(board);
        if (winner === this.player) {
          return SCORES.WIN - depth; // Предпочитаем быстрые победы
        } else {
          return SCORES.LOSS + depth; // Предпочитаем медленные поражения
        }
      }
      return SCORES.DRAW;
    }

    const availableMoves = this.getAvailableMoves(board);

    if (isMaximizing) {
      // Ход ИИ (максимизируем оценку)
      let maxScore = -Infinity;

      for (const move of availableMoves) {
        const newBoard = this.makeMoveOnBoard(board, move, this.player);
        const score = this.minimax(newBoard, depth + 1, false);
        maxScore = Math.max(maxScore, score);
      }

      return maxScore;
    } else {
      // Ход противника (минимизируем оценку)
      let minScore = Infinity;
      const opponent = this.player === Player.X ? Player.O : Player.X;

      for (const move of availableMoves) {
        const newBoard = this.makeMoveOnBoard(board, move, opponent);
        const score = this.minimax(newBoard, depth + 1, true);
        minScore = Math.min(minScore, score);
      }

      return minScore;
    }
  }

  /**
   * Оценивает состояние доски
   */
  private evaluateBoard(board: BoardState): GameResult {
    const winner = this.getWinner(board);
    if (winner !== null) {
      return GameResultEnum.WIN;
    }

    if (GameValidator.isBoardFull(board)) {
      return GameResultEnum.DRAW;
    }

    return GameResultEnum.IN_PROGRESS;
  }

  /**
   * Определяет победителя на доске
   */
  private getWinner(board: BoardState): Player | null {
    for (const line of WINNING_LINES) {
      const firstCell = board[line[0].row][line[0].col];
      if (
        firstCell !== Player.EMPTY &&
        line.every((pos) => board[pos.row][pos.col] === firstCell)
      ) {
        return firstCell;
      }
    }

    return null;
  }

  /**
   * Создает новую доску с выполненным ходом
   */
  private makeMoveOnBoard(
    board: BoardState,
    position: Position,
    player: Player
  ): BoardState {
    // Создаем изменяемую копию доски
    const row0: [Player, Player, Player] = [
      board[0][0],
      board[0][1],
      board[0][2],
    ];
    const row1: [Player, Player, Player] = [
      board[1][0],
      board[1][1],
      board[1][2],
    ];
    const row2: [Player, Player, Player] = [
      board[2][0],
      board[2][1],
      board[2][2],
    ];

    const newBoard: [Player[], Player[], Player[]] = [row0, row1, row2];

    newBoard[position.row][position.col] = player;

    // Преобразуем обратно в BoardState через unknown для безопасности
    return newBoard as unknown as BoardState;
  }
}

