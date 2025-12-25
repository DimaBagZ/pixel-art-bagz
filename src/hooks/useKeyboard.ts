/**
 * Хук для обработки клавиатуры
 * Обрабатывает WASD, стрелки и Shift для бега
 * Соблюдает принцип Single Responsibility
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { Direction, MovementType } from "@/types/pixel-art-game.types";
import {
  Direction as DirectionEnum,
  MovementType as MovementTypeEnum,
} from "@/types/pixel-art-game.types";

export interface KeyboardState {
  readonly direction: Direction | null;
  readonly movementType: MovementType;
  readonly isMoving: boolean;
}

export interface UseKeyboardOptions {
  readonly enabled?: boolean;
  readonly onMove?: (direction: Direction, movementType: MovementType) => void;
  readonly onStop?: () => void;
}

export interface UseKeyboardReturn {
  readonly keyboardState: KeyboardState;
  readonly isEnabled: boolean;
}

/**
 * Хук для обработки клавиатуры
 */
export const useKeyboard = (options?: UseKeyboardOptions): UseKeyboardReturn => {
  const enabled = options?.enabled ?? true;
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    direction: null,
    movementType: MovementTypeEnum.IDLE,
    isMoving: false,
  });

  const keysPressedRef = useRef<Set<string>>(new Set());
  const lastDirectionRef = useRef<Direction | null>(null);

  /**
   * Обработка нажатия клавиши
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      if (!enabled) {
        return;
      }

      const key = event.key.toLowerCase();
      keysPressedRef.current.add(key);

      // Предотвращение стандартного поведения для игровых клавиш
      if (
        key === "w" ||
        key === "a" ||
        key === "s" ||
        key === "d" ||
        key === "arrowup" ||
        key === "arrowdown" ||
        key === "arrowleft" ||
        key === "arrowright" ||
        key === "shift"
      ) {
        event.preventDefault();
      }

      updateKeyboardState();
    },
    [enabled, options]
  );

  /**
   * Обработка отпускания клавиши
   */
  const handleKeyUp = useCallback(
    (event: KeyboardEvent): void => {
      if (!enabled) {
        return;
      }

      const key = event.key.toLowerCase();
      keysPressedRef.current.delete(key);

      updateKeyboardState();
    },
    [enabled, options]
  );

  /**
   * Обновление состояния клавиатуры
   */
  const updateKeyboardState = useCallback((): void => {
    const keys = keysPressedRef.current;
    const isShiftPressed = keys.has("shift");

    // Определение направления
    let direction: Direction | null = null;

    if (keys.has("w") || keys.has("arrowup")) {
      direction = DirectionEnum.UP;
    } else if (keys.has("s") || keys.has("arrowdown")) {
      direction = DirectionEnum.DOWN;
    } else if (keys.has("a") || keys.has("arrowleft")) {
      direction = DirectionEnum.LEFT;
    } else if (keys.has("d") || keys.has("arrowright")) {
      direction = DirectionEnum.RIGHT;
    }

    // Определение типа движения
    const movementType: MovementType =
      direction && isShiftPressed ? MovementTypeEnum.RUN : MovementTypeEnum.WALK;

    const isMoving = direction !== null;

    // Обновление состояния
    const newState: KeyboardState = {
      direction,
      movementType: isMoving ? movementType : MovementTypeEnum.IDLE,
      isMoving,
    };

    setKeyboardState(newState);

    // Вызов колбэков
    if (isMoving && direction && options?.onMove) {
      options.onMove(direction, movementType);
      lastDirectionRef.current = direction;
    } else if (!isMoving && options?.onStop) {
      options.onStop();
      lastDirectionRef.current = null;
    }
  }, [options]);

  // Установка обработчиков событий
  useEffect(() => {
    if (!enabled) {
      return;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [enabled, handleKeyDown, handleKeyUp]);

  // Очистка при отключении
  useEffect(() => {
    if (!enabled) {
      keysPressedRef.current.clear();
      setKeyboardState({
        direction: null,
        movementType: MovementTypeEnum.IDLE,
        isMoving: false,
      });
    }
  }, [enabled]);

  return {
    keyboardState,
    isEnabled: enabled,
  };
};
