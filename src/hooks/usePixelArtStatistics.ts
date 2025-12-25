/**
 * Хук для статистики пиксель-арт игры
 * Извлекает статистику из сохраненного состояния игры
 * Соблюдает принцип Single Responsibility
 */

import { useMemo } from "react";
import { useGameState } from "./useGameState";
import type { PixelArtGameStatistics } from "@/types/pixel-art-statistics.types";
import { createEmptyStatistics } from "@/types/pixel-art-statistics.types";

export interface UsePixelArtStatisticsReturn {
  readonly statistics: PixelArtGameStatistics;
  readonly isLoading: boolean;
}

/**
 * Хук для получения статистики пиксель-арт игры
 */
export const usePixelArtStatistics = (): UsePixelArtStatisticsReturn => {
  const { savedState } = useGameState();

  const statistics = useMemo((): PixelArtGameStatistics => {
    if (!savedState) {
      return createEmptyStatistics();
    }

    return {
      totalCoinsCollected: savedState.coins,
      totalPotionsCollected: savedState.items.filter(
        (item) => item.type === "POTION" && item.collected
      ).length,
      totalRareItemsCollected: savedState.items.filter(
        (item) => item.type === "RARE_ITEM" && item.collected
      ).length,
      currentLevel: savedState.player.stats.level,
      maxLevel: savedState.player.stats.level,
      totalExperience: savedState.player.stats.experience,
      totalPlayTime: savedState.gameStartTime
        ? Date.now() - savedState.gameStartTime
        : 0,
      lastPlayed: savedState.lastSaveTime,
      sessionsCount: 1, // TODO: добавить подсчет сессий
      version: 1,
    };
  }, [savedState]);

  return {
    statistics,
    isLoading: false,
  };
};

