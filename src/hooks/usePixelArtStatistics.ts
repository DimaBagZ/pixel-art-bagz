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

    // Подсчёт собранных предметов из ресурсов или items
    const resources = savedState.collectedResources;
    const collectedPotions = resources?.healthPotions ?? savedState.items.filter(
      (item) => item.type === "POTION" && item.collected
    ).length;
    const collectedStaminaPotions = resources?.staminaPotions ?? savedState.items.filter(
      (item) => item.type === "STAMINA_POTION" && item.collected
    ).length;

    return {
      totalCoinsCollected: savedState.coins,
      totalPotionsCollected: collectedPotions,
      totalStaminaPotionsCollected: collectedStaminaPotions,
      totalRareItemsCollected: savedState.items.filter(
        (item) => item.type === "RARE_ITEM" && item.collected
      ).length,
      currentLevel: savedState.player.stats.level,
      maxLevel: savedState.player.stats.level,
      maxFloor: savedState.mapLevel ?? 1,
      totalExperience: savedState.player.stats.experience,
      totalPlayTime: savedState.gameStartTime
        ? Date.now() - savedState.gameStartTime
        : 0,
      lastPlayed: savedState.lastSaveTime,
      sessionsCount: 1, // TODO: добавить подсчет сессий
      treasuresOpened: 0, // TODO: добавить подсчет сокровищниц
      itemsSold: 0, // TODO: добавить подсчет проданных предметов
      version: 2,
    };
  }, [savedState]);

  return {
    statistics,
    isLoading: false,
  };
};

