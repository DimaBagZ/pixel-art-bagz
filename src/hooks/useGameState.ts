/**
 * Хук для управления состоянием игры
 * Загрузка, сохранение и автосохранение состояния
 * Оптимизирован для избежания лишних ререндеров
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { GameState } from "@/types/pixel-art-game.types";
import { gameStateService } from "@/services/storage/GameStateService";
import { GAME_CONFIG } from "@/utils/pixel-art-constants";
import { STORAGE_KEYS } from "@/services/storage/StorageTypes";

export interface UseGameStateReturn {
  readonly savedState: GameState | null;
  readonly isLoading: boolean;
  readonly hasSavedGame: boolean;
  readonly saveGameState: (state: GameState) => void;
  readonly forceSaveGameState: (state: GameState) => void; // Принудительное сохранение без дебаунса
  readonly loadGameState: () => GameState | null;
  readonly deleteGameState: () => void;
}

/**
 * Хук для работы с сохраненным состоянием игры
 */
export const useGameState = (): UseGameStateReturn => {
  const [savedState, setSavedState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastSaveTimeRef = useRef<number>(0);
  const lastForceSaveTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  // Загрузка сохраненного состояния при монтировании (только один раз)
  useEffect(() => {
    isMountedRef.current = true;

    const loadState = (): void => {
      try {
        const state = gameStateService.loadGameState();
        if (isMountedRef.current) {
          setSavedState(state);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Ошибка загрузки состояния игры:", error);
        if (isMountedRef.current) {
          setSavedState(null);
          setIsLoading(false);
        }
      }
    };

    loadState();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Слушаем изменения в localStorage для синхронизации между вкладками
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key === STORAGE_KEYS.PIXEL_ART_GAME_STATE && isMountedRef.current) {
        const state = gameStateService.loadGameState();
        setSavedState(state);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Проверка наличия сохраненного состояния
  const hasSavedGame = savedState !== null && savedState.isGameStarted === true;

  /**
   * Сохранить состояние игры (с дебаунсом)
   */
  const saveGameState = useCallback((state: GameState): void => {
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimeRef.current;
    const timeSinceLastForceSave = now - lastForceSaveTimeRef.current;

    // Не сохраняем чаще чем раз в секунду для избежания нагрузки
    if (timeSinceLastSave < 1000) {
      return;
    }

    // Не перезаписываем состояние в течение 2 секунд после принудительного сохранения
    if (timeSinceLastForceSave < 2000) {
      return;
    }

    try {
      const success = gameStateService.saveGameState(state);
      if (success) {
        lastSaveTimeRef.current = now;
        // НЕ вызываем setSavedState здесь чтобы избежать ререндера
      }
    } catch (error) {
      console.error("Ошибка сохранения состояния игры:", error);
    }
  }, []);

  /**
   * Принудительно сохранить состояние игры (без дебаунса)
   * Используется для критических изменений (левел-ап и т.д.)
   */
  const forceSaveGameState = useCallback((state: GameState): void => {
    try {
      const now = Date.now();
      const success = gameStateService.saveGameState(state);
      if (success) {
        lastSaveTimeRef.current = now;
        lastForceSaveTimeRef.current = now; // Отмечаем время принудительного сохранения
      }
    } catch (error) {
      console.error("Ошибка принудительного сохранения состояния игры:", error);
    }
  }, []);

  /**
   * Загрузить сохраненное состояние
   */
  const loadGameState = useCallback((): GameState | null => {
    try {
      const state = gameStateService.loadGameState();
      setSavedState(state);
      return state;
    } catch (error) {
      console.error("Ошибка загрузки состояния игры:", error);
      return null;
    }
  }, []);

  /**
   * Удалить сохраненное состояние
   */
  const deleteGameState = useCallback((): void => {
    try {
      gameStateService.deleteGameState();
      setSavedState(null);
    } catch (error) {
      console.error("Ошибка удаления состояния игры:", error);
    }
  }, []);

  // Сохранение при скрытии страницы
  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (document.hidden && savedState && savedState.isGameStarted) {
        gameStateService.saveGameState(savedState);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [savedState]);

  return {
    savedState,
    isLoading,
    hasSavedGame,
    saveGameState,
    forceSaveGameState,
    loadGameState,
    deleteGameState,
  };
};
