/**
 * Компонент истории последних игр
 * Отображает список последних игр пользователя
 * Соблюдает принцип Single Responsibility
 */

import React from "react";
import type { GameHistory } from "@/services/storage/StorageTypes";
import { GameResult } from "@/types/game.types";
import { formatRelativeTime, formatDuration } from "@/utils/formatters";
import styles from "./RecentGames.module.css";

export interface RecentGamesProps {
  readonly gameHistory: GameHistory;
  readonly maxItems?: number;
  readonly className?: string;
}

/**
 * Получить иконку результата игры
 */
function getResultIcon(result: GameResult): string {
  switch (result) {
    case GameResult.WIN:
      return "🎉";
    case GameResult.LOSE:
      return "😊";
    case GameResult.DRAW:
      return "🤝";
    case GameResult.IN_PROGRESS:
      return "⏳";
    default:
      return "❓";
  }
}

/**
 * Получить текст результата игры
 */
function getResultText(result: GameResult): string {
  switch (result) {
    case GameResult.WIN:
      return "Победа";
    case GameResult.LOSE:
      return "Проигрыш";
    case GameResult.DRAW:
      return "Ничья";
    case GameResult.IN_PROGRESS:
      return "В процессе";
    default:
      return "Неизвестно";
  }
}

/**
 * Получить текст сложности
 */
function getDifficultyText(difficulty: string): string {
  switch (difficulty) {
    case "EASY":
      return "Легко";
    case "MEDIUM":
      return "Средне";
    case "HARD":
      return "Сложно";
    default:
      return difficulty;
  }
}

/**
 * Компонент истории последних игр
 */
export const RecentGames: React.FC<RecentGamesProps> = ({
  gameHistory,
  maxItems = 20,
  className = "",
}) => {
  const recentGames = gameHistory.slice(0, maxItems);

  if (recentGames.length === 0) {
    return (
      <div className={`${styles.recentGames} ${className}`}>
        <h2 className={styles.recentGames__title}>Последние игры</h2>
        <div className={styles.recentGames__empty}>
          <p className={styles.recentGames__emptyText}>
            Пока нет сыгранных игр. Начните играть!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.recentGames} ${className}`}>
      <h2 className={styles.recentGames__title}>Последние игры</h2>
      <ul className={styles.recentGames__list}>
        {recentGames.map((game) => (
          <li key={game.id} className={styles.recentGames__item}>
            <div className={styles.recentGames__itemHeader}>
              <span className={styles.recentGames__itemIcon}>
                {getResultIcon(game.result)}
              </span>
              <div className={styles.recentGames__itemInfo}>
                <span
                  className={`${styles.recentGames__itemResult} ${
                    styles[`recentGames__itemResult--${game.result.toLowerCase()}`]
                  }`}
                >
                  {getResultText(game.result)}
                </span>
                <span className={styles.recentGames__itemDifficulty}>
                  {getDifficultyText(game.difficulty)}
                </span>
              </div>
            </div>
            <div className={styles.recentGames__itemMeta}>
              <span className={styles.recentGames__itemTime}>
                {formatRelativeTime(game.timestamp)}
              </span>
              {game.duration && (
                <span className={styles.recentGames__itemDuration}>
                  {formatDuration(game.duration)}
                </span>
              )}
            </div>
            {game.promoCode && (
              <div className={styles.recentGames__itemPromo}>
                <span className={styles.recentGames__itemPromoLabel}>Промокод:</span>
                <span className={styles.recentGames__itemPromoCode}>
                  {game.promoCode}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
