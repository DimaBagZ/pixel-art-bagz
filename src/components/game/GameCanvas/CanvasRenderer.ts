/**
 * DOOM-style рендерер для Canvas
 * Вид сверху с освещением и текстурами
 */

import type {
  GameState,
  Position,
  GameItem,
  PlayerState,
} from "@/types/pixel-art-game.types";
import { TileType, ItemType } from "@/types/pixel-art-game.types";
import { GAME_CONFIG } from "@/utils/pixel-art-constants";

// Цвета в стиле DOOM/Fallout
const COLORS = {
  // Тайлы
  floor: {
    base: "#2a2a2a",
    pattern: "#252525",
    accent: "#333333",
  },
  wall: {
    base: "#1a1a1a",
    top: "#3d3d3d",
    shadow: "#0a0a0a",
    highlight: "#4a4a4a",
  },
  obstacle: {
    base: "#4a3520",
    top: "#5c4428",
    shadow: "#2d1f12",
  },
  door: {
    closed: "#8b4513", // Коричневый
    frame: "#5c3a21",
    handle: "#ffd700",
    open: "#2a2a2a",
    openFrame: "#3a3a3a",
  },
  exit: {
    base: "#1a4a1a", // Тёмно-зелёный
    glow: "#00ff00", // Ярко-зелёный
    arrow: "#00ff66",
    outline: "#003300",
  },
  // Широкая дверь (sci-fi)
  doorWide: {
    frame: "#2a4a6a", // Металлический синий
    panel: "#1a3a5a",
    light: "#00aaff", // Голубое свечение
    lightGlow: "rgba(0, 170, 255, 0.5)",
    open: "#0a2030",
  },
  // Торговый терминал
  terminal: {
    base: "#1a3a2a",
    screen: "#00ff88",
    screenGlow: "rgba(0, 255, 136, 0.6)",
    frame: "#2a4a3a",
  },
  // Освещённый пол
  floorLight: {
    base: "#3a3a3a",
    pattern: "#353535",
    glow: "rgba(255, 255, 200, 0.1)",
  },
  // Дверь сокровищницы
  treasureDoor: {
    frame: "#4a3a1a",
    panel: "#6a5a2a",
    glow: "#ffaa00",
    glowColor: "rgba(255, 170, 0, 0.6)",
    lock: "#ff4400",
  },
  // Игрок
  player: {
    body: "#daa520", // Золотой (Fallout style)
    armor: "#8b7355", // Броня
    visor: "#00ff41", // Зелёный визор как в Fallout
    shadow: "rgba(0, 0, 0, 0.4)",
  },
  // Предметы
  items: {
    coin: {
      primary: "#ffd700",
      secondary: "#ffaa00",
      glow: "rgba(255, 215, 0, 0.5)",
    },
    potion: {
      primary: "#ff3333",
      secondary: "#aa0000",
      glow: "rgba(255, 0, 0, 0.4)",
    },
    staminaPotion: {
      primary: "#00ff66",
      secondary: "#00aa44",
      glow: "rgba(0, 255, 100, 0.5)",
    },
    rare: {
      primary: "#9966ff",
      secondary: "#6633cc",
      glow: "rgba(153, 102, 255, 0.5)",
    },
  },
  // Освещение
  light: {
    player: "rgba(255, 200, 100, 0.15)",
    ambient: "rgba(0, 0, 0, 0.6)",
  },
  // Фон
  background: "#0a0a0a",
};

/**
 * DOOM-style рендерер
 */
