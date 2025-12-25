/**
 * Валидация аватаров
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import { AvatarRegistry } from "./AvatarRegistry";
import type { AvatarId } from "./AvatarPreset";

/**
 * Класс для валидации аватаров
 */
export class AvatarValidator {
  /**
   * Проверить валидность ID аватара
   */
  static isValidId(id: string): id is AvatarId {
    return AvatarRegistry.exists(id);
  }

  /**
   * Валидировать и нормализовать ID аватара
   */
  static validateAndNormalize(id: string): AvatarId | null {
    if (this.isValidId(id)) {
      return id;
    }
    return null;
  }
}

