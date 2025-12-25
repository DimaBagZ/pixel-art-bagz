/**
 * Типы и константы для предметов
 */

import { ItemType } from "@/types/pixel-art-game.types";
import { GAME_CONFIG } from "@/utils/pixel-art-constants";

/**
 * Константы для типов предметов
 */
export const ITEM_TYPES = {
  COIN: ItemType.COIN,
  POTION: ItemType.POTION,
  RARE_ITEM: ItemType.RARE_ITEM,
} as const;

/**
 * Значение опыта для каждого типа предмета
 */
export const ITEM_XP_VALUES: Record<ItemType, number> = {
  [ItemType.COIN]: GAME_CONFIG.COIN_XP_VALUE,
  [ItemType.POTION]: 0, // Зелья не дают XP
  [ItemType.RARE_ITEM]: GAME_CONFIG.RARE_ITEM_XP_VALUE,
} as const;

/**
 * Восстановление здоровья для зелий
 */
export const POTION_HEALTH_RESTORE = GAME_CONFIG.POTION_HEALTH_RESTORE;

/**
 * Проверка, дает ли предмет опыт
 */
export function givesExperience(itemType: ItemType): boolean {
  return ITEM_XP_VALUES[itemType] > 0;
}

/**
 * Проверка, восстанавливает ли предмет здоровье
 */
export function restoresHealth(itemType: ItemType): boolean {
  return itemType === ItemType.POTION;
}

/**
 * Проверка, идет ли предмет в инвентарь
 */
export function goesToInventory(itemType: ItemType): boolean {
  return itemType === ItemType.RARE_ITEM;
}