export class CanvasRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly tileSize: number;
  private cameraOffset: Position;
  private animationTime: number = 0;

  constructor(ctx: CanvasRenderingContext2D, tileSize: number = GAME_CONFIG.TILE_SIZE) {
    this.ctx = ctx;
    this.tileSize = tileSize;
    this.cameraOffset = { x: 0, y: 0 };
  }

  /**
   * Установить смещение камеры
   */
  setCameraOffset(offset: Position): void {
    this.cameraOffset = offset;
  }

  /**
   * Очистить Canvas
   */
  clear(width: number, height: number): void {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, width, height);
  }

  /**
   * Рендеринг всей игры
   */
  render(gameState: GameState, canvasWidth: number, canvasHeight: number): void {
    this.animationTime += 0.016; // ~60fps

    // Очистка
    this.clear(canvasWidth, canvasHeight);

    // Расчет видимой области (с учётом реальных размеров карты)
    const visibleTiles = this.calculateVisibleTiles(
      canvasWidth,
      canvasHeight,
      gameState.map.width,
      gameState.map.height
    );

    // Рендеринг карты с 3D эффектом
    this.renderMap3D(gameState.map, visibleTiles);

    // Рендеринг предметов с анимацией
    this.renderItems(gameState.items, visibleTiles);

    // Рендеринг персонажа (DOOM-style)
    this.renderPlayer(gameState.player);

    // Эффект освещения от игрока
    this.renderLighting(gameState.player, canvasWidth, canvasHeight);

    // Эффект виньетки
    this.renderVignette(canvasWidth, canvasHeight);
  }

  /**
   * Расчет видимой области тайлов
   */
  private calculateVisibleTiles(
    canvasWidth: number,
    canvasHeight: number,
    mapWidth: number,
    mapHeight: number
  ): {
    startX: number;
    endX: number;
    startY: number;
    endY: number;
  } {
    const startX = Math.max(0, Math.floor(-this.cameraOffset.x / this.tileSize) - 2);
    const endX = Math.min(
      mapWidth,
      Math.ceil((canvasWidth - this.cameraOffset.x) / this.tileSize) + 2
    );
    const startY = Math.max(0, Math.floor(-this.cameraOffset.y / this.tileSize) - 2);
    const endY = Math.min(
      mapHeight,
      Math.ceil((canvasHeight - this.cameraOffset.y) / this.tileSize) + 2
    );

    return { startX, endX, startY, endY };
  }

  /**
   * 3D рендеринг карты
   */
  private renderMap3D(
    map: GameState["map"],
    visibleTiles: { startX: number; endX: number; startY: number; endY: number }
  ): void {
    // Сначала рисуем пол (включая под дверями, выходом, терминалом)
    for (let y = visibleTiles.startY; y < visibleTiles.endY; y++) {
      for (let x = visibleTiles.startX; x < visibleTiles.endX; x++) {
        if (y >= 0 && y < map.tiles.length && x >= 0 && x < map.tiles[y].length) {
          const tile = map.tiles[y][x];
          // Рисуем пол для проходимых тайлов
          if (tile.type === TileType.FLOOR) {
            this.renderFloor(x, y);
          } else if (tile.type === TileType.FLOOR_LIGHT) {
            this.renderFloorLight(x, y);
          } else if (
            tile.type === TileType.DOOR_OPEN ||
            tile.type === TileType.DOOR_WIDE_OPEN ||
            tile.type === TileType.TREASURE_DOOR_OPEN ||
            tile.type === TileType.EXIT ||
            tile.type === TileType.TERMINAL
          ) {
            this.renderFloorLight(x, y);
          }
        }
      }
    }

    // Потом стены и препятствия (с 3D эффектом)
    for (let y = visibleTiles.startY; y < visibleTiles.endY; y++) {
      for (let x = visibleTiles.startX; x < visibleTiles.endX; x++) {
        if (y >= 0 && y < map.tiles.length && x >= 0 && x < map.tiles[y].length) {
          const tile = map.tiles[y][x];
          switch (tile.type) {
            case TileType.WALL:
              this.renderWall3D(x, y);
              break;
            case TileType.OBSTACLE:
              this.renderObstacle3D(x, y);
              break;
            case TileType.DOOR:
              this.renderDoor(x, y, false);
              break;
            case TileType.DOOR_OPEN:
              this.renderDoor(x, y, true);
              break;
            case TileType.DOOR_WIDE:
              this.renderWideDoor(x, y, false);
              break;
            case TileType.DOOR_WIDE_OPEN:
              this.renderWideDoor(x, y, true);
              break;
            case TileType.EXIT:
              this.renderExit(x, y);
              break;
            case TileType.TERMINAL:
              this.renderTerminal(x, y);
              break;
            case TileType.TREASURE_DOOR:
              this.renderTreasureDoor(x, y, false);
              break;
            case TileType.TREASURE_DOOR_OPEN:
              this.renderTreasureDoor(x, y, true);
              break;
          }
        }
      }
    }
  }

  /**
   * Рендеринг пола с текстурой
   */
  private renderFloor(x: number, y: number): void {
    const screenX = x * this.tileSize + this.cameraOffset.x;
    const screenY = y * this.tileSize + this.cameraOffset.y;

    // Базовый цвет пола
    this.ctx.fillStyle = COLORS.floor.base;
    this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

    // Паттерн пола (шахматная текстура)
    if ((x + y) % 2 === 0) {
      this.ctx.fillStyle = COLORS.floor.pattern;
      this.ctx.fillRect(screenX + 2, screenY + 2, this.tileSize - 4, this.tileSize - 4);
    }

    // Декоративные детали (царапины, потёртости)
    this.ctx.strokeStyle = COLORS.floor.accent;
    this.ctx.lineWidth = 1;

    // Случайные линии на основе позиции
    const seed = (x * 7 + y * 13) % 5;
    if (seed === 0) {
      this.ctx.beginPath();
      this.ctx.moveTo(screenX + 8, screenY + 12);
      this.ctx.lineTo(screenX + this.tileSize - 8, screenY + this.tileSize - 12);
      this.ctx.stroke();
    }
  }

  /**
   * Рендеринг освещённого пола (для торговой комнаты)
   */
  private renderFloorLight(x: number, y: number): void {
    const screenX = x * this.tileSize + this.cameraOffset.x;
    const screenY = y * this.tileSize + this.cameraOffset.y;

    // Светлый базовый цвет
    this.ctx.fillStyle = COLORS.floorLight.base;
    this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

    // Паттерн
    if ((x + y) % 2 === 0) {
      this.ctx.fillStyle = COLORS.floorLight.pattern;
      this.ctx.fillRect(screenX + 2, screenY + 2, this.tileSize - 4, this.tileSize - 4);
    }

    // Лёгкое свечение
    this.ctx.fillStyle = COLORS.floorLight.glow;
    this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
  }

  /**
   * Рендеринг широкой двери (sci-fi стиль)
   */
  private renderWideDoor(x: number, y: number, isOpen: boolean): void {
    const screenX = x * this.tileSize + this.cameraOffset.x;
    const screenY = y * this.tileSize + this.cameraOffset.y;
    const pulse = Math.sin(this.animationTime * 2) * 0.3 + 0.7;

    if (isOpen) {
      // Открытая дверь - тёмный проход со свечением по краям
      this.ctx.fillStyle = COLORS.doorWide.open;
      this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

      // Светящиеся полосы по краям
      this.ctx.fillStyle = `rgba(0, 170, 255, ${0.3 * pulse})`;
      this.ctx.fillRect(screenX, screenY, 3, this.tileSize);
      this.ctx.fillRect(screenX + this.tileSize - 3, screenY, 3, this.tileSize);
    } else {
      // Закрытая дверь - металлическая панель
      // Рамка
      this.ctx.fillStyle = COLORS.doorWide.frame;
      this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

      // Центральная панель
      this.ctx.fillStyle = COLORS.doorWide.panel;
      this.ctx.fillRect(screenX + 4, screenY + 4, this.tileSize - 8, this.tileSize - 8);

      // Горизонтальные линии (панели)
      this.ctx.strokeStyle = COLORS.doorWide.frame;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX + 6, screenY + this.tileSize / 3);
      this.ctx.lineTo(screenX + this.tileSize - 6, screenY + this.tileSize / 3);
      this.ctx.moveTo(screenX + 6, screenY + (this.tileSize * 2) / 3);
      this.ctx.lineTo(screenX + this.tileSize - 6, screenY + (this.tileSize * 2) / 3);
      this.ctx.stroke();

      // Светящийся индикатор
      const lightX = screenX + this.tileSize / 2;
      const lightY = screenY + this.tileSize / 2;

      const gradient = this.ctx.createRadialGradient(
        lightX,
        lightY,
        0,
        lightX,
        lightY,
        8
      );
      gradient.addColorStop(0, COLORS.doorWide.light);
      gradient.addColorStop(1, "transparent");
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(lightX, lightY, 8, 0, Math.PI * 2);
      this.ctx.fill();

      // Пульсирующее свечение
      this.ctx.fillStyle = `rgba(0, 170, 255, ${0.2 * pulse})`;
      this.ctx.beginPath();
      this.ctx.arc(lightX, lightY, 12, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * Рендеринг торгового терминала
   */
  private renderTerminal(x: number, y: number): void {
    const screenX = x * this.tileSize + this.cameraOffset.x;
    const screenY = y * this.tileSize + this.cameraOffset.y;
    const pulse = Math.sin(this.animationTime * 3) * 0.2 + 0.8;

    // Основание терминала
    this.ctx.fillStyle = COLORS.terminal.base;
    this.ctx.fillRect(screenX + 4, screenY + this.tileSize - 12, this.tileSize - 8, 12);

    // Корпус терминала
    this.ctx.fillStyle = COLORS.terminal.frame;
    this.ctx.fillRect(screenX + 8, screenY + 4, this.tileSize - 16, this.tileSize - 16);

    // Экран
    this.ctx.fillStyle = `rgba(0, 255, 136, ${0.7 * pulse})`;
    this.ctx.fillRect(screenX + 12, screenY + 8, this.tileSize - 24, this.tileSize - 24);

    // Свечение экрана
    const gradient = this.ctx.createRadialGradient(
      screenX + this.tileSize / 2,
      screenY + this.tileSize / 2,
      0,
      screenX + this.tileSize / 2,
      screenY + this.tileSize / 2,
      this.tileSize * 0.8
    );
    gradient.addColorStop(0, `rgba(0, 255, 136, ${0.3 * pulse})`);
    gradient.addColorStop(1, "transparent");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(screenX - 10, screenY - 10, this.tileSize + 20, this.tileSize + 20);

    // Текст на экране (мигающий курсор)
    if (Math.floor(this.animationTime * 2) % 2 === 0) {
      this.ctx.fillStyle = "#003322";
      this.ctx.fillRect(screenX + 16, screenY + 14, 4, 8);
    }
  }

  /**
   * Рендеринг двери сокровищницы
   */
  private renderTreasureDoor(x: number, y: number, isOpen: boolean): void {
    const screenX = x * this.tileSize + this.cameraOffset.x;
    const screenY = y * this.tileSize + this.cameraOffset.y;
    const pulse = Math.sin(this.animationTime * 2) * 0.3 + 0.7;

    if (isOpen) {
      // Открытая дверь - золотистый проход
      this.ctx.fillStyle = "#2a2a1a";
      this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

      // Золотая рамка
      this.ctx.strokeStyle = COLORS.treasureDoor.glow;
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(screenX + 2, screenY + 2, this.tileSize - 4, this.tileSize - 4);
    } else {
      // Закрытая дверь - золотисто-бронзовая с замком
      // Рамка
      this.ctx.fillStyle = COLORS.treasureDoor.frame;
      this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

      // Панель
      this.ctx.fillStyle = COLORS.treasureDoor.panel;
      this.ctx.fillRect(screenX + 4, screenY + 4, this.tileSize - 8, this.tileSize - 8);

      // Узор (крест)
      this.ctx.strokeStyle = COLORS.treasureDoor.frame;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX + this.tileSize / 2, screenY + 8);
      this.ctx.lineTo(screenX + this.tileSize / 2, screenY + this.tileSize - 8);
      this.ctx.moveTo(screenX + 8, screenY + this.tileSize / 2);
      this.ctx.lineTo(screenX + this.tileSize - 8, screenY + this.tileSize / 2);
      this.ctx.stroke();

      // Красный замок (пульсирующий)
      const lockX = screenX + this.tileSize / 2;
      const lockY = screenY + this.tileSize / 2;

      this.ctx.fillStyle = `rgba(255, 68, 0, ${0.8 * pulse})`;
      this.ctx.beginPath();
      this.ctx.arc(lockX, lockY, 6, 0, Math.PI * 2);
      this.ctx.fill();

      // Свечение замка
      const gradient = this.ctx.createRadialGradient(lockX, lockY, 0, lockX, lockY, 15);
      gradient.addColorStop(0, `rgba(255, 68, 0, ${0.4 * pulse})`);
      gradient.addColorStop(1, "transparent");
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(lockX, lockY, 15, 0, Math.PI * 2);
      this.ctx.fill();

      // Иконка "?" в замке
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 10px monospace";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText("?", lockX, lockY + 1);
    }
  }

  /**
   * 3D рендеринг стены
   */
  private renderWall3D(x: number, y: number): void {
    const screenX = x * this.tileSize + this.cameraOffset.x;
    const screenY = y * this.tileSize + this.cameraOffset.y;
    const wallHeight = 12; // Высота 3D эффекта

    // Тень под стеной
    this.ctx.fillStyle = COLORS.wall.shadow;
    this.ctx.fillRect(
      screenX + 4,
      screenY + wallHeight + 4,
      this.tileSize,
      this.tileSize
    );

    // Боковая сторона стены (слева)
    this.ctx.fillStyle = COLORS.wall.base;
    this.ctx.beginPath();
    this.ctx.moveTo(screenX, screenY + wallHeight);
    this.ctx.lineTo(screenX, screenY + this.tileSize + wallHeight);
    this.ctx.lineTo(screenX + 4, screenY + this.tileSize);
    this.ctx.lineTo(screenX + 4, screenY);
    this.ctx.closePath();
    this.ctx.fill();

    // Боковая сторона стены (снизу)
    this.ctx.beginPath();
    this.ctx.moveTo(screenX, screenY + this.tileSize + wallHeight);
    this.ctx.lineTo(screenX + this.tileSize, screenY + this.tileSize + wallHeight);
    this.ctx.lineTo(screenX + this.tileSize + 4, screenY + this.tileSize);
    this.ctx.lineTo(screenX + 4, screenY + this.tileSize);
    this.ctx.closePath();
    this.ctx.fill();

    // Верхняя поверхность стены
    this.ctx.fillStyle = COLORS.wall.top;
    this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

    // Блики на стене
    this.ctx.fillStyle = COLORS.wall.highlight;
    this.ctx.fillRect(screenX + 2, screenY + 2, this.tileSize - 4, 4);
    this.ctx.fillRect(screenX + 2, screenY + 2, 4, this.tileSize - 4);

    // Граница
    this.ctx.strokeStyle = "#1a1a1a";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
  }

  /**
   * 3D рендеринг препятствия (разные типы)
   */
  private renderObstacle3D(x: number, y: number): void {
    const screenX = x * this.tileSize + this.cameraOffset.x;
    const screenY = y * this.tileSize + this.cameraOffset.y;

    // Выбираем тип препятствия на основе координат
    const obstacleType = (x * 7 + y * 13) % 5;

    switch (obstacleType) {
      case 0:
        this.renderCrate(screenX, screenY);
        break;
      case 1:
        this.renderBarrel(screenX, screenY);
        break;
      case 2:
        this.renderRubble(screenX, screenY);
        break;
      case 3:
        this.renderComputer(screenX, screenY);
        break;
      default:
        this.renderPillar(screenX, screenY);
        break;
    }
  }

  /**
   * Ящик
   */
  private renderCrate(screenX: number, screenY: number): void {
    const obstacleHeight = 8;

    // Тень
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    this.ctx.beginPath();
    this.ctx.ellipse(
      screenX + this.tileSize / 2 + 4,
      screenY + this.tileSize / 2 + obstacleHeight + 4,
      this.tileSize / 3,
      this.tileSize / 6,
      0,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Боковая часть
    this.ctx.fillStyle = COLORS.obstacle.shadow;
    this.ctx.fillRect(
      screenX + 8,
      screenY + 8 + obstacleHeight,
      this.tileSize - 16,
      obstacleHeight
    );

    // Верхняя часть
    this.ctx.fillStyle = COLORS.obstacle.top;
    this.ctx.fillRect(screenX + 8, screenY + 8, this.tileSize - 16, this.tileSize - 16);

    // Крест
    this.ctx.strokeStyle = COLORS.obstacle.shadow;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(screenX + 12, screenY + 12);
    this.ctx.lineTo(screenX + this.tileSize - 12, screenY + this.tileSize - 12);
    this.ctx.moveTo(screenX + this.tileSize - 12, screenY + 12);
    this.ctx.lineTo(screenX + 12, screenY + this.tileSize - 12);
    this.ctx.stroke();
  }

  /**
   * Бочка
   */
  private renderBarrel(screenX: number, screenY: number): void {
    const cx = screenX + this.tileSize / 2;
    const cy = screenY + this.tileSize / 2;
    const radius = this.tileSize / 3;

    // Тень
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    this.ctx.beginPath();
    this.ctx.ellipse(cx + 4, cy + 12, radius, radius / 2, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Бочка (металлическая)
    this.ctx.fillStyle = "#4a6670";
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Полосы
    this.ctx.strokeStyle = "#3a5560";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
    this.ctx.stroke();

    // Блик
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    this.ctx.beginPath();
    this.ctx.arc(cx - 4, cy - 4, radius / 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Символ опасности (иногда)
    if ((screenX + screenY) % 3 === 0) {
      this.ctx.fillStyle = "#ff6600";
      this.ctx.font = `bold ${this.tileSize / 3}px Arial`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText("☢", cx, cy);
    }
  }

  /**
   * Обломки/мусор
   */
  private renderRubble(screenX: number, screenY: number): void {
    // Тень
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    this.ctx.fillRect(screenX + 6, screenY + 10, this.tileSize - 8, this.tileSize - 12);

    // Камни разного размера
    const stones = [
      { x: 12, y: 16, r: 8, color: "#555" },
      { x: 28, y: 20, r: 10, color: "#666" },
      { x: 20, y: 30, r: 7, color: "#4a4a4a" },
      { x: 34, y: 32, r: 6, color: "#5a5a5a" },
      { x: 14, y: 28, r: 5, color: "#606060" },
    ];

    for (const stone of stones) {
      this.ctx.fillStyle = stone.color;
      this.ctx.beginPath();
      this.ctx.arc(screenX + stone.x, screenY + stone.y, stone.r, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * Сломанный компьютер/терминал
   */
  private renderComputer(screenX: number, screenY: number): void {
    // Тень
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    this.ctx.fillRect(screenX + 10, screenY + 14, this.tileSize - 16, this.tileSize - 16);

    // Корпус
    this.ctx.fillStyle = "#3a3a3a";
    this.ctx.fillRect(screenX + 10, screenY + 8, this.tileSize - 20, this.tileSize - 16);

    // Экран (сломанный, мерцает)
    const flicker = Math.sin(this.animationTime * 10) > 0.5;
    this.ctx.fillStyle = flicker ? "#002200" : "#001100";
    this.ctx.fillRect(
      screenX + 12,
      screenY + 10,
      this.tileSize - 24,
      this.tileSize / 2 - 4
    );

    // Статические помехи на экране
    if (flicker) {
      this.ctx.fillStyle = "#00ff00";
      for (let i = 0; i < 5; i++) {
        const lineY = screenY + 12 + i * 4;
        this.ctx.fillRect(screenX + 14, lineY, this.tileSize - 28, 1);
      }
    }

    // Кнопки
    this.ctx.fillStyle = "#222";
    this.ctx.fillRect(screenX + 14, screenY + this.tileSize - 12, 8, 4);
    this.ctx.fillRect(screenX + 26, screenY + this.tileSize - 12, 8, 4);
  }

  /**
   * Колонна/столб
   */
  private renderPillar(screenX: number, screenY: number): void {
    const cx = screenX + this.tileSize / 2;
    const cy = screenY + this.tileSize / 2;
    const radius = this.tileSize / 4;

    // Тень
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    this.ctx.beginPath();
    this.ctx.ellipse(cx + 6, cy + 10, radius + 4, (radius + 4) / 2, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // База колонны
    this.ctx.fillStyle = "#5c5c5c";
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy + 4, radius + 4, (radius + 4) / 2, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Колонна
    this.ctx.fillStyle = "#707070";
    this.ctx.beginPath();
    this.ctx.arc(cx, cy - 4, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Блик
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    this.ctx.beginPath();
    this.ctx.arc(cx - 3, cy - 7, radius / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Рендеринг двери
   */
  private renderDoor(x: number, y: number, isOpen: boolean): void {
    const screenX = x * this.tileSize + this.cameraOffset.x;
    const screenY = y * this.tileSize + this.cameraOffset.y;

    if (isOpen) {
      // Открытая дверь - пол с рамкой
      this.ctx.fillStyle = COLORS.door.open;
      this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

      // Рамка двери
      this.ctx.strokeStyle = COLORS.door.openFrame;
      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(screenX + 2, screenY + 2, this.tileSize - 4, this.tileSize - 4);

      // Внутренняя часть
      this.ctx.fillStyle = "#333333";
      this.ctx.fillRect(screenX + 6, screenY + 6, this.tileSize - 12, this.tileSize - 12);
    } else {
      // Закрытая дверь
      // Рамка
      this.ctx.fillStyle = COLORS.door.frame;
      this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

      // Дверное полотно
      this.ctx.fillStyle = COLORS.door.closed;
      this.ctx.fillRect(screenX + 4, screenY + 4, this.tileSize - 8, this.tileSize - 8);

      // Горизонтальные планки
      this.ctx.fillStyle = COLORS.door.frame;
      this.ctx.fillRect(screenX + 4, screenY + 12, this.tileSize - 8, 3);
      this.ctx.fillRect(screenX + 4, screenY + this.tileSize - 15, this.tileSize - 8, 3);

      // Ручка двери (золотая)
      this.ctx.fillStyle = COLORS.door.handle;
      this.ctx.beginPath();
      this.ctx.arc(
        screenX + this.tileSize - 14,
        screenY + this.tileSize / 2,
        4,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      // Блеск на ручке
      this.ctx.fillStyle = "#fff8dc";
      this.ctx.beginPath();
      this.ctx.arc(
        screenX + this.tileSize - 15,
        screenY + this.tileSize / 2 - 1,
        1.5,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      // Тень под дверью (3D эффект)
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      this.ctx.fillRect(screenX + 2, screenY + this.tileSize - 2, this.tileSize - 4, 4);
    }
  }

  /**
   * Рендеринг выхода на следующий уровень
   */
  private renderExit(x: number, y: number): void {
    const screenX = x * this.tileSize + this.cameraOffset.x;
    const screenY = y * this.tileSize + this.cameraOffset.y;
    const centerX = screenX + this.tileSize / 2;
    const centerY = screenY + this.tileSize / 2;

    // Пульсирующее свечение
    const pulse = Math.sin(this.animationTime * 3) * 0.3 + 0.7;
    const glowRadius = this.tileSize * 0.8 * pulse;

    // Внешнее свечение
    const gradient = this.ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      glowRadius
    );
    gradient.addColorStop(0, `rgba(0, 255, 100, ${0.6 * pulse})`);
    gradient.addColorStop(0.5, `rgba(0, 255, 50, ${0.3 * pulse})`);
    gradient.addColorStop(1, "rgba(0, 255, 0, 0)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(
      screenX - this.tileSize / 2,
      screenY - this.tileSize / 2,
      this.tileSize * 2,
      this.tileSize * 2
    );

    // Базовая платформа
    this.ctx.fillStyle = COLORS.exit.base;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, this.tileSize * 0.4, 0, Math.PI * 2);
    this.ctx.fill();

    // Контур
    this.ctx.strokeStyle = COLORS.exit.glow;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, this.tileSize * 0.4, 0, Math.PI * 2);
    this.ctx.stroke();

    // Внутренний круг
    this.ctx.fillStyle = `rgba(0, 255, 100, ${0.4 * pulse})`;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, this.tileSize * 0.25, 0, Math.PI * 2);
    this.ctx.fill();

    // Стрелка вниз (символизирует спуск)
    const arrowSize = this.tileSize * 0.2;
    this.ctx.fillStyle = COLORS.exit.arrow;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY + arrowSize);
    this.ctx.lineTo(centerX - arrowSize * 0.7, centerY - arrowSize * 0.3);
    this.ctx.lineTo(centerX - arrowSize * 0.2, centerY - arrowSize * 0.3);
    this.ctx.lineTo(centerX - arrowSize * 0.2, centerY - arrowSize);
    this.ctx.lineTo(centerX + arrowSize * 0.2, centerY - arrowSize);
    this.ctx.lineTo(centerX + arrowSize * 0.2, centerY - arrowSize * 0.3);
    this.ctx.lineTo(centerX + arrowSize * 0.7, centerY - arrowSize * 0.3);
    this.ctx.closePath();
    this.ctx.fill();

    // Текст "EXIT" или номер уровня
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 10px monospace";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "bottom";
    this.ctx.fillText("▼", centerX, screenY + this.tileSize - 4);
  }

  /**
   * Рендеринг предметов
   */
  private renderItems(
    items: readonly GameItem[],
    visibleTiles: { startX: number; endX: number; startY: number; endY: number }
  ): void {
    for (const item of items) {
      if (item.collected) continue;

      // Проверка видимости (позиция в пикселях)
      const tileX = Math.floor(item.position.x / this.tileSize);
      const tileY = Math.floor(item.position.y / this.tileSize);

      if (
        tileX >= visibleTiles.startX - 1 &&
        tileX < visibleTiles.endX + 1 &&
        tileY >= visibleTiles.startY - 1 &&
        tileY < visibleTiles.endY + 1
      ) {
        this.renderItem(item);
      }
    }
  }

  /**
   * Рендеринг предмета с анимацией
   */
  private renderItem(item: GameItem): void {
    const screenX = item.position.x + this.cameraOffset.x;
    const screenY = item.position.y + this.cameraOffset.y;

    // Анимация парения
    const floatOffset = Math.sin(this.animationTime * 3 + item.position.x) * 3;
    // Анимация появления
    const timeSinceSpawn = Date.now() - item.spawnTime;
    const scale = Math.min(1, timeSinceSpawn / 300);
    const opacity = Math.min(1, timeSinceSpawn / 200);

    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.translate(screenX, screenY + floatOffset);
    this.ctx.scale(scale, scale);

    const size = GAME_CONFIG.ITEM_SIZE;

    switch (item.type) {
      case ItemType.COIN:
        this.renderCoin(0, 0, size);
        break;
      case ItemType.POTION:
        this.renderPotion(0, 0, size, COLORS.items.potion);
        break;
      case ItemType.STAMINA_POTION:
        this.renderPotion(0, 0, size, COLORS.items.staminaPotion);
        break;
      case ItemType.RARE_ITEM:
        this.renderRareItem(0, 0, size);
        break;
    }

    this.ctx.restore();
  }

  /**
   * Рендеринг монеты
   */
  private renderCoin(x: number, y: number, size: number): void {
    // Свечение
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
    gradient.addColorStop(0, COLORS.items.coin.glow);
    gradient.addColorStop(1, "transparent");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x - size * 1.5, y - size * 1.5, size * 3, size * 3);

    // Монета
    this.ctx.fillStyle = COLORS.items.coin.primary;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Блик
    this.ctx.fillStyle = COLORS.items.coin.secondary;
    this.ctx.beginPath();
    this.ctx.arc(x - size / 6, y - size / 6, size / 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Символ $
    this.ctx.fillStyle = "#aa7700";
    this.ctx.font = `bold ${size * 0.6}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("$", x, y);
  }

  /**
   * Рендеринг зелья (здоровья или стамины)
   */
  private renderPotion(
    x: number,
    y: number,
    size: number,
    colors: { primary: string; secondary: string; glow: string }
  ): void {
    // Свечение
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
    gradient.addColorStop(0, colors.glow);
    gradient.addColorStop(1, "transparent");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x - size * 1.5, y - size * 1.5, size * 3, size * 3);

    // Бутылка
    const bottleWidth = size * 0.6;
    const bottleHeight = size;

    // Горлышко
    this.ctx.fillStyle = "#666";
    this.ctx.fillRect(x - bottleWidth / 4, y - bottleHeight / 2 - 4, bottleWidth / 2, 6);

    // Тело бутылки
    this.ctx.fillStyle = colors.primary;
    this.ctx.beginPath();
    this.ctx.roundRect(
      x - bottleWidth / 2,
      y - bottleHeight / 2,
      bottleWidth,
      bottleHeight,
      4
    );
    this.ctx.fill();

    // Жидкость (анимированная)
    const liquidLevel = 0.3 + Math.sin(this.animationTime * 2) * 0.05;
    this.ctx.fillStyle = colors.secondary;
    this.ctx.fillRect(
      x - bottleWidth / 2 + 2,
      y - bottleHeight / 2 + bottleHeight * liquidLevel,
      bottleWidth - 4,
      bottleHeight * (1 - liquidLevel) - 2
    );

    // Блик
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    this.ctx.fillRect(
      x - bottleWidth / 2 + 2,
      y - bottleHeight / 2 + 2,
      3,
      bottleHeight - 4
    );
  }

  /**
   * Рендеринг редкого предмета
   */
  private renderRareItem(x: number, y: number, size: number): void {
    // Свечение (более интенсивное)
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 2);
    gradient.addColorStop(0, COLORS.items.rare.glow);
    gradient.addColorStop(0.5, "rgba(153, 102, 255, 0.2)");
    gradient.addColorStop(1, "transparent");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x - size * 2, y - size * 2, size * 4, size * 4);

    // Вращающаяся звезда
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(this.animationTime);

    // Звезда
    this.ctx.fillStyle = COLORS.items.rare.primary;
    this.drawStar(0, 0, size * 0.7, 5);

    // Внутренняя звезда
    this.ctx.fillStyle = COLORS.items.rare.secondary;
    this.drawStar(0, 0, size * 0.4, 5);

    this.ctx.restore();
  }

  /**
   * Рисование звезды
   */
  private drawStar(x: number, y: number, radius: number, points: number): void {
    this.ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const r = i % 2 === 0 ? radius : radius / 2;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * DOOM-style рендеринг персонажа
   */
  private renderPlayer(player: PlayerState): void {
    const screenX = player.position.x + this.cameraOffset.x;
    const screenY = player.position.y + this.cameraOffset.y;
    const angle = (player.angle * Math.PI) / 180;

    this.ctx.save();
    this.ctx.translate(screenX, screenY);

    // Тень под игроком
    this.ctx.fillStyle = COLORS.player.shadow;
    this.ctx.beginPath();
    this.ctx.ellipse(2, 4, 14, 8, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Поворот для направления
    this.ctx.rotate(angle);

    // Тело (круглое, как в классических шутерах)
    const bodyRadius = 14;

    // Основное тело
    const bodyGradient = this.ctx.createRadialGradient(-3, -3, 0, 0, 0, bodyRadius);
    bodyGradient.addColorStop(0, "#e8c060");
    bodyGradient.addColorStop(0.7, COLORS.player.body);
    bodyGradient.addColorStop(1, "#8b6914");
    this.ctx.fillStyle = bodyGradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, bodyRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Броня (контур)
    this.ctx.strokeStyle = COLORS.player.armor;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Визор (направление взгляда) - в стиле Fallout
    this.ctx.fillStyle = COLORS.player.visor;
    this.ctx.beginPath();
    this.ctx.moveTo(bodyRadius - 2, 0);
    this.ctx.lineTo(bodyRadius + 8, -4);
    this.ctx.lineTo(bodyRadius + 8, 4);
    this.ctx.closePath();
    this.ctx.fill();

    // Свечение визора
    this.ctx.shadowColor = COLORS.player.visor;
    this.ctx.shadowBlur = 8;
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Анимация движения (пульсация)
    if (player.isMoving) {
      const pulse = Math.sin(this.animationTime * 15) * 0.1 + 1;
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillStyle = COLORS.player.visor;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, bodyRadius * pulse, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
    }

    this.ctx.restore();
  }

  /**
   * Эффект освещения от игрока
   */
  private renderLighting(player: PlayerState, width: number, height: number): void {
    const screenX = player.position.x + this.cameraOffset.x;
    const screenY = player.position.y + this.cameraOffset.y;

    // Радиальный градиент освещения
    const gradient = this.ctx.createRadialGradient(
      screenX,
      screenY,
      0,
      screenX,
      screenY,
      GAME_CONFIG.LIGHT_RADIUS
    );
    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.1)");
    gradient.addColorStop(1, COLORS.light.ambient);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }

  /**
   * Эффект виньетки
   */
  private renderVignette(width: number, height: number): void {
    const gradient = this.ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.3,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.7
    );
    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.4)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }
}
