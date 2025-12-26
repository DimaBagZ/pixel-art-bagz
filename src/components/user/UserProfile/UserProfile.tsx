/**
 * Компонент профиля пользователя
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useGameState } from "@/hooks/useGameState";
import { UserAvatar } from "../UserAvatar/UserAvatar";
import { AvatarSelector } from "../UserAvatar/AvatarSelector";
import { UserNameInput } from "./UserNameInput";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { AvatarId } from "@/domain/avatar/AvatarPreset";
import { AvatarValidator } from "@/domain/avatar/AvatarValidator";
import styles from "./UserProfile.module.css";

/**
 * Компонент профиля пользователя
 */
export const UserProfile: React.FC = () => {
  const router = useRouter();
  const { profile, updateName, updateAvatar, upgradeStamina, getAvailableSkillPoints, deleteAccount } = useUserProfile();
  const { savedState } = useGameState();
  const availableSkillPoints = getAvailableSkillPoints();
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!profile) {
    return (
      <div className={styles.userProfile}>
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  const handleAvatarSelect = (avatarId: AvatarId): void => {
    updateAvatar(avatarId);
    setShowAvatarSelector(false);
  };

  const handleDeleteAccount = (): void => {
    deleteAccount();
    setShowDeleteConfirm(false);
    router.push("/welcome");
  };

  // Валидация avatarId из профиля
  const validAvatarId: AvatarId =
    AvatarValidator.validateAndNormalize(profile.avatarId) || "avatar-01";

  return (
    <div className={styles.userProfile}>
      <div className={styles.userProfile__header}>
        <h2 className={styles.userProfile__title}>Мой профиль</h2>
      </div>

      <div className={styles.userProfile__content}>
        {/* Аватар */}
        <div className={styles.userProfile__avatarSection}>
          <div className={styles.userProfile__avatarWrapper}>
            <UserAvatar avatarId={validAvatarId} size="large" showBorder={true} />
            <button
              type="button"
              className={styles.userProfile__avatarButton}
              onClick={() => setShowAvatarSelector(true)}
            >
              ✏️ Выбрать другой аватар
            </button>
          </div>
        </div>

        {/* Имя */}
        <div className={styles.userProfile__nameSection}>
          <UserNameInput currentName={profile.name} onSave={updateName} />
        </div>

        {/* Выбранный персонаж */}
        {profile.selectedCharacterClass && (
          <div className={styles.userProfile__characterSection}>
            <h3 className={styles.userProfile__characterTitle}>🎭 Выбранный персонаж</h3>
            <div className={styles.userProfile__characterCard}>
              {profile.selectedCharacterClass === "SURVIVOR" && (
                <>
                  <span className={styles.userProfile__characterIcon}>🛡️</span>
                  <div className={styles.userProfile__characterInfo}>
                    <span className={styles.userProfile__characterName}>Выживальщик</span>
                    <span className={styles.userProfile__characterDesc}>
                      Высокое здоровье (120) и стамина (100)
                    </span>
                  </div>
                </>
              )}
              {profile.selectedCharacterClass === "EXPLORER" && (
                <>
                  <span className={styles.userProfile__characterIcon}>🗺️</span>
                  <div className={styles.userProfile__characterInfo}>
                    <span className={styles.userProfile__characterName}>Исследователь</span>
                    <span className={styles.userProfile__characterDesc}>
                      Баланс: здоровье (100) и стамина (120)
                    </span>
                  </div>
                </>
              )}
              {profile.selectedCharacterClass === "COLLECTOR" && (
                <>
                  <span className={styles.userProfile__characterIcon}>⚡</span>
                  <div className={styles.userProfile__characterInfo}>
                    <span className={styles.userProfile__characterName}>Собиратель</span>
                    <span className={styles.userProfile__characterDesc}>
                      Высокая стамина (150), здоровье (80)
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Прокачка стамины */}
        <div className={styles.userProfile__upgradeSection}>
          <h3 className={styles.userProfile__upgradeTitle}>⚡ Улучшения персонажа</h3>
          
          {/* Очки навыков */}
          <div className={styles.userProfile__skillPoints}>
            <span className={styles.userProfile__skillPointsIcon}>✨</span>
            <span className={styles.userProfile__skillPointsLabel}>Очки навыков:</span>
            <span className={styles.userProfile__skillPointsValue}>{availableSkillPoints}</span>
            {savedState && (
              <span className={styles.userProfile__skillPointsInfo}>
                (уровень {savedState.player.stats.level}, следующие очки на {Math.ceil((savedState.player.stats.level + 1) / 10) * 10} ур.)
              </span>
            )}
          </div>

          <div className={styles.userProfile__upgradeCard}>
            <div className={styles.userProfile__upgradeInfo}>
              <span className={styles.userProfile__upgradeIcon}>💚</span>
              <div className={styles.userProfile__upgradeText}>
                <span className={styles.userProfile__upgradeName}>Выносливость</span>
                <span className={styles.userProfile__upgradeDesc}>
                  +10 к максимальной стамине (стоит 10 очков)
                </span>
              </div>
            </div>
            <div className={styles.userProfile__upgradeStats}>
              <div className={styles.userProfile__upgradeLevel}>
                Улучшений: {profile.staminaUpgrades ?? 0} / 5
              </div>
              <div className={styles.userProfile__upgradeBonus}>
                Бонус: +{(profile.staminaUpgrades ?? 0) * 10} стамины
              </div>
              <div className={styles.userProfile__upgradeBonus}>
                Макс. стамина: {100 + (profile.staminaUpgrades ?? 0) * 10}
              </div>
            </div>
            {(profile.staminaUpgrades ?? 0) < 5 && (
              <Button
                variant="primary"
                onClick={() => {
                  const success = upgradeStamina();
                  if (!success) {
                    alert("Недостаточно очков навыков! Нужно 10 очков.");
                  }
                }}
                className={styles.userProfile__upgradeButton}
                disabled={availableSkillPoints < 10}
              >
                Улучшить за 10 очков
              </Button>
            )}
            {(profile.staminaUpgrades ?? 0) >= 5 && (
              <div className={styles.userProfile__upgradeMax}>✅ Максимум</div>
            )}
          </div>
        </div>

        {/* Удаление аккаунта */}
        <div className={styles.userProfile__dangerSection}>
          <h3 className={styles.userProfile__dangerTitle}>Опасная зона</h3>
          <p className={styles.userProfile__dangerDescription}>
            Удаление аккаунта приведет к полному удалению вашего профиля, статистики, истории игр и всех достижений. Это действие нельзя отменить.
          </p>
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className={styles.userProfile__deleteButton}
          >
            🗑️ Удалить аккаунт
          </Button>
        </div>
      </div>

      {/* Модальное окно выбора аватара */}
      {showAvatarSelector && (
        <Modal
          isOpen={showAvatarSelector}
          onClose={() => setShowAvatarSelector(false)}
          className={styles.userProfile__modal}
        >
          <AvatarSelector
            currentAvatarId={validAvatarId}
            onSelect={handleAvatarSelect}
            onCancel={() => setShowAvatarSelector(false)}
          />
        </Modal>
      )}

      {/* Модальное окно подтверждения удаления */}
      {showDeleteConfirm && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          className={styles.userProfile__modal}
        >
          <div className={styles.userProfile__deleteConfirm}>
            <h3 className={styles.userProfile__deleteConfirmTitle}>
              ⚠️ Подтверждение удаления аккаунта
            </h3>
            <p className={styles.userProfile__deleteConfirmText}>
              Вы уверены, что хотите удалить свой аккаунт? Это действие удалит:
            </p>
            <ul className={styles.userProfile__deleteConfirmList}>
              <li>Ваш профиль</li>
              <li>Всю статистику игр</li>
              <li>Историю игр</li>
              <li>Все достижения</li>
            </ul>
            <p className={styles.userProfile__deleteConfirmWarning}>
              Это действие нельзя отменить!
            </p>
            <div className={styles.userProfile__deleteConfirmActions}>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteAccount}
                className={styles.userProfile__deleteConfirmButton}
              >
                Да, удалить аккаунт
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
