/**
 * Компонент выбора аватара
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import React, { useState } from "react";
import type { AvatarId } from "@/domain/avatar/AvatarPreset";
import { AvatarRegistry } from "@/domain/avatar/AvatarRegistry";
import { UserAvatar } from "./UserAvatar";
import { Button } from "@/components/ui/Button";
import styles from "./AvatarSelector.module.css";

export interface AvatarSelectorProps {
  readonly currentAvatarId: AvatarId;
  readonly onSelect: (avatarId: AvatarId) => void;
  readonly onCancel?: () => void;
}

/**
 * Компонент селектора аватара
 */
export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  currentAvatarId,
  onSelect,
  onCancel,
}) => {
  const [selectedId, setSelectedId] = useState<AvatarId>(currentAvatarId);
  const avatars = AvatarRegistry.getAll();

  const handleSelect = (): void => {
    onSelect(selectedId);
  };

  const handleCancel = (): void => {
    if (onCancel) {
      onCancel();
    } else {
      setSelectedId(currentAvatarId);
    }
  };

  const selectedAvatar = AvatarRegistry.getById(selectedId);

  return (
    <div className={styles.avatarSelector}>
      <div className={styles.avatarSelector__preview}>
        <UserAvatar
          avatarId={selectedId}
          size="large"
          showBorder={true}
        />
        <p className={styles.avatarSelector__previewName}>
          {selectedAvatar?.metadata.name || "Неизвестный"}
        </p>
      </div>

      <div className={styles.avatarSelector__grid}>
        {avatars.map((avatar) => {
          const isSelected = selectedId === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              className={`${styles.avatarSelector__item} ${
                isSelected ? styles["avatarSelector__item--selected"] : ""
              }`}
              onClick={() => setSelectedId(avatar.id)}
              aria-label={`Выбрать аватар: ${avatar.metadata.name}`}
              aria-pressed={isSelected}
            >
              <UserAvatar
                avatarId={avatar.id}
                size="medium"
                showBorder={true}
              />
            </button>
          );
        })}
      </div>

      <div className={styles.avatarSelector__actions}>
        <Button variant="secondary" onClick={handleCancel}>
          Отмена
        </Button>
        <Button variant="primary" onClick={handleSelect}>
          Выбрать
        </Button>
      </div>
    </div>
  );
};

