/**
 * Базовый класс для ИИ игроков
 * Содержит общую логику для всех уровней сложности
 * Соблюдает принцип DRY
 * Строгая типизация без использования any
 */

import type { BoardState, Position } from "@/types/game.types";
import { Player, PlayerType } from "@/types/game.types";
import type { IPlayer } from "./IPlayer";
import { GameValidator } from "./GameValidator";
import { BOARD_SIZE, WINNING_LINES } from "@/utils/constants";

/**
 * Базовый класс для ИИ игроков
 */
export abstract class BaseAIPlayer implements IPlayer {
  protected readonly player: Player;

  constructor(player: Player) {
    if (player === Player.EMPTY) {
      throw new Error("ИИ не может быть пустым игроком");
    }
    this.player = player;
  }

  /**
   * Делает ход (абстрактный метод, должен быть реализован в наследниках)
   */
  abstract makeMove(board: BoardState): Position;

  /**
   * Возвращает тип игрока
   */
  getPlayerType(): PlayerType {
    return PlayerType.AI;
  }

  /**
   * Находит выигрышный ход
   */
  protected findWinningMove(board: BoardState): Position | null {
    return this.findMoveForPlayer(board, this.player);
  }

  /**
   * Находит ход для блокировки противника
   */
  protected findBlockingMove(board: BoardState): Position | null {
    const opponent = this.player === Player.X ? Player.O : Player.X;
    return this.findMoveForPlayer(board, opponent);
  }

  /**
   * Находит ход для указанного игрока (для атаки или блокировки)
   */
  protected findMoveForPlayer(
    board: BoardState,
    player: Player
  ): Position | null {
    for (const line of WINNING_LINES) {
      const cells = line.map((pos) => board[pos.row][pos.col]);
      const playerCount = cells.filter((cell) => cell === player).length;
      const emptyCount = cells.filter((cell) => cell === Player.EMPTY).length;

      // Если в линии 2 клетки игрока и 1 пустая - можем выиграть/заблокировать
      if (playerCount === 2 && emptyCount === 1) {
        const emptyPosition = line.find(
          (pos) => board[pos.row][pos.col] === Player.EMPTY
        );
        if (emptyPosition) {
          return emptyPosition;
        }
      }
    }

    return null;
  }

  /**
   * Находит центр доски
   */
  protected getCenter(): Position {
    return { row: 1, col: 1 };
  }

  /**
   * Находит углы доски
   */
  protected getCorners(): readonly Position[] {
    return [
      { row: 0, col: 0 },
      { row: 0, col: 2 },
      { row: 2, col: 0 },
      { row: 2, col: 2 },
    ] as const;
  }

  /**
   * Находит случайный доступный ход
   */
  protected findRandomMove(board: BoardState): Position {
    const availableMoves: Position[] = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const position: Position = { row, col };
        if (GameValidator.isCellEmpty(board, position)) {
          availableMoves.push(position);
        }
      }
    }

    if (availableMoves.length === 0) {
      throw new Error("Нет доступных ходов");
    }

    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  /**
   * Получить все доступные ходы
   */
  protected getAvailableMoves(board: BoardState): readonly Position[] {
    const availableMoves: Position[] = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const position: Position = { row, col };
        if (GameValidator.isCellEmpty(board, position)) {
          availableMoves.push(position);
        }
      }
    }

    return availableMoves;
  }
}

