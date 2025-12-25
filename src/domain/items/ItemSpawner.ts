/**
 * Генератор предметов на карте
 * Создает и размещает предметы на карте
 * Соблюдает принцип Single Responsibility
 */

import type { GameItem, GameMap, Position } from "@/types/pixel-art-game.types";
import { ItemType } from "@/types/pixel-art-game.types";
import { GAME_CONFIG } from "@/utils/pixel-art-constants";
import { MapGenerator } from "../game/MapGenerator";
import { TileType } from "@/types/pixel-art-game.types";

/**
 * Класс для генерации предметов
 */
export class ItemSpawner {
  private readonly map: GameMap;
  private readonly mapGenerator: MapGenerator;

  constructor(map: GameMap) {
    this.map = map;
    this.mapGenerator = new MapGenerator(map.width, map.height);
  }

  /**
   * Сгенерировать все предметы
   */
  spawnAllItems(): readonly GameItem[] {
    const items: GameItem[] = [];

    // Генерация монет
    const coins = this.spawnCoins();
    items.push(...coins);

    // Генерация зелий
    const potions = this.spawnPotions();
    items.push(...potions);

    // Генерация редких предметов
    const rareItems = this.spawnRareItems();
    items.push(...rareItems);

    return items;
  }

  /**
   * Сгенерировать монеты
   */
  private spawnCoins(): GameItem[] {
    return this.spawnItems(
      ItemType.COIN,
      GAME_CONFIG.COINS_COUNT,
      `coin_${Date.now()}_`
    );
  }

  /**
   * Сгенерировать зелья
   */
  private spawnPotions(): GameItem[] {
    return this.spawnItems(
      ItemType.POTION,
      GAME_CONFIG.POTIONS_COUNT,
      `potion_${Date.now()}_`
    );
  }

  /**
   * Сгенерировать редкие предметы
   */
  private spawnRareItems(): GameItem[] {
    return this.spawnItems(
      ItemType.RARE_ITEM,
      GAME_CONFIG.RARE_ITEMS_COUNT,
      `rare_${Date.now()}_`
    );
  }

  /**
   * Сгенерировать предметы определенного типа
   */
  private spawnItems(
    type: ItemType,
    count: number,
    idPrefix: string
  ): GameItem[] {
    const items: GameItem[] = [];
    const usedPositions = new Set<string>();

    for (let i = 0; i < count; i++) {
      const position = this.getRandomValidPosition(usedPositions);
      if (!position) {
        break; // Не удалось найти позицию
      }

      const positionKey = `${position.x}_${position.y}`;
      usedPositions.add(positionKey);

      items.push({
        id: `${idPrefix}${i}`,
        type,
        position,
        collected: false,
        spawnTime: Date.now(),
      });
    }

    return items;
  }

  /**
   * Получить случайную валидную позицию
   */
  private getRandomValidPosition(usedPositions: Set<string>): Position | null {
    const maxAttempts = 1000;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const position = this.mapGenerator.getRandomFloorPosition(this.map);
      if (!position) {
        return null;
      }

      const positionKey = `${position.x}_${position.y}`;
      if (!usedPositions.has(positionKey)) {
        return position;
      }

      attempts++;
    }

    return null;
  }
}

