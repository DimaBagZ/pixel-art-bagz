/**
 * Константы игры
 */

import type { Position } from "@/types/game.types";
import { Player } from "@/types/game.types";

/**
 * Размер игровой доски
 */
export const BOARD_SIZE = 3;

/**
 * Выигрышные комбинации (индексы позиций)
 */
export const WINNING_COMBINATIONS: readonly Position[] = [
  // Горизонтальные
  { row: 0, col: 0 },
  { row: 0, col: 1 },
  { row: 0, col: 2 },
  { row: 1, col: 0 },
  { row: 1, col: 1 },
  { row: 1, col: 2 },
  { row: 2, col: 0 },
  { row: 2, col: 1 },
  { row: 2, col: 2 },
  // Вертикальные
  { row: 0, col: 0 },
  { row: 1, col: 0 },
  { row: 2, col: 0 },
  { row: 0, col: 1 },
  { row: 1, col: 1 },
  { row: 2, col: 1 },
  { row: 0, col: 2 },
  { row: 1, col: 2 },
  { row: 2, col: 2 },
  // Диагональные
  { row: 0, col: 0 },
  { row: 1, col: 1 },
  { row: 2, col: 2 },
  { row: 0, col: 2 },
  { row: 1, col: 1 },
  { row: 2, col: 0 },
];

/**
 * Выигрышные линии (группы из 3 позиций)
 */
export const WINNING_LINES: readonly (readonly Position[])[] = [
  // Горизонтальные линии
  [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
  ],
  [
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: 2 },
  ],
  [
    { row: 2, col: 0 },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
  ],
  // Вертикальные линии
  [
    { row: 0, col: 0 },
    { row: 1, col: 0 },
    { row: 2, col: 0 },
  ],
  [
    { row: 0, col: 1 },
    { row: 1, col: 1 },
    { row: 2, col: 1 },
  ],
  [
    { row: 0, col: 2 },
    { row: 1, col: 2 },
    { row: 2, col: 2 },
  ],
  // Диагональные линии
  [
    { row: 0, col: 0 },
    { row: 1, col: 1 },
    { row: 2, col: 2 },
  ],
  [
    { row: 0, col: 2 },
    { row: 1, col: 1 },
    { row: 2, col: 0 },
  ],
] as const;

/**
 * Символы игроков
 */
export const PLAYER_SYMBOLS = {
  X: Player.X,
  O: Player.O,
} as const;

/**
 * Текстовые сообщения игры
 */
export const GAME_MESSAGES = {
  PLAYER_TURN: (player: Player) => `Ход игрока ${player}`,
  GAME_OVER: "Игра завершена",
  WINNER: (player: Player) => `Победил игрок ${player}!`,
  DRAW: "Ничья!",
  INVALID_MOVE: "Недопустимый ход",
  CELL_OCCUPIED: "Ячейка уже занята",
} as const;
