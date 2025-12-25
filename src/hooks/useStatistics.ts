/**
 * Hook для управления статистикой игр
 * Инкапсулирует логику работы со статистикой
 * Соблюдает принцип Single Responsibility
 */

import { useState, useEffect, useCallback } from "react";
import { statisticsService } from "@/services/storage/StatisticsService";
import type {
  GameStatistics,
  GameHistory,
} from "@/services/storage/StorageTypes";
import type { GameResult, AIDifficulty } from "@/types/game.types";

export interface UseStatisticsReturn {
  readonly statistics: GameStatistics;
  readonly gameHistory: GameHistory;
  readonly updateStatistics: (
    result: GameResult,
    difficulty: AIDifficulty,
    duration?: number,
    promoCode?: string
  ) => void;
  readonly resetStatistics: () => void;
  readonly clearHistory: () => void;
  readonly isLoading: boolean;
}

/**
 * Hook для управления статистикой
 */
export const useStatistics = (): UseStatisticsReturn => {
  const [statistics, setStatistics] = useState<GameStatistics>(() =>
    statisticsService.getStatistics()
  );
  const [gameHistory, setGameHistory] = useState<GameHistory>(() =>
    statisticsService.getGameHistory()
  );
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Загрузить статистику и историю
   */
  const loadData = useCallback((): void => {
    setIsLoading(true);
    try {
      const stats = statisticsService.getStatistics();
      const history = statisticsService.getGameHistory();
      setStatistics(stats);
      setGameHistory(history);
    } catch (error) {
      console.error("Ошибка загрузки статистики:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Обновить статистику после игры
   */
  const updateStatistics = useCallback(
    (
      result: GameResult,
      difficulty: AIDifficulty,
      duration?: number,
      promoCode?: string
    ): void => {
      try {
        statisticsService.updateStatistics(result, difficulty, duration, promoCode);
        loadData();
      } catch (error) {
        console.error("Ошибка обновления статистики:", error);
      }
    },
    [loadData]
  );

  /**
   * Сбросить статистику
   */
  const resetStatistics = useCallback((): void => {
    try {
      statisticsService.resetStatistics();
      loadData();
    } catch (error) {
      console.error("Ошибка сброса статистики:", error);
    }
  }, [loadData]);

  /**
   * Очистить историю игр
   */
  const clearHistory = useCallback((): void => {
    try {
      statisticsService.clearGameHistory();
      loadData();
    } catch (error) {
      console.error("Ошибка очистки истории:", error);
    }
  }, [loadData]);

  // Загрузить данные при монтировании (только один раз)
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    statistics,
    gameHistory,
    updateStatistics,
    resetStatistics,
    clearHistory,
    isLoading,
  };
};

