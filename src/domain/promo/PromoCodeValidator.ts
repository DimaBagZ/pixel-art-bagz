/**
 * Валидатор промокодов
 * Соблюдает принцип Single Responsibility
 */

import type { PromoCode } from "@/types/common.types";

/**
 * Длина промокода
 */
const PROMO_CODE_LENGTH = 5;

/**
 * Регулярное выражение для валидации промокода (буквы и цифры)
 */
const PROMO_CODE_PATTERN = /^[A-Z0-9]+$/;

/**
 * Класс для валидации промокодов
 */
export class PromoCodeValidator {
  /**
   * Проверяет валидность промокода
   */
  static isValid(code: PromoCode): boolean {
    if (code.length !== PROMO_CODE_LENGTH) {
      return false;
    }

    if (!PROMO_CODE_PATTERN.test(code)) {
      return false;
    }

    return true;
  }
}

