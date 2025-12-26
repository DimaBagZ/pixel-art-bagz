/**
 * Хук для статистики пиксель-арт игры
 * Использует накопительную статистику из отдельного хранилища
 * Соблюдает принцип Single Responsibility
 */

import { useMemo, useEffect, useRef } from "react";
import { useGameState } from "./useGameState";
import { pixelArtStatisticsService } from "@/services/storage/PixelArtStatisticsService";
import type { PixelArtGameStatistics } from "@/types/pixel-art-statistics.types";

export interface UsePixelArtStatisticsReturn {
  readonly statistics: PixelArtGameStatistics;
  readonly isLoading: boolean;
}

/**
 * Интервал обновления статистики (5 секунд)
 */
const STATISTICS_UPDATE_INTERVAL = 5000;

/**
 * Хук для получения статистики пиксель-арт игры
 */
export const usePixelArtStatistics = (): UsePixelArtStatisticsReturn => {
  const { savedState } = useGameState();
  const lastUpdateTimeRef = useRef<number>(0);

  // Обновляем статистику периодически, если игра запущена
  useEffect(() => {
    if (!savedState?.isGameStarted) {
      return;
    }

    const updateInterval = setInterval(() => {
      const now = Date.now();
      // Обновляем статистику каждые 5 секунд
      if (now - lastUpdateTimeRef.current >= STATISTICS_UPDATE_INTERVAL) {
        pixelArtStatisticsService.updateStatistics(savedState);
        lastUpdateTimeRef.current = now;
      }
    }, STATISTICS_UPDATE_INTERVAL);

    // Обновляем сразу при монтировании, если игра запущена
    if (lastUpdateTimeRef.current === 0) {
      pixelArtStatisticsService.updateStatistics(savedState);
      lastUpdateTimeRef.current = Date.now();
    }

    return () => {
      clearInterval(updateInterval);
      // Финальное обновление при размонтировании
      if (savedState?.isGameStarted) {
        pixelArtStatisticsService.updateStatistics(savedState);
      }
    };
  }, [savedState]);

  const statistics = useMemo((): PixelArtGameStatistics => {
    // Получаем накопительную статистику из отдельного хранилища
    const storedStats = pixelArtStatisticsService.getStatistics();
    
    // Если есть текущее состояние, обновляем только динамические значения для отображения
    if (savedState) {
      return {
        ...storedStats,
        // Обновляем только динамические значения для отображения (не сохраняем)
        currentLevel: savedState.player.stats.level,
        maxLevel: Math.max(storedStats.maxLevel, savedState.player.stats.level),
        maxFloor: Math.max(storedStats.maxFloor, savedState.mapLevel ?? 1),
        totalExperience: Math.max(
          storedStats.totalExperience,
          savedState.player.stats.experience
        ),
        lastPlayed: savedState.lastSaveTime,
      };
    }

    return storedStats;
  }, [savedState]);

  return {
    statistics,
    isLoading: false,
  };
};

