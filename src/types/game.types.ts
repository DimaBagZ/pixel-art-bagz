/**
 * Типы для игровой логики
 * Строгая типизация без использования any
 */

/**
 * Игрок на доске
 */
export enum Player {
  X = "X",
  O = "O",
  EMPTY = "",
}

/**
 * Позиция на доске (строка и столбец)
 */
export interface Position {
  readonly row: number;
  readonly col: number;
}

/**
 * Состояние доски (3x3 массив)
 */
export type BoardState = readonly [
  readonly [Player, Player, Player],
  readonly [Player, Player, Player],
  readonly [Player, Player, Player]
];

/**
 * Результат игры
 */
export enum GameResult {
  WIN = "WIN",
  LOSE = "LOSE",
  DRAW = "DRAW",
  IN_PROGRESS = "IN_PROGRESS",
}

/**
 * Победитель игры
 */
export interface Winner {
  readonly player: Player;
  readonly combination: readonly Position[];
}

/**
 * Состояние игры
 */
export interface GameState {
  readonly board: BoardState;
  readonly currentPlayer: Player;
  readonly result: GameResult;
  readonly winner: Winner | null;
}

/**
 * Интерфейс для игрока (для расширяемости - поддержка разных типов игроков)
 */
export interface IPlayer {
  makeMove(board: BoardState): Position;
  getPlayerType(): PlayerType;
}

/**
 * Тип игрока
 */
export enum PlayerType {
  HUMAN = "HUMAN",
  AI = "AI",
}

/**
 * Уровень сложности ИИ
 */
export enum AIDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}
