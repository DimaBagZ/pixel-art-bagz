/**
 * Игровой движок
 * Управляет состоянием игры и логикой
 * Соблюдает принцип Single Responsibility
 */

import type {
  BoardState,
  GameResult,
  GameState,
  Position,
  Winner,
} from "@/types/game.types";
import { GameResult as GameResultEnum, Player } from "@/types/game.types";
import { GameValidator } from "./GameValidator";
import { WINNING_LINES } from "@/utils/constants";

/**
 * Класс игрового движка
 */
export class GameEngine {
  private board: BoardState;
  private currentPlayer: Player;

  constructor() {
    this.board = this.createEmptyBoard();
    this.currentPlayer = Player.X;
  }

  /**
   * Создает пустую доску
   */
  private createEmptyBoard(): BoardState {
    return [
      [Player.EMPTY, Player.EMPTY, Player.EMPTY],
      [Player.EMPTY, Player.EMPTY, Player.EMPTY],
      [Player.EMPTY, Player.EMPTY, Player.EMPTY],
    ] as BoardState;
  }

  /**
   * Делает ход
   */
  makeMove(position: Position, player: Player): GameResult {
    // Валидация хода
    if (!GameValidator.isValidMove(this.board, position)) {
      throw new Error("Недопустимый ход");
    }

    if (player !== this.currentPlayer) {
      throw new Error("Не ваш ход");
    }

    // Создаем новую доску с ходом
    const newBoard: BoardState = [
      [
        position.row === 0 && position.col === 0 ? player : this.board[0][0],
        position.row === 0 && position.col === 1 ? player : this.board[0][1],
        position.row === 0 && position.col === 2 ? player : this.board[0][2],
      ],
      [
        position.row === 1 && position.col === 0 ? player : this.board[1][0],
        position.row === 1 && position.col === 1 ? player : this.board[1][1],
        position.row === 1 && position.col === 2 ? player : this.board[1][2],
      ],
      [
        position.row === 2 && position.col === 0 ? player : this.board[2][0],
        position.row === 2 && position.col === 1 ? player : this.board[2][1],
        position.row === 2 && position.col === 2 ? player : this.board[2][2],
      ],
    ];

    this.board = newBoard;

    // Проверяем результат игры
    const winner = this.checkWinner();
    if (winner) {
      return GameResultEnum.WIN;
    }

    if (GameValidator.isBoardFull(this.board)) {
      return GameResultEnum.DRAW;
    }

    // Переключаем игрока
    this.currentPlayer = this.currentPlayer === Player.X ? Player.O : Player.X;

    return GameResultEnum.IN_PROGRESS;
  }

  /**
   * Проверяет наличие победителя
   */
  checkWinner(): Winner | null {
    for (const line of WINNING_LINES) {
      const firstCell = this.board[line[0].row][line[0].col];

      if (firstCell === Player.EMPTY) {
        continue;
      }

      const isWinningLine = line.every(
        (pos) => this.board[pos.row][pos.col] === firstCell
      );

      if (isWinningLine) {
        return {
          player: firstCell,
          combination: line,
        };
      }
    }

    return null;
  }

  /**
   * Проверяет, завершена ли игра
   */
  isGameOver(): boolean {
    return this.checkWinner() !== null || GameValidator.isBoardFull(this.board);
  }

  /**
   * Возвращает текущее состояние доски
   */
  getBoard(): BoardState {
    return this.board;
  }

  /**
   * Возвращает текущего игрока
   */
  getCurrentPlayer(): Player {
    return this.currentPlayer;
  }

  /**
   * Возвращает полное состояние игры
   */
  getGameState(): GameState {
    const winner = this.checkWinner();
    let result: GameResult;

    if (winner) {
      result = GameResultEnum.WIN;
    } else if (GameValidator.isBoardFull(this.board)) {
      result = GameResultEnum.DRAW;
    } else {
      result = GameResultEnum.IN_PROGRESS;
    }

    return {
      board: this.board,
      currentPlayer: this.currentPlayer,
      result,
      winner,
    };
  }

  /**
   * Сбрасывает игру
   */
  reset(): void {
    this.board = this.createEmptyBoard();
    this.currentPlayer = Player.X;
  }
}
