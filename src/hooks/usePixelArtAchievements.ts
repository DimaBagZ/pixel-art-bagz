/**
 * Хук для управления достижениями пиксель-арт игры
 * Инкапсулирует логику работы с достижениями
 * Соблюдает принцип Single Responsibility
 */

import { useState, useEffect, useCallback } from "react";
import { pixelArtAchievementsService } from "@/services/storage/PixelArtAchievementsService";
import type { PixelArtAchievement, PixelArtAchievementType } from "@/types/pixel-art-achievements.types";
import type { PixelArtGameStatistics } from "@/types/pixel-art-statistics.types";
import type { GameState } from "@/types/pixel-art-game.types";

export interface UsePixelArtAchievementsReturn {
  readonly achievements: readonly PixelArtAchievement[];
  readonly checkAchievements: (
    statistics: PixelArtGameStatistics,
    gameState: GameState
  ) => readonly PixelArtAchievementType[];
  readonly resetAchievements: () => void;
  readonly isLoading: boolean;
}

/**
 * Хук для управления достижениями пиксель-арт игры
 */
export const usePixelArtAchievements = (): UsePixelArtAchievementsReturn => {
  const [achievements, setAchievements] = useState<readonly PixelArtAchievement[]>(() =>
    pixelArtAchievementsService.getAchievements()
  );
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Загрузить достижения
   */
  const loadAchievements = useCallback((): void => {
    setIsLoading(true);
    try {
      const loaded = pixelArtAchievementsService.getAchievements();
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
      statistics: PixelArtGameStatistics,
      gameState: GameState
    ): readonly PixelArtAchievementType[] => {
      try {
        const newlyUnlocked = pixelArtAchievementsService.checkAchievements(
          statistics,
          gameState
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
      pixelArtAchievementsService.resetAchievements();
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

