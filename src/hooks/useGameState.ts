/**
 * Хук для управления состоянием игры
 * Загрузка, сохранение и автосохранение состояния
 * Соблюдает принцип Single Responsibility
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { GameState } from "@/types/pixel-art-game.types";
import { gameStateService } from "@/services/storage/GameStateService";
import { GAME_CONFIG } from "@/utils/pixel-art-constants";

export interface UseGameStateReturn {
  readonly savedState: GameState | null;
  readonly isLoading: boolean;
  readonly hasSavedGame: boolean;
  readonly saveGameState: (state: GameState) => void;
  readonly loadGameState: () => GameState | null;
  readonly deleteGameState: () => void;
}

/**
 * Хук для работы с сохраненным состоянием игры
 */
export const useGameState = (): UseGameStateReturn => {
  const [savedState, setSavedState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);

  // Загрузка сохраненного состояния при монтировании
  useEffect(() => {
    const loadState = (): void => {
      setIsLoading(true);
      try {
        const state = gameStateService.loadGameState();
        setSavedState(state);
      } catch (error) {
        console.error("Ошибка загрузки состояния игры:", error);
        setSavedState(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  // Проверка наличия сохраненного состояния
  const hasSavedGame = gameStateService.hasSavedGame();

  /**
   * Сохранить состояние игры
   */
  const saveGameState = useCallback((state: GameState): void => {
    try {
      const success = gameStateService.saveGameState(state);
      if (success) {
        setSavedState(state);
        lastSaveTimeRef.current = Date.now();
      }
    } catch (error) {
      console.error("Ошибка сохранения состояния игры:", error);
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

  /**
   * Автосохранение с debounce
   */
  const autoSave = useCallback(
    (state: GameState): void => {
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;

      // Очистка предыдущего таймера
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Если прошло достаточно времени с последнего сохранения, сохраняем сразу
      if (timeSinceLastSave >= GAME_CONFIG.AUTO_SAVE_INTERVAL) {
        saveGameState(state);
        return;
      }

      // Иначе устанавливаем таймер
      const remainingTime = GAME_CONFIG.AUTO_SAVE_INTERVAL - timeSinceLastSave;
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveGameState(state);
      }, remainingTime);
    },
    [saveGameState]
  );

  // Сохранение при уходе со страницы
  useEffect(() => {
    const handleBeforeUnload = (): void => {
      // Сохранение будет происходить через autoSave при обновлении состояния
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };

    const handleVisibilityChange = (): void => {
      if (document.hidden && savedState) {
        // Сохраняем при скрытии страницы
        saveGameState(savedState);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [savedState, saveGameState]);

  return {
    savedState,
    isLoading,
    hasSavedGame,
    saveGameState,
    loadGameState,
    deleteGameState,
  };
};

