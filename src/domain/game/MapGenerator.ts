/**
 * Генератор карты для DOOM-style игры
 * Создает уровни с комнатами, коридорами, дверями и выходом
 */

import type { Position, Tile, GameMap } from "@/types/pixel-art-game.types";
import { TileType } from "@/types/pixel-art-game.types";
import { GAME_CONFIG, getMapSizeForLevel } from "@/utils/pixel-art-constants";

type RoomType = "normal" | "shop" | "treasure";

interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  connected: boolean;
  roomType: RoomType;
}

/**
 * Класс для генерации карты
 */
export class MapGenerator {
  private readonly width: number;
  private readonly height: number;
  private readonly mapLevel: number;
  private tiles: TileType[][];
  private rooms: Room[] = [];
  private exitPosition: Position | null = null;

  constructor(mapLevel: number = 1) {
    this.mapLevel = mapLevel;
    const size = getMapSizeForLevel(mapLevel);
    this.width = size.width;
    this.height = size.height;
    this.tiles = [];
  }

  /**
   * Генерировать карту
   */
  generateMap(): GameMap {
    // Инициализация карты стенами
    this.tiles = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(TileType.WALL));

    // Генерация комнат
    this.generateRooms();

    // Добавляем специальные комнаты
    this.addShopRoom();
    this.addTreasureRoom();

    // Соединение комнат коридорами (БЕЗ дверей)
    this.connectRooms();

    // Добавление выхода (лестницы на следующий уровень) - ДО препятствий!
    this.addExit();

    // Добавление препятствий в комнатах (после выхода, чтобы не затереть)
    this.addObstacles();

    // Теперь ставим двери - ПОСЛЕ прокладки всех коридоров
    this.placeDoors();

    // Добавляем терминал в торговую комнату
    this.addTerminal();

    // Преобразование в формат Tile
    const tilesWithPositions = this.tiles.map((row, y) =>
      row.map(
        (type, x): Tile => ({
          type,
          position: { x, y },
        })
      )
    );

