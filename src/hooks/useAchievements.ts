/**
 * Hook для управления достижениями
 * Инкапсулирует логику работы с достижениями
 * Соблюдает принцип Single Responsibility
 */

import { useState, useEffect, useCallback } from "react";
import { achievementsService } from "@/services/storage/AchievementsService";
import type {
  Achievement,
  AchievementType,
} from "@/services/storage/StorageTypes";
import type { GameStatistics, GameHistory } from "@/services/storage/StorageTypes";

export interface UseAchievementsReturn {
  readonly achievements: readonly Achievement[];
  readonly checkAchievements: (
    statistics: GameStatistics,
    gameHistory: GameHistory
  ) => readonly AchievementType[];
  readonly resetAchievements: () => void;
  readonly isLoading: boolean;
}

/**
 * Hook для управления достижениями
 */
export const useAchievements = (): UseAchievementsReturn => {
  const [achievements, setAchievements] = useState<readonly Achievement[]>(() =>
    achievementsService.getAchievements()
  );
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Загрузить достижения
   */
  const loadAchievements = useCallback((): void => {
    setIsLoading(true);
    try {
      const loaded = achievementsService.getAchievements();
      setAchievements(loaded);
    } catch (error) {
      console.error("Ошибка загрузки достижений:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Проверить и обновить достижения
   */
  const checkAchievements = useCallback(
    (
      statistics: GameStatistics,
      gameHistory: GameHistory
    ): readonly AchievementType[] => {
      try {
        const newlyUnlocked = achievementsService.checkAchievements(
          statistics,
          gameHistory
        );
        loadAchievements();
        return newlyUnlocked;
      } catch (error) {
        console.error("Ошибка проверки достижений:", error);
        return [];
      }
    },
    [loadAchievements]
  );

  /**
   * Сбросить достижения
   */
  const resetAchievements = useCallback((): void => {
    try {
      achievementsService.resetAchievements();
      loadAchievements();
    } catch (error) {
      console.error("Ошибка сброса достижений:", error);
    }
  }, [loadAchievements]);

  // Загрузить достижения при монтировании (только один раз)
  useEffect(() => {
    loadAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    achievements,
    checkAchievements,
    resetAchievements,
    isLoading,
  };
};

