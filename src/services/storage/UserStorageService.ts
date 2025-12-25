/**
 * Сервис для работы с профилем пользователя
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import { defaultStorageService } from "./StorageService";
import { STORAGE_KEYS, STORAGE_VERSION } from "./StorageTypes";
import type { UserProfile, CreateProfileData, UserSettings } from "./StorageTypes";
import { AvatarValidator } from "@/domain/avatar/AvatarValidator";
import type { AvatarId } from "@/domain/avatar/AvatarPreset";

/**
 * Сервис для управления профилем пользователя
 */
export class UserStorageService {
  private readonly storage = defaultStorageService;

  /**
   * Получить профиль пользователя
   */
  getProfile(): UserProfile | null {
    const profile = this.storage.get<UserProfile>(STORAGE_KEYS.USER_PROFILE);

    if (!profile) {
      return null;
    }

    // Валидация структуры профиля
    if (!this.isValidProfile(profile)) {
      console.warn("Профиль пользователя поврежден, создается новый");
      this.storage.remove(STORAGE_KEYS.USER_PROFILE);
      return null;
    }

    // Миграция данных при необходимости
    return this.migrateProfile(profile);
  }

  /**
   * Создать новый профиль пользователя
   */
  createProfile(data: CreateProfileData): UserProfile {
    // Валидация avatarId
    const validAvatarId: AvatarId | null = AvatarValidator.validateAndNormalize(
      data.avatarId
    );
    if (!validAvatarId) {
      throw new Error(`Невалидный avatarId: ${data.avatarId}`);
    }

    const now = Date.now();
    const profile: UserProfile = {
      id: this.generateUUID(),
      name: data.name.trim(),
      avatarId: validAvatarId,
      createdAt: now,
      updatedAt: now,
      ...(data.preferredDifficulty && { preferredDifficulty: data.preferredDifficulty }),
      version: STORAGE_VERSION,
    };

    const saved = this.storage.set(STORAGE_KEYS.USER_PROFILE, profile);
    if (!saved) {
      throw new Error("Не удалось сохранить профиль пользователя");
    }

    return profile;
  }

  /**
   * Обновить профиль пользователя
   */
  updateProfile(profile: UserProfile): UserProfile {
    // Валидация avatarId
    const validAvatarId: AvatarId | null = AvatarValidator.validateAndNormalize(
      profile.avatarId
    );
    if (!validAvatarId) {
      throw new Error(`Невалидный avatarId: ${profile.avatarId}`);
    }

    const updatedProfile: UserProfile = {
      ...profile,
      avatarId: validAvatarId,
      updatedAt: Date.now(),
      version: STORAGE_VERSION,
    };

    const saved = this.storage.set(STORAGE_KEYS.USER_PROFILE, updatedProfile);
    if (!saved) {
      throw new Error("Не удалось обновить профиль пользователя");
    }

    return updatedProfile;
  }

  /**
   * Сбросить профиль пользователя
   */
  resetProfile(): void {
    this.storage.remove(STORAGE_KEYS.USER_PROFILE);
  }

  /**
   * Удалить аккаунт пользователя (удаляет профиль, статистику, историю игр и достижения)
   */
  deleteAccount(): void {
    // Удаляем профиль
    this.storage.remove(STORAGE_KEYS.USER_PROFILE);
    // Удаляем статистику
    this.storage.remove(STORAGE_KEYS.STATISTICS);
    // Удаляем историю игр
    this.storage.remove(STORAGE_KEYS.GAME_HISTORY);
    // Удаляем достижения
    this.storage.remove(STORAGE_KEYS.ACHIEVEMENTS);
    // Удаляем настройки (опционально, если они привязаны к аккаунту)
    this.storage.remove(STORAGE_KEYS.SETTINGS);
  }

  /**
   * Получить настройки пользователя
   */
  getSettings(): UserSettings | null {
    const settings = this.storage.get<UserSettings>(STORAGE_KEYS.SETTINGS);
    return settings || null;
  }

  /**
   * Обновить настройки пользователя
   */
  updateSettings(settings: UserSettings): UserSettings {
    const saved = this.storage.set(STORAGE_KEYS.SETTINGS, settings);
    if (!saved) {
      throw new Error("Не удалось сохранить настройки пользователя");
    }

    return settings;
  }

  /**
   * Валидация структуры профиля
   */
  private isValidProfile(profile: unknown): profile is UserProfile {
    if (typeof profile !== "object" || profile === null) {
      return false;
    }

    const p = profile as Record<string, unknown>;

    return (
      typeof p.id === "string" &&
      typeof p.name === "string" &&
      typeof p.avatarId === "string" &&
      typeof p.createdAt === "number" &&
      typeof p.updatedAt === "number" &&
      (typeof p.version === "number" || p.version === undefined)
    );
  }

  /**
   * Миграция профиля при изменении версии
   */
  private migrateProfile(profile: UserProfile): UserProfile {
    if (profile.version === STORAGE_VERSION) {
      return profile;
    }

    // Миграция на новую версию
    const migrated: UserProfile = {
      ...profile,
      version: STORAGE_VERSION,
    };

    // Сохранить мигрированный профиль
    this.storage.set(STORAGE_KEYS.USER_PROFILE, migrated);

    return migrated;
  }

  /**
   * Генерация UUID
   */
  private generateUUID(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  }
}

/**
 * Экземпляр сервиса по умолчанию
 */
export const userStorageService = new UserStorageService();