    return {
      width: this.width,
      height: this.height,
      tiles: tilesWithPositions,
    };
  }

  /**
   * Генерация комнат
   */
  private generateRooms(): void {
    const minRoomSize = 5;
    const maxRoomSize = Math.min(9, Math.floor(this.width / 4));
    // Больше комнат на больших уровнях
    const roomCount = Math.max(4, Math.floor((this.width * this.height) / 80));

    for (let attempts = 0; attempts < roomCount * 10; attempts++) {
      if (this.rooms.length >= roomCount) break;

      const roomWidth = this.randomInt(minRoomSize, maxRoomSize);
      const roomHeight = this.randomInt(minRoomSize, maxRoomSize);
      const roomX = this.randomInt(2, this.width - roomWidth - 2);
      const roomY = this.randomInt(2, this.height - roomHeight - 2);

      const newRoom: Room = {
        x: roomX,
        y: roomY,
        width: roomWidth,
        height: roomHeight,
        centerX: Math.floor(roomX + roomWidth / 2),
        centerY: Math.floor(roomY + roomHeight / 2),
        connected: false,
        roomType: "normal",
      };

      let overlaps = false;
      for (const room of this.rooms) {
        if (this.roomsOverlap(newRoom, room)) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        this.carveRoom(newRoom);
        this.rooms.push(newRoom);
      }
    }

    // Гарантируем хотя бы 2 комнаты
    if (this.rooms.length < 2) {
      // Стартовая комната в левом верхнем углу
      const startRoom: Room = {
        x: 3,
        y: 3,
        width: 6,
        height: 6,
        centerX: 6,
        centerY: 6,
        connected: false,
        roomType: "normal",
      };
      this.carveRoom(startRoom);
      this.rooms.push(startRoom);

      // Комната выхода в правом нижнем углу
      const exitRoom: Room = {
        x: this.width - 9,
        y: this.height - 9,
        width: 6,
        height: 6,
        centerX: this.width - 6,
        centerY: this.height - 6,
        connected: false,
        roomType: "normal",
      };
      this.carveRoom(exitRoom);
      this.rooms.push(exitRoom);
    }
  }

  /**
   * Добавить торговую комнату
   */
  private addShopRoom(): void {
    if (this.rooms.length < 3) return;

    // Выбираем случайную комнату (не первую и не последнюю)
    const shopIndex = this.randomInt(1, Math.max(1, this.rooms.length - 2));
    const shopRoom = this.rooms[shopIndex];
    shopRoom.roomType = "shop";
    // Пол остаётся обычным - FLOOR_LIGHT только для сокровищницы!
  }

  /**
   * Добавить комнату-сокровищницу
   */
  private addTreasureRoom(): void {
    // Сокровищница ГАРАНТИРОВАННО появляется на уровнях 2+
    if (this.mapLevel < 2) return;
    if (this.rooms.length < 2) return;

    // Размер сокровищницы (не слишком большой чтобы легче разместить)
    const treasureWidth = 5;
    const treasureHeight = 5;

    // Много попыток чтобы гарантированно найти место
    for (let attempts = 0; attempts < 200; attempts++) {
      const x = this.randomInt(3, this.width - treasureWidth - 3);
      const y = this.randomInt(3, this.height - treasureHeight - 3);

      const treasureRoom: Room = {
        x,
        y,
        width: treasureWidth,
        height: treasureHeight,
        centerX: Math.floor(x + treasureWidth / 2),
        centerY: Math.floor(y + treasureHeight / 2),
        connected: false,
        roomType: "treasure",
      };

      // Проверяем пересечение с меньшим margin
      let overlaps = false;
      for (const room of this.rooms) {
        if (this.roomsOverlapWithMargin(treasureRoom, room, 2)) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        this.carveRoom(treasureRoom);
        this.rooms.push(treasureRoom);

        // Делаем пол особенным (светящимся)
        for (let ry = treasureRoom.y; ry < treasureRoom.y + treasureRoom.height; ry++) {
          for (let rx = treasureRoom.x; rx < treasureRoom.x + treasureRoom.width; rx++) {
            if (this.tiles[ry]?.[rx] === TileType.FLOOR) {
              this.tiles[ry][rx] = TileType.FLOOR_LIGHT;
            }
          }
        }

        console.log(
          `[MapGen] ✅ Сокровищница создана на уровне ${this.mapLevel} в позиции (${x}, ${y})`
        );
        return; // Успешно создана
      }
    }

    console.log(`[MapGen] ⚠️ Не удалось создать сокровищницу на уровне ${this.mapLevel}`);
  }

  /**
   * Проверка пересечения с настраиваемым отступом
   */
  private roomsOverlapWithMargin(roomA: Room, roomB: Room, margin: number): boolean {
    return (
      roomA.x - margin < roomB.x + roomB.width &&
      roomA.x + roomA.width + margin > roomB.x &&
      roomA.y - margin < roomB.y + roomB.height &&
      roomA.y + roomA.height + margin > roomB.y
    );
  }

  /**
   * Добавить терминал в торговую комнату
   */
  private addTerminal(): void {
    const shopRoom = this.rooms.find((r) => r.roomType === "shop");
    if (!shopRoom) return;

    // Ставим терминал в центре комнаты
    const terminalX = shopRoom.centerX;
    const terminalY = shopRoom.centerY;

    if (this.tiles[terminalY]?.[terminalX]) {
      this.tiles[terminalY][terminalX] = TileType.TERMINAL;
    }
  }

  /**
   * Проверка пересечения комнат
   */
  private roomsOverlap(roomA: Room, roomB: Room): boolean {
    const margin = 3; // Минимальное расстояние между комнатами для коридоров
    return (
      roomA.x - margin < roomB.x + roomB.width &&
      roomA.x + roomA.width + margin > roomB.x &&
      roomA.y - margin < roomB.y + roomB.height &&
      roomA.y + roomA.height + margin > roomB.y
    );
  }

  /**
   * Вырезание комнаты
   */
  private carveRoom(room: Room): void {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        if (x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1) {
          this.tiles[y][x] = TileType.FLOOR;
        }
      }
    }
  }

  /**
   * Соединение комнат простыми коридорами (без дверей)
   */
  private connectRooms(): void {
    if (this.rooms.length < 2) return;

    // Сортируем комнаты по расстоянию от начала
    const sortedRooms = [...this.rooms].sort(
      (a, b) => a.centerX + a.centerY - (b.centerX + b.centerY)
    );

    // Помечаем первую комнату как соединённую
    sortedRooms[0].connected = true;

    // Соединяем последовательно
    for (let i = 1; i < sortedRooms.length; i++) {
      const roomA = sortedRooms[i - 1];
      const roomB = sortedRooms[i];
      this.carveCorridor(roomA.centerX, roomA.centerY, roomB.centerX, roomB.centerY);
      roomB.connected = true;
    }

    // Гарантируем соединение сокровищницы
    const treasureRoom = this.rooms.find((r) => r.roomType === "treasure");
    if (treasureRoom) {
      const normalRooms = this.rooms.filter((r) => r.roomType === "normal");
      if (normalRooms.length > 0) {
        let nearestRoom = normalRooms[0];
        let minDist = Infinity;
        for (const room of normalRooms) {
          const dist =
            Math.abs(room.centerX - treasureRoom.centerX) +
            Math.abs(room.centerY - treasureRoom.centerY);
          if (dist < minDist) {
            minDist = dist;
            nearestRoom = room;
          }
        }
        this.carveCorridor(
          nearestRoom.centerX,
          nearestRoom.centerY,
          treasureRoom.centerX,
          treasureRoom.centerY
        );
        console.log(`[MapGen] Сокровищница соединена с комнатой`);
      }
    }

    // Добавляем несколько случайных соединений
    const extraConnections = Math.max(1, Math.floor(this.rooms.length / 4));
    for (let i = 0; i < extraConnections; i++) {
      const roomA = this.rooms[this.randomInt(0, this.rooms.length - 1)];
      const roomB = this.rooms[this.randomInt(0, this.rooms.length - 1)];
      if (roomA !== roomB) {
        this.carveCorridor(roomA.centerX, roomA.centerY, roomB.centerX, roomB.centerY);
      }
    }
  }

  /**
   * Прокладка простого L-образного коридора
   */
  private carveCorridor(x1: number, y1: number, x2: number, y2: number): void {
    let x = x1;
    let y = y1;

    // Сначала горизонтально
    while (x !== x2) {
      if (x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1) {
        if (this.tiles[y][x] === TileType.WALL) {
          this.tiles[y][x] = TileType.FLOOR;
        }
      }
      x += x < x2 ? 1 : -1;
    }

    // Затем вертикально
    while (y !== y2) {
      if (x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1) {
        if (this.tiles[y][x] === TileType.WALL) {
          this.tiles[y][x] = TileType.FLOOR;
        }
      }
      y += y < y2 ? 1 : -1;
    }
  }

  /**
   * Размещение всех дверей после создания коридоров
   * Простая и надёжная логика
   */
  private placeDoors(): void {
    // Проходим по всей карте и ищем узкие проходы
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        // Пропускаем если не пол
        if (
          this.tiles[y][x] !== TileType.FLOOR &&
          this.tiles[y][x] !== TileType.FLOOR_LIGHT
        )
          continue;

        // Проверяем горизонтальный проход (стены сверху/снизу, пол слева/справа)
        const isHorizontalPassage =
          this.tiles[y - 1][x] === TileType.WALL &&
          this.tiles[y + 1][x] === TileType.WALL &&
          this.isPassable(x - 1, y) &&
          this.isPassable(x + 1, y);

        // Проверяем вертикальный проход (стены слева/справа, пол сверху/снизу)
        const isVerticalPassage =
          this.tiles[y][x - 1] === TileType.WALL &&
          this.tiles[y][x + 1] === TileType.WALL &&
          this.isPassable(x, y - 1) &&
          this.isPassable(x, y + 1);

        if (isHorizontalPassage || isVerticalPassage) {
          this.tiles[y][x] = TileType.DOOR;
        }
      }
    }

    // Теперь объединяем соседние двери в широкие
    this.upgradeToWideDoors();

    // Заменяем двери у сокровищницы на TREASURE_DOOR
    const treasureRoom = this.rooms.find((r) => r.roomType === "treasure");
    if (treasureRoom) {
      this.replaceTreasureRoomDoors(treasureRoom);
    }
  }

  /**
   * Проверить, можно ли пройти через тайл
   */
  private isPassable(x: number, y: number): boolean {
    const tile = this.tiles[y]?.[x];
    return (
      tile === TileType.FLOOR ||
      tile === TileType.FLOOR_LIGHT ||
      tile === TileType.DOOR ||
      tile === TileType.DOOR_WIDE ||
      tile === TileType.DOOR_OPEN ||
      tile === TileType.DOOR_WIDE_OPEN ||
      tile === TileType.EXIT
    );
  }

  /**
   * Объединение соседних дверей в широкие
   */
  private upgradeToWideDoors(): void {
    // Сначала ищем горизонтальные группы дверей
    for (let y = 1; y < this.height - 1; y++) {
      let doorStart = -1;
      for (let x = 1; x <= this.width - 1; x++) {
        const isDoor = this.tiles[y]?.[x] === TileType.DOOR;

        if (isDoor && doorStart === -1) {
          doorStart = x;
        }

        if ((!isDoor || x === this.width - 1) && doorStart !== -1) {
          const doorEnd = isDoor ? x : x - 1;
          const doorWidth = doorEnd - doorStart + 1;

          // Если 2+ двери подряд, делаем их широкими
          if (doorWidth >= 2) {
            for (let dx = doorStart; dx <= doorEnd; dx++) {
              this.tiles[y][dx] = TileType.DOOR_WIDE;
            }
            console.log(
              `[MapGen] Широкая горизонтальная дверь (${doorWidth} тайлов) в (${doorStart}, ${y})`
            );
          }

          doorStart = -1;
        }
      }
    }

    // Затем ищем вертикальные группы дверей
    for (let x = 1; x < this.width - 1; x++) {
      let doorStart = -1;
      for (let y = 1; y <= this.height - 1; y++) {
        const isDoor = this.tiles[y]?.[x] === TileType.DOOR;

        if (isDoor && doorStart === -1) {
          doorStart = y;
        }

        if ((!isDoor || y === this.height - 1) && doorStart !== -1) {
          const doorEnd = isDoor ? y : y - 1;
          const doorHeight = doorEnd - doorStart + 1;

          // Если 2+ двери подряд, делаем их широкими
          if (doorHeight >= 2) {
            for (let dy = doorStart; dy <= doorEnd; dy++) {
              this.tiles[dy][x] = TileType.DOOR_WIDE;
            }
            console.log(
              `[MapGen] Широкая вертикальная дверь (${doorHeight} тайлов) в (${x}, ${doorStart})`
            );
          }

          doorStart = -1;
        }
      }
    }
  }

  /**
   * Заменить двери сокровищницы на TREASURE_DOOR
   */
  private replaceTreasureRoomDoors(room: Room): void {
    const doorTypes = [TileType.DOOR, TileType.DOOR_WIDE];
    const passableTypes = [TileType.FLOOR, TileType.FLOOR_LIGHT];
    let doorPlaced = false;

    // Проверяем все 4 границы комнаты
    const checkAndReplace = (x: number, y: number) => {
      const tile = this.tiles[y]?.[x];
      if (doorTypes.includes(tile) || passableTypes.includes(tile)) {
        this.tiles[y][x] = TileType.TREASURE_DOOR;
        doorPlaced = true;
      }
    };

    // Верхняя граница
    for (let x = room.x; x < room.x + room.width; x++) {
      checkAndReplace(x, room.y - 1);
    }
    // Нижняя граница
    for (let x = room.x; x < room.x + room.width; x++) {
      checkAndReplace(x, room.y + room.height);
    }
    // Левая граница
    for (let y = room.y; y < room.y + room.height; y++) {
      checkAndReplace(room.x - 1, y);
    }
    // Правая граница
    for (let y = room.y; y < room.y + room.height; y++) {
      checkAndReplace(room.x + room.width, y);
    }

    if (doorPlaced) {
      console.log(`[MapGen] TREASURE_DOOR установлена для сокровищницы`);
    } else {
      console.log(`[MapGen] ВНИМАНИЕ: Не найден проход к сокровищнице!`);
    }
  }

  /**
   * Добавление препятствий
   */
  private addObstacles(): void {
    for (const room of this.rooms) {
      // Количество препятствий зависит от размера комнаты
      const obstacleCount = Math.floor((room.width * room.height) / 25);

      for (let i = 0; i < obstacleCount; i++) {
        const x = this.randomInt(room.x + 1, room.x + room.width - 2);
        const y = this.randomInt(room.y + 1, room.y + room.height - 2);

        // Не ставим препятствия слишком близко к центру
        const distFromCenter = Math.abs(x - room.centerX) + Math.abs(y - room.centerY);
        if (distFromCenter > 2 && this.tiles[y][x] === TileType.FLOOR) {
          this.tiles[y][x] = TileType.OBSTACLE;
        }
      }
    }
  }

  /**
   * Добавление выхода на следующий уровень
   */
  private addExit(): void {
    if (this.rooms.length === 0) return;

    // Ищем комнату для выхода (самая дальняя обычная комната)
    const normalRooms = this.rooms.filter((r) => r.roomType === "normal");
    if (normalRooms.length === 0) return;

    const sortedByDistance = [...normalRooms].sort(
      (a, b) => b.centerX + b.centerY - (a.centerX + a.centerY)
    );

    const exitRoom = sortedByDistance[0];

    // Ищем свободный тайл в комнате для выхода
    let exitPlaced = false;

    // Сначала пробуем центр
    if (this.tiles[exitRoom.centerY]?.[exitRoom.centerX] === TileType.FLOOR) {
      this.tiles[exitRoom.centerY][exitRoom.centerX] = TileType.EXIT;
      this.exitPosition = { x: exitRoom.centerX, y: exitRoom.centerY };
      exitPlaced = true;
    } else {
      // Ищем любой свободный пол в комнате
      for (let y = exitRoom.y; y < exitRoom.y + exitRoom.height && !exitPlaced; y++) {
        for (let x = exitRoom.x; x < exitRoom.x + exitRoom.width && !exitPlaced; x++) {
          if (this.tiles[y]?.[x] === TileType.FLOOR) {
            this.tiles[y][x] = TileType.EXIT;
            this.exitPosition = { x, y };
            exitPlaced = true;
            console.log(`[MapGen] EXIT размещён в (${x}, ${y}) вместо центра`);
          }
        }
      }
    }

    if (!exitPlaced) {
      console.log(`[MapGen] ⚠️ Не удалось разместить EXIT!`);
    }
  }

  /**
   * Случайное целое число в диапазоне
   */
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Валидация карты
   */
  validateMap(map: GameMap): boolean {
    if (map.width !== this.width || map.height !== this.height) {
      return false;
    }

    if (map.tiles.length !== this.height) {
      return false;
    }

    for (let y = 0; y < this.height; y++) {
      if (map.tiles[y].length !== this.width) {
        return false;
      }
    }

    // Проверяем наличие пола и выхода
    let hasFloor = false;
    let hasExit = false;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const type = map.tiles[y][x].type;
        if (type === TileType.FLOOR) hasFloor = true;
        if (type === TileType.EXIT) hasExit = true;
      }
    }

    return hasFloor && hasExit;
  }

  /**
   * Получить случайную позицию на полу (в пикселях)
   */
  getRandomFloorPosition(map: GameMap): Position | null {
    const floorPositions: Position[] = [];

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (map.tiles[y][x].type === TileType.FLOOR) {
          floorPositions.push({
            x: x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
            y: y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
          });
        }
      }
    }

    if (floorPositions.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * floorPositions.length);
    return floorPositions[randomIndex] || null;
  }

  /**
   * Получить позицию выхода (в пикселях)
   */
  getExitPosition(): Position | null {
    if (!this.exitPosition) return null;
    return {
      x: this.exitPosition.x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
      y: this.exitPosition.y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
    };
  }

  /**
   * Получить комнаты
   */
  getRooms(): Room[] {
    return [...this.rooms];
  }

  /**
   * Получить уровень карты
   */
  getMapLevel(): number {
    return this.mapLevel;
  }
}
