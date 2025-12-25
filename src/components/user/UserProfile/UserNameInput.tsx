/**
 * Компонент ввода имени пользователя
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import styles from "./UserNameInput.module.css";

export interface UserNameInputProps {
  readonly currentName: string;
  readonly onSave: (name: string) => void;
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
 * Компонент ввода имени пользователя
 */
export const UserNameInput: React.FC<UserNameInputProps> = ({
  currentName,
  onSave,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (): void => {
    setIsEditing(true);
    setName(currentName);
    setError(null);
  };

  const handleCancel = (): void => {
    setIsEditing(false);
    setName(currentName);
    setError(null);
  };

  const handleSave = useCallback((): void => {
    const trimmedName = name.trim();

    if (trimmedName.length < MIN_NAME_LENGTH) {
      setError(`Имя должно содержать минимум ${MIN_NAME_LENGTH} символа`);
      return;
    }

    if (trimmedName.length > MAX_NAME_LENGTH) {
      setError(`Имя должно содержать максимум ${MAX_NAME_LENGTH} символов`);
      return;
    }

    onSave(trimmedName);
    setIsEditing(false);
    setError(null);
  }, [name, onSave]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div className={`${styles.userNameInput} ${className || ""}`}>
        <div className={styles.userNameInput__display}>
          <span className={styles.userNameInput__name}>{currentName}</span>
          <Button variant="secondary" onClick={handleEdit}>
            Изменить
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.userNameInput} ${className || ""}`}>
      <div className={styles.userNameInput__edit}>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          className={styles.userNameInput__input}
          placeholder="Введите имя"
          maxLength={MAX_NAME_LENGTH}
          autoFocus
        />
        {error && <p className={styles.userNameInput__error}>{error}</p>}
        <div className={styles.userNameInput__actions}>
          <Button variant="secondary" onClick={handleCancel}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
};

