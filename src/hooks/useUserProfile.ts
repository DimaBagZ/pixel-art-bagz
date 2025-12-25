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

export interface UseUserProfileReturn {
  readonly profile: UserProfile | null;
  readonly isLoading: boolean;
  readonly createProfile: (data: { name: string; avatarId: AvatarId }) => void;
  readonly updateName: (name: string) => void;
  readonly updateAvatar: (avatarId: AvatarId) => void;
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
    resetProfile,
    deleteAccount,
  };
};

