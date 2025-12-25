/**
 * Система движения персонажа
 * Управляет логикой шага, бега и стамины
 * Соблюдает принцип Single Responsibility
 */

import type { MovementType, PlayerStats } from "@/types/pixel-art-game.types";
import { MovementType as MovementTypeEnum } from "@/types/pixel-art-game.types";
import { GAME_CONFIG } from "@/utils/pixel-art-constants";

/**
 * Класс для управления движением
 */
export class MovementSystem {
  private readonly stats: PlayerStats;
  private currentMovementType: MovementType;
  private lastUpdateTime: number;

  constructor(stats: PlayerStats) {
    this.stats = stats;
    this.currentMovementType = MovementTypeEnum.IDLE;
    this.lastUpdateTime = Date.now();
  }

  /**
   * Получить скорость движения (тайлов в секунду)
   */
  getMovementSpeed(movementType: MovementType): number {
    switch (movementType) {
      case MovementTypeEnum.WALK:
        return 1 / GAME_CONFIG.WALK_SPEED;
      case MovementTypeEnum.RUN:
        return 1 / GAME_CONFIG.RUN_SPEED;
      case MovementTypeEnum.IDLE:
      default:
        return 0;
    }
  }

  /**
   * Обновить движение и стамину
   */
  updateMovement(movementType: MovementType, deltaTime: number): {
    movementType: MovementType;
    staminaDrained: number;
    staminaRestored: number;
  } {
    const now = Date.now();
    const actualDeltaTime = (now - this.lastUpdateTime) / 1000; // в секундах
    this.lastUpdateTime = now;

    let finalMovementType = movementType;
    let staminaDrained = 0;
    let staminaRestored = 0;

    // Если пытаемся бежать, но стамина закончилась - переключаемся на шаг
    if (movementType === MovementTypeEnum.RUN && this.stats.stamina <= 0) {
      finalMovementType = MovementTypeEnum.WALK;
    }

    // Трата стамины при беге
    if (finalMovementType === MovementTypeEnum.RUN) {
      staminaDrained = GAME_CONFIG.STAMINA_DRAIN_RATE * actualDeltaTime;
    }

    // Восстановление стамины (если не бежим)
    if (finalMovementType !== MovementTypeEnum.RUN) {
      staminaRestored = GAME_CONFIG.STAMINA_RECOVERY_RATE * actualDeltaTime;
    }

    this.currentMovementType = finalMovementType;

    return {
      movementType: finalMovementType,
      staminaDrained,
      staminaRestored,
    };
  }

  /**
   * Проверить, можно ли бежать
   */
  canRun(): boolean {
    return this.stats.stamina > 0;
  }

  /**
   * Получить текущий тип движения
   */
  getCurrentMovementType(): MovementType {
    return this.currentMovementType;
  }
}

