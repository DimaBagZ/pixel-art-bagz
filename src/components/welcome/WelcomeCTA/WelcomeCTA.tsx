/**
 * Компонент призыва к действию с формой настройки
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import React, { useState, useCallback } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { AvatarSelector } from "@/components/user/UserAvatar/AvatarSelector";
import { UserAvatar } from "@/components/user/UserAvatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { AvatarId } from "@/domain/avatar/AvatarPreset";
import { AvatarValidator } from "@/domain/avatar/AvatarValidator";
import styles from "./WelcomeCTA.module.css";

export interface WelcomeCTAProps {
  readonly onComplete: () => void;
  readonly className?: string;
}

/**
 * Минимальная длина имени
 */
const MIN_NAME_LENGTH = 2;

/**
 * Максимальная длина имени
 */
const MAX_NAME_LENGTH = 20;

/**
 * Компонент призыва к действию
 */
export const WelcomeCTA: React.FC<WelcomeCTAProps> = ({ onComplete, className = "" }) => {
  const { createProfile } = useUserProfile();

  // Используем фиксированный дефолтный аватар вместо случайного для избежания hydration mismatch
  const DEFAULT_AVATAR_ID: AvatarId = "avatar-01";
  const [name, setName] = useState<string>("");
  const [avatarId, setAvatarId] = useState<AvatarId>(DEFAULT_AVATAR_ID);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (value.length <= MAX_NAME_LENGTH) {
      setName(value);
      setError(null);
    }
  }, []);

  const handleAvatarSelect = useCallback((selectedAvatarId: AvatarId): void => {
    setAvatarId(selectedAvatarId);
    setShowAvatarSelector(false);
  }, []);

  // Валидация avatarId
  const validAvatarId: AvatarId =
    AvatarValidator.validateAndNormalize(avatarId) || DEFAULT_AVATAR_ID;

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      setError(null);

      const trimmedName = name.trim();

      if (trimmedName.length < MIN_NAME_LENGTH) {
        setError(`Имя должно содержать минимум ${MIN_NAME_LENGTH} символа`);
        return;
      }

      if (trimmedName.length > MAX_NAME_LENGTH) {
        setError(`Имя должно содержать максимум ${MAX_NAME_LENGTH} символов`);
        return;
      }

      setIsSubmitting(true);

      try {
        // Валидация avatarId перед созданием профиля
        const currentValidAvatarId: AvatarId =
          AvatarValidator.validateAndNormalize(avatarId) || DEFAULT_AVATAR_ID;

        // Создать новый профиль
        createProfile({
          name: trimmedName,
          avatarId: currentValidAvatarId,
        });

        // Небольшая задержка для лучшего UX
        await new Promise((resolve) => setTimeout(resolve, 300));

        onComplete();
      } catch (err) {
        console.error("Ошибка создания профиля:", err);
        setError("Произошла ошибка при создании профиля");
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, avatarId, createProfile, onComplete]
  );

  return (
    <section className={`${styles.welcomeCTA} ${className}`}>
      <div className={styles.welcomeCTA__container}>
        <h2 className={styles.welcomeCTA__title}>Давайте настроим ваш профиль!</h2>
        <p className={styles.welcomeCTA__subtitle}>
          Заполните форму ниже, чтобы начать играть
        </p>

        <form onSubmit={handleSubmit} className={styles.welcomeCTA__form}>
          {/* Имя */}
          <div className={styles.welcomeCTA__field}>
            <label htmlFor="user-name" className={styles.welcomeCTA__label}>
              Ваше имя
            </label>
            <input
              id="user-name"
              type="text"
              value={name}
              onChange={handleNameChange}
              className={styles.welcomeCTA__input}
              placeholder="Введите ваше имя"
              maxLength={MAX_NAME_LENGTH}
              required
              autoFocus
            />
            <span className={styles.welcomeCTA__hint}>
              {name.length} / {MAX_NAME_LENGTH} символов
            </span>
          </div>

          {/* Аватар */}
          <div className={styles.welcomeCTA__field}>
            <label className={styles.welcomeCTA__label}>Ваш аватар</label>
            <div className={styles.welcomeCTA__avatarSection}>
              <UserAvatar avatarId={validAvatarId} size="large" showBorder={true} />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAvatarSelector(true)}
              >
                Выбрать аватар
              </Button>
            </div>
          </div>

          {/* Ошибка */}
          {error && (
            <div className={styles.welcomeCTA__error} role="alert">
              {error}
            </div>
          )}

          {/* Кнопка отправки */}
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || name.trim().length < MIN_NAME_LENGTH}
            className={styles.welcomeCTA__submit}
          >
            {isSubmitting ? "Сохранение..." : "Начать игру"}
          </Button>
        </form>
      </div>

      {/* Модальное окно выбора аватара */}
      {showAvatarSelector && (
        <Modal isOpen={showAvatarSelector} onClose={() => setShowAvatarSelector(false)}>
          <AvatarSelector
            currentAvatarId={validAvatarId}
            onSelect={handleAvatarSelect}
            onCancel={() => setShowAvatarSelector(false)}
          />
        </Modal>
      )}
    </section>
  );
};
