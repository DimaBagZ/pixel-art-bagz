/**
 * Генератор промокодов
 * Соблюдает принцип Single Responsibility
 */

import type { PromoCode } from "@/types/common.types";

/**
 * Длина промокода
 */
const PROMO_CODE_LENGTH = 5;

/**
 * Символы для генерации промокода (буквы и цифры)
 */
const PROMO_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Класс для генерации промокодов
 */
export class PromoCodeGenerator {
  /**
   * Генерирует случайный промокод
   */
  static generate(): PromoCode {
    let code = "";

    for (let i = 0; i < PROMO_CODE_LENGTH; i++) {
      const randomIndex = Math.floor(
        Math.random() * PROMO_CODE_CHARS.length
      );
      code += PROMO_CODE_CHARS[randomIndex];
    }

    return code;
  }
}

