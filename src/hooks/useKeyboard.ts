/**
 * Хук для обработки клавиатуры
 * Обрабатывает WASD, стрелки и Shift для бега
 * Поддерживает русскую раскладку (ЦФЫВ)
 */

import { useEffect, useCallback, useRef } from "react";
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

// Маппинг клавиш на направления (поддержка EN и RU раскладок)
const KEY_TO_DIRECTION: Record<string, Direction> = {
  // Английская раскладка
  w: DirectionEnum.UP,
  a: DirectionEnum.LEFT,
  s: DirectionEnum.DOWN,
  d: DirectionEnum.RIGHT,
  // Русская раскладка (ЦФЫВ)
  ц: DirectionEnum.UP,
  ф: DirectionEnum.LEFT,
  ы: DirectionEnum.DOWN,
  в: DirectionEnum.RIGHT,
  // Стрелки
  arrowup: DirectionEnum.UP,
  arrowleft: DirectionEnum.LEFT,
  arrowdown: DirectionEnum.DOWN,
  arrowright: DirectionEnum.RIGHT,
};

// Все игровые клавиши для preventDefault
const GAME_KEYS = new Set([
  "w", "a", "s", "d",
  "ц", "ф", "ы", "в",
  "arrowup", "arrowdown", "arrowleft", "arrowright",
  "shift",
]);

/**
 * Хук для обработки клавиатуры
 */
export const useKeyboard = (options?: UseKeyboardOptions): UseKeyboardReturn => {
  const enabled = options?.enabled ?? true;

  const keysPressedRef = useRef<Set<string>>(new Set());
  const keyboardStateRef = useRef<KeyboardState>({
    direction: null,
    movementType: MovementTypeEnum.IDLE,
    isMoving: false,
  });

  const onMoveRef = useRef(options?.onMove);
  const onStopRef = useRef(options?.onStop);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    onMoveRef.current = options?.onMove;
    onStopRef.current = options?.onStop;
    enabledRef.current = enabled;
  }, [options?.onMove, options?.onStop, enabled]);

  /**
   * Получить направление из нажатых клавиш
   */
  const getDirectionFromKeys = useCallback((): Direction | null => {
    const keys = keysPressedRef.current;
    
    // Проверяем все клавиши в порядке приоритета
    for (const key of keys) {
      const direction = KEY_TO_DIRECTION[key];
      if (direction) {
        return direction;
      }
    }
    
    return null;
  }, []);

  /**
   * Обновление состояния клавиатуры
   */
  const updateKeyboardState = useCallback((): void => {
    const keys = keysPressedRef.current;
    const isShiftPressed = keys.has("shift");
    
    const direction = getDirectionFromKeys();
    const isMoving = direction !== null;
    const prevDirection = keyboardStateRef.current.direction;

    const movementType: MovementType =
      direction && isShiftPressed ? MovementTypeEnum.RUN : MovementTypeEnum.WALK;

    keyboardStateRef.current = {
      direction,
      movementType: isMoving ? movementType : MovementTypeEnum.IDLE,
      isMoving,
    };

    // Вызов колбэков
    if (isMoving && direction && onMoveRef.current) {
      onMoveRef.current(direction, movementType);
    } else if (!isMoving && prevDirection !== null && onStopRef.current) {
      onStopRef.current();
    }
  }, [getDirectionFromKeys]);

  /**
   * Обработка нажатия клавиши
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      const key = event.key.toLowerCase();

      // СНАЧАЛА блокируем стандартное поведение для игровых клавиш
      if (GAME_KEYS.has(key)) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Если хук отключен - выходим после preventDefault
      if (!enabledRef.current) {
        return;
      }

      // Избегаем повторных событий при зажатии
      if (keysPressedRef.current.has(key)) {
        return;
      }

      keysPressedRef.current.add(key);
      updateKeyboardState();
    },
    [updateKeyboardState]
  );

  /**
   * Обработка отпускания клавиши
   */
  const handleKeyUp = useCallback(
    (event: KeyboardEvent): void => {
      const key = event.key.toLowerCase();

      // Блокируем стандартное поведение
      if (GAME_KEYS.has(key)) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (!enabledRef.current) {
        return;
      }

      keysPressedRef.current.delete(key);
      updateKeyboardState();
    },
    [updateKeyboardState]
  );

  // Установка обработчиков
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("keyup", handleKeyUp, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("keyup", handleKeyUp, { capture: true });
    };
  }, [handleKeyDown, handleKeyUp]);

  // Очистка при отключении
  useEffect(() => {
    if (!enabled) {
      keysPressedRef.current.clear();
      keyboardStateRef.current = {
        direction: null,
        movementType: MovementTypeEnum.IDLE,
        isMoving: false,
      };
      if (onStopRef.current) {
        onStopRef.current();
      }
    }
  }, [enabled]);

  return {
    keyboardState: keyboardStateRef.current,
    isEnabled: enabled,
  };
};
