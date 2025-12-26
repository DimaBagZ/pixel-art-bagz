/**
 * Hook для работы с профилем пользователя
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import { useState, useEffect, useCallback } from "react";
import type { AvatarId } from "@/domain/avatar/AvatarPreset";
import { AvatarValidator } from "@/domain/avatar/AvatarValidator";
import { userStorageService } from "@/services/storage";
import type { UserProfile } from "@/services/storage/StorageTypes";
import { gameStateService } from "@/services/storage/GameStateService";
import { CHARACTER_PRESETS } from "@/components/game/CharacterCreation/CharacterCreation";

export interface UseUserProfileReturn {
  readonly profile: UserProfile | null;
  readonly isLoading: boolean;
  readonly createProfile: (data: { name: string; avatarId: AvatarId }) => void;
  readonly updateName: (name: string) => void;
  readonly updateAvatar: (avatarId: AvatarId) => void;
  readonly updateCharacterClass: (
    characterClass: "SURVIVOR" | "EXPLORER" | "COLLECTOR"
  ) => void;
  readonly upgradeStamina: () => boolean; // возвращает успех (true если куплено)
  readonly getAvailableSkillPoints: () => number; // доступные очки навыков
  readonly resetProfile: () => void;
  readonly deleteAccount: () => void;
}

/**
 * Дефолтный аватар для новых профилей (фиксированный для избежания hydration mismatch)
 */
const DEFAULT_AVATAR_ID: AvatarId = "avatar-01";

/**
 * Hook для управления профилем пользователя
 */
export const useUserProfile = (): UseUserProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const loadedProfile = userStorageService.getProfile();
      if (loadedProfile) {
        // Валидация avatarId
        const validAvatarId = AvatarValidator.validateAndNormalize(
          loadedProfile.avatarId
        );
        if (!validAvatarId) {
          // Если avatarId невалидный, используем дефолтный
          const updatedProfile = userStorageService.updateProfile({
            ...loadedProfile,
            avatarId: DEFAULT_AVATAR_ID,
          });
          setProfile(updatedProfile);
        } else {
          setProfile(loadedProfile);
        }
      } else {
        // Профиля нет - не создаем автоматически, только загружаем
        setProfile(null);
      }
    } catch (error) {
      console.error("Ошибка загрузки профиля:", error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Создать новый профиль (вызывается только через форму на welcome странице)
   */
  const createProfile = useCallback(
    (data: { name: string; avatarId: AvatarId }): void => {
      try {
        // При создании нового профиля очищаем состояние игры
        gameStateService.deleteGameState();
        const newProfile = userStorageService.createProfile({
          name: data.name,
          avatarId: data.avatarId,
        });
        setProfile(newProfile);
      } catch (error) {
        console.error("Ошибка создания профиля:", error);
        throw error;
      }
    },
    []
  );

  const updateName = useCallback(
    (name: string): void => {
      if (!profile) return;

      const trimmedName = name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 20) {
        return;
      }

      const updated = userStorageService.updateProfile({
        ...profile,
        name: trimmedName,
      });
      setProfile(updated);
    },
    [profile]
  );

  const updateAvatar = useCallback(
    (avatarId: AvatarId): void => {
      if (!profile) return;

      // Валидация avatarId
      if (!AvatarValidator.isValidId(avatarId)) {
        console.warn(`Невалидный avatarId: ${avatarId}`);
        return;
      }

      const updated = userStorageService.updateProfile({
        ...profile,
        avatarId,
      });
      setProfile(updated);
    },
    [profile]
  );

  const updateCharacterClass = useCallback(
    (characterClass: "SURVIVOR" | "EXPLORER" | "COLLECTOR"): void => {
      if (!profile) return;

      const updated = userStorageService.updateProfile({
        ...profile,
        selectedCharacterClass: characterClass,
      });
      setProfile(updated);
    },
    [profile]
  );

  /**
   * Получить доступные очки навыков
   * За каждые 10 уровней персонажа начисляется 10 очков
   */
  const getAvailableSkillPoints = useCallback((): number => {
    const gameState = gameStateService.loadGameState();
    if (!gameState) return 0;

    const playerLevel = gameState.player.stats.level;
    const earnedPoints = Math.floor(playerLevel / 10) * 10; // 10 очков за каждые 10 уровней
    const spentPoints = profile?.spentSkillPoints ?? 0;

    return Math.max(0, earnedPoints - spentPoints);
  }, [profile]);

  /**
   * Прокачка стамины за очки навыков
   * Стоимость: 10 очков навыков за 1 улучшение
   * Максимум: 5 улучшений (+50 стамины)
   */
  const upgradeStamina = useCallback((): boolean => {
    if (!profile) return false;

    const currentUpgrades = profile.staminaUpgrades ?? 0;
    const spentPoints = profile.spentSkillPoints ?? 0;
    const maxUpgrades = 5;
    const costPerUpgrade = 10; // 10 очков навыков за улучшение

    if (currentUpgrades >= maxUpgrades) {
      return false; // Уже максимум
    }

    const availablePoints = getAvailableSkillPoints();
    if (availablePoints < costPerUpgrade) {
      return false; // Недостаточно очков навыков
    }

    // Обновляем профиль - тратим очки навыков
    const updated = userStorageService.updateProfile({
      ...profile,
      staminaUpgrades: currentUpgrades + 1,
      spentSkillPoints: spentPoints + costPerUpgrade,
    });
    setProfile(updated);

    // Обновляем maxStamina в gameState
    const gameState = gameStateService.loadGameState();
    if (gameState) {
      // Определяем базовую стамину из класса персонажа
      let baseMaxStamina = 100; // Значение по умолчанию
      if (updated.selectedCharacterClass) {
        const preset = CHARACTER_PRESETS[updated.selectedCharacterClass];
        if (preset) {
          baseMaxStamina = preset.stats.maxStamina;
        }
      }

      // Вычисляем новую максимальную стамину с учетом бонуса
      const newMaxStamina = baseMaxStamina + (currentUpgrades + 1) * 10;
      const currentStamina = gameState.player.stats.stamina;
      const currentMaxStamina = gameState.player.stats.maxStamina;
      const staminaDifference = newMaxStamina - currentMaxStamina;

      // Сохраняем все важные флаги состояния игры
      const newGameState = {
        ...gameState,
        isGameStarted: gameState.isGameStarted, // Сохраняем флаг запущенной игры
        isPaused: gameState.isPaused,
        player: {
          ...gameState.player,
          stats: {
            ...gameState.player.stats,
            maxStamina: newMaxStamina,
            // Увеличиваем текущую стамину на разницу, но не больше максимума
            stamina: Math.min(currentStamina + staminaDifference, newMaxStamina),
          },
        },
      };
      gameStateService.saveGameState(newGameState);
    }

    return true;
  }, [profile, getAvailableSkillPoints]);

  const resetProfile = useCallback((): void => {
    userStorageService.resetProfile();
    const newProfile = userStorageService.createProfile({
      name: "Игрок",
      avatarId: DEFAULT_AVATAR_ID,
    });
    setProfile(newProfile);
  }, []);

  const deleteAccount = useCallback((): void => {
    userStorageService.deleteAccount();
    setProfile(null);
  }, []);

  return {
    profile,
    isLoading,
    createProfile,
    updateName,
    updateAvatar,
    updateCharacterClass,
    upgradeStamina,
    getAvailableSkillPoints,
    resetProfile,
    deleteAccount,
  };
};
