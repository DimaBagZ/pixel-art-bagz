/**
 * Контроллер персонажа
 * Обрабатывает ввод и управляет движением
 * Соблюдает принцип Single Responsibility
 */

import type { Position, Direction, MovementType } from "@/types/pixel-art-game.types";
import { Direction as DirectionEnum, MovementType as MovementTypeEnum } from "@/types/pixel-art-game.types";
import { CollisionDetector } from "../game/CollisionDetector";
import type { GameMap } from "@/types/pixel-art-game.types";
import { DIRECTIONS } from "@/utils/pixel-art-constants";

/**
 * Класс для управления персонажем
 */
export class PlayerController {
  private readonly collisionDetector: CollisionDetector;
  private currentPosition: Position;
  private currentDirection: Direction;
  private currentMovementType: MovementType;

  constructor(map: GameMap, startPosition: Position) {
    this.collisionDetector = new CollisionDetector(map);
    this.currentPosition = startPosition;
    this.currentDirection = DirectionEnum.DOWN;
    this.currentMovementType = MovementTypeEnum.IDLE;
  }

  /**
   * Получить текущую позицию
   */
  getPosition(): Position {
    return { ...this.currentPosition };
  }

  /**
   * Получить текущее направление
   */
  getDirection(): Direction {
    return this.currentDirection;
  }

  /**
   * Получить текущий тип движения
   */
  getMovementType(): MovementType {
    return this.currentMovementType;
  }

  /**
   * Попытаться переместиться в направлении
   */
  tryMove(direction: Direction, movementType: MovementType): boolean {
    const newPosition = this.calculateNewPosition(direction);

    if (!this.collisionDetector.canMoveTo(newPosition)) {
      return false;
    }

    this.currentPosition = newPosition;
    this.currentDirection = direction;
    this.currentMovementType = movementType;

    return true;
  }

  /**
   * Рассчитать новую позицию на основе направления
   */
  private calculateNewPosition(direction: Direction): Position {
    const directionVector = DIRECTIONS[direction];
    return {
      x: this.currentPosition.x + directionVector.x,
      y: this.currentPosition.y + directionVector.y,
    };
  }

  /**
   * Установить позицию (для телепортации/загрузки)
   */
  setPosition(position: Position): boolean {
    if (!this.collisionDetector.canMoveTo(position)) {
      return false;
    }

    this.currentPosition = position;
    return true;
  }

  /**
   * Установить направление
   */
  setDirection(direction: Direction): void {
    this.currentDirection = direction;
  }

  /**
   * Установить тип движения
   */
  setMovementType(movementType: MovementType): void {
    this.currentMovementType = movementType;
  }

  /**
   * Остановить движение
   */
  stopMovement(): void {
    this.currentMovementType = MovementTypeEnum.IDLE;
  }
}

