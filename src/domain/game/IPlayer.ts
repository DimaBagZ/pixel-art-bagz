/**
 * Интерфейс игрока
 * Соблюдает принцип Interface Segregation и Dependency Inversion
 */

import type { BoardState, Position } from "@/types/game.types";
import type { PlayerType } from "@/types/game.types";

/**
 * Интерфейс для игрока
 * Позволяет легко добавлять новых игроков (Human, AI разных уровней)
 */
export interface IPlayer {
  /**
   * Делает ход на доске
   */
  makeMove(board: BoardState): Position;

  /**
   * Возвращает тип игрока
   */
  getPlayerType(): PlayerType;
}

