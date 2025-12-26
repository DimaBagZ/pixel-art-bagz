/**
 * Генератор предметов на карте
 * Создает и размещает предметы на карте
 */

import type { GameItem, GameMap, Position } from "@/types/pixel-art-game.types";
import { ItemType, TileType } from "@/types/pixel-art-game.types";
import { GAME_CONFIG, getItemCountsForLevel } from "@/utils/pixel-art-constants";

/**
 * Класс для генерации предметов
 */
export class ItemSpawner {
  private readonly map: GameMap;
  private readonly mapLevel: number;

  constructor(map: GameMap, mapLevel: number = 1) {
    this.map = map;
    this.mapLevel = mapLevel;
  }

  /**
   * Сгенерировать все предметы
   */
  spawnAllItems(): readonly GameItem[] {
    const items: GameItem[] = [];
    const counts = getItemCountsForLevel(this.mapLevel);
    const usedPositions = new Set<string>();

    // Сначала спавним МНОГО предметов в сокровищнице (если она есть)
    const treasureItems = this.spawnTreasureRoomItems(usedPositions);
    items.push(...treasureItems);

    // Генерация монет на обычном полу
    const coins = this.spawnItemsOnFloor(ItemType.COIN, counts.coins, `coin_${Date.now()}_`, usedPositions);
    items.push(...coins);

    // Генерация зелий здоровья
    const potions = this.spawnItemsOnFloor(ItemType.POTION, counts.potions, `potion_${Date.now()}_`, usedPositions);
    items.push(...potions);

    // Генерация зелий стамины
    const staminaPotions = this.spawnItemsOnFloor(
      ItemType.STAMINA_POTION,
      counts.staminaPotions,
      `stamina_${Date.now()}_`,
      usedPositions
    );
    items.push(...staminaPotions);

    // Генерация редких предметов
    const rareItems = this.spawnItemsOnFloor(
      ItemType.RARE_ITEM,
      counts.rareItems,
      `rare_${Date.now()}_`,
      usedPositions
    );
    items.push(...rareItems);

    return items;
  }

  /**
   * Спавн предметов в сокровищнице (FLOOR_LIGHT)
   */
  private spawnTreasureRoomItems(usedPositions: Set<string>): GameItem[] {
    const items: GameItem[] = [];
    const treasurePositions: Position[] = [];
    
    // Собираем все позиции FLOOR_LIGHT (сокровищница)
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const tile = this.map.tiles[y]?.[x];
        if (tile && tile.type === TileType.FLOOR_LIGHT) {
          treasurePositions.push({
            x: x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
            y: y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
          });
        }
      }
    }

    if (treasurePositions.length === 0) {
      return items;
    }

    console.log(`[ItemSpawner] Найдено ${treasurePositions.length} тайлов сокровищницы`);

    // Перемешиваем
    this.shuffleArray(treasurePositions);

    // Спавним ОЧЕНЬ МНОГО предметов - почти всю комнату заполняем!
    // Оставляем только 2-3 тайла свободными для прохода
    const treasureCount = Math.max(10, treasurePositions.length - 3);
    const timestamp = Date.now();

    for (let i = 0; i < treasureCount; i++) {
      if (i >= treasurePositions.length) break;
      
      const position = treasurePositions[i];
      const positionKey = `${position.x}_${position.y}`;
      
      if (usedPositions.has(positionKey)) continue;
      usedPositions.add(positionKey);

      // Распределение предметов в сокровищнице - МНОГО редких!
      let type: ItemType;
      if (i < 5) {
        type = ItemType.RARE_ITEM; // 5 редких предметов (по 50 XP каждый!)
      } else if (i < 8) {
        type = ItemType.POTION; // 3 зелья здоровья
      } else if (i < 10) {
        type = ItemType.STAMINA_POTION; // 2 зелья стамины
      } else {
        type = ItemType.COIN; // Остальное - монеты
      }

      items.push({
        id: `treasure_${timestamp}_${i}`,
        type,
        position,
        collected: false,
        spawnTime: timestamp,
      });
    }

    console.log(`[ItemSpawner] Создано ${items.length} предметов в сокровищнице`);
    return items;
  }

  /**
   * Сгенерировать предметы на обычном полу
   */
  private spawnItemsOnFloor(
    type: ItemType, 
    count: number, 
    idPrefix: string,
    usedPositions: Set<string>
  ): GameItem[] {
    const items: GameItem[] = [];

    for (let i = 0; i < count; i++) {
      const position = this.getRandomFloorPosition(usedPositions);
      if (!position) break;

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
   * Получить случайную позицию на обычном полу
   */
  private getRandomFloorPosition(usedPositions: Set<string>): Position | null {
    const floorPositions: Position[] = [];
    
    // Собираем позиции обычного пола (не FLOOR_LIGHT)
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const tile = this.map.tiles[y]?.[x];
        if (tile && tile.type === TileType.FLOOR) {
          floorPositions.push({
            x: x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
            y: y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
          });
        }
      }
    }

    this.shuffleArray(floorPositions);

    for (const position of floorPositions) {
      const positionKey = `${position.x}_${position.y}`;
      if (!usedPositions.has(positionKey)) {
        return position;
      }
    }

    return null;
  }

  /**
   * Перемешать массив (Fisher-Yates)
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
