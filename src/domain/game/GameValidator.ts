/**
 * Валидатор игровых ходов
 * Соблюдает принцип Single Responsibility
 */

import type { BoardState, Position } from "@/types/game.types";
import { BOARD_SIZE } from "@/utils/constants";

/**
 * Класс для валидации игровых ходов
 */
export class GameValidator {
  /**
   * Проверяет, является ли ход валидным
   */
  static isValidMove(board: BoardState, position: Position): boolean {
    return (
      this.isPositionInBounds(position) &&
      this.isCellEmpty(board, position)
    );
  }

  /**
   * Проверяет, находится ли позиция в пределах доски
   */
  static isPositionInBounds(position: Position): boolean {
    return (
      position.row >= 0 &&
      position.row < BOARD_SIZE &&
      position.col >= 0 &&
      position.col < BOARD_SIZE
    );
  }

  /**
   * Проверяет, пуста ли ячейка
   */
  static isCellEmpty(board: BoardState, position: Position): boolean {
    if (!this.isPositionInBounds(position)) {
      return false;
    }

    return board[position.row][position.col] === "";
  }

  /**
   * Проверяет, заполнена ли доска полностью
   */
  static isBoardFull(board: BoardState): boolean {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === "") {
          return false;
        }
      }
    }
    return true;
  }
}

