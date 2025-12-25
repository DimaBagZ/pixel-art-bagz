/**
 * Рендерер для Canvas
 * Отвечает за отрисовку игровых элементов
 * Соблюдает принцип Single Responsibility
 */

import type {
  GameState,
  Position,
  Tile,
  GameItem,
  PlayerState,
} from "@/types/pixel-art-game.types";
import { TileType, ItemType } from "@/types/pixel-art-game.types";
import { GAME_CONFIG } from "@/utils/pixel-art-constants";

/**
 * Класс для рендеринга игры на Canvas
 */
export class CanvasRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly tileSize: number;
  private cameraOffset: Position;

  constructor(ctx: CanvasRenderingContext2D, tileSize: number = GAME_CONFIG.TILE_SIZE) {
    this.ctx = ctx;
    this.tileSize = tileSize;
    this.cameraOffset = { x: 0, y: 0 };
  }

  /**
   * Установить смещение камеры (для следования за игроком)
   */
  setCameraOffset(offset: Position): void {
    this.cameraOffset = offset;
  }

  /**
   * Очистить Canvas
   */
  clear(width: number, height: number): void {
    this.ctx.fillStyle = "var(--color-background)";
    this.ctx.fillRect(0, 0, width, height);
  }

  /**
   * Рендеринг всей игры
   */
  render(gameState: GameState, canvasWidth: number, canvasHeight: number): void {
    // Очистка
    this.clear(canvasWidth, canvasHeight);

    // Расчет видимой области
    const visibleTiles = this.calculateVisibleTiles(canvasWidth, canvasHeight);

    // Рендеринг карты
    this.renderMap(gameState.map, visibleTiles);

    // Рендеринг предметов
    this.renderItems(gameState.items, visibleTiles);

    // Рендеринг персонажа
    this.renderPlayer(gameState.player);
  }

  /**
   * Расчет видимой области тайлов
   */
  private calculateVisibleTiles(
    canvasWidth: number,
    canvasHeight: number
  ): {
    startX: number;
    endX: number;
    startY: number;
    endY: number;
  } {
    const startX = Math.max(0, Math.floor(-this.cameraOffset.x / this.tileSize) - 1);
    const endX = Math.min(
      GAME_CONFIG.MAP_WIDTH,
      Math.ceil((canvasWidth - this.cameraOffset.x) / this.tileSize) + 1
    );
    const startY = Math.max(0, Math.floor(-this.cameraOffset.y / this.tileSize) - 1);
    const endY = Math.min(
      GAME_CONFIG.MAP_HEIGHT,
      Math.ceil((canvasHeight - this.cameraOffset.y) / this.tileSize) + 1
    );

    return { startX, endX, startY, endY };
  }

  /**
   * Рендеринг карты
   */
  private renderMap(
    map: GameState["map"],
    visibleTiles: { startX: number; endX: number; startY: number; endY: number }
  ): void {
    for (let y = visibleTiles.startY; y < visibleTiles.endY; y++) {
      for (let x = visibleTiles.startX; x < visibleTiles.endX; x++) {
        if (y >= 0 && y < map.tiles.length && x >= 0 && x < map.tiles[y].length) {
          const tile = map.tiles[y][x];
          this.renderTile(tile, x, y);
        }
      }
    }
  }

  /**
   * Рендеринг тайла
   */
  private renderTile(tile: Tile, x: number, y: number): void {
    const screenX = x * this.tileSize + this.cameraOffset.x;
    const screenY = y * this.tileSize + this.cameraOffset.y;

    switch (tile.type) {
      case TileType.FLOOR:
        this.ctx.fillStyle = "var(--color-surface)";
        break;
      case TileType.WALL:
        this.ctx.fillStyle = "var(--color-surface-dark)";
        break;
      case TileType.OBSTACLE:
        this.ctx.fillStyle = "var(--color-accent)";
        break;
    }

    this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

    // Граница тайла
    this.ctx.strokeStyle = "var(--color-border)";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
  }

  /**
   * Рендеринг предметов
   */
  private renderItems(
    items: readonly GameItem[],
    visibleTiles: { startX: number; endX: number; startY: number; endY: number }
  ): void {
    for (const item of items) {
      if (item.collected) {
        continue;
      }

      const { x, y } = item.position;
      if (
        x >= visibleTiles.startX &&
        x < visibleTiles.endX &&
        y >= visibleTiles.startY &&
        y < visibleTiles.endY
      ) {
        this.renderItem(item);
      }
    }
  }

  /**
   * Рендеринг предмета
   */
  private renderItem(item: GameItem): void {
    const screenX = item.position.x * this.tileSize + this.cameraOffset.x;
    const screenY = item.position.y * this.tileSize + this.cameraOffset.y;
    const centerX = screenX + this.tileSize / 2;
    const centerY = screenY + this.tileSize / 2;

    // Анимация появления
    const timeSinceSpawn = Date.now() - item.spawnTime;
    const opacity = Math.min(1, timeSinceSpawn / 500);

    this.ctx.save();
    this.ctx.globalAlpha = opacity;

    switch (item.type) {
      case ItemType.COIN:
        // Монета - золотой круг
        this.ctx.fillStyle = "var(--color-primary)";
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.tileSize / 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = "var(--color-primary-dark)";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        break;

      case ItemType.POTION:
        // Зелье - красная бутылка
        this.ctx.fillStyle = "var(--color-error)";
        this.ctx.fillRect(centerX - 6, centerY - 10, 12, 20);
        this.ctx.fillStyle = "var(--color-error-dark)";
        this.ctx.fillRect(centerX - 4, centerY - 8, 8, 2);
        break;

      case ItemType.RARE_ITEM:
        // Редкий предмет - фиолетовая звезда
        this.ctx.fillStyle = "var(--color-accent-light)";
        this.drawStar(centerX, centerY, this.tileSize / 3, 5);
        break;
    }

    this.ctx.restore();
  }

  /**
   * Рисование звезды
   */
  private drawStar(x: number, y: number, radius: number, points: number): void {
    this.ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
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
   * Рендеринг персонажа
   */
  private renderPlayer(player: PlayerState): void {
    const screenX = player.position.x * this.tileSize + this.cameraOffset.x;
    const screenY = player.position.y * this.tileSize + this.cameraOffset.y;
    const centerX = screenX + this.tileSize / 2;
    const centerY = screenY + this.tileSize / 2;

    // Тело персонажа (простой пиксель-арт спрайт)
    this.ctx.fillStyle = "var(--color-primary)";
    this.ctx.fillRect(screenX + 8, screenY + 8, this.tileSize - 16, this.tileSize - 16);

    // Голова
    this.ctx.fillStyle = "var(--color-text-light)";
    this.ctx.fillRect(screenX + 12, screenY + 4, 8, 8);

    // Направление движения (простая индикация)
    const directionOffset = this.getDirectionOffset(player.direction);
    this.ctx.fillStyle = "var(--color-success)";
    this.ctx.fillRect(
      centerX + directionOffset.x - 2,
      centerY + directionOffset.y - 2,
      4,
      4
    );
  }

  /**
   * Получить смещение для направления
   */
  private getDirectionOffset(direction: PlayerState["direction"]): Position {
    switch (direction) {
      case "UP":
        return { x: 0, y: -8 };
      case "DOWN":
        return { x: 0, y: 8 };
      case "LEFT":
        return { x: -8, y: 0 };
      case "RIGHT":
        return { x: 8, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  }
}

