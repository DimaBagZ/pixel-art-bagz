/**
 * Компонент отображения аватара пользователя
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import React from "react";
import type { AvatarId } from "@/domain/avatar/AvatarPreset";
import { AvatarRegistry } from "@/domain/avatar/AvatarRegistry";
import styles from "./UserAvatar.module.css";

/**
 * Версия аватаров для обхода кэша браузера
 * В dev режиме используем "dev" для обхода кэша, в production - фиксированную версию
 */
const AVATAR_VERSION = process.env.NODE_ENV === "development" 
  ? "?v=dev&nocache=1" 
  : "?v=1.0";

export interface UserAvatarProps {
  readonly avatarId: AvatarId;
  readonly size?: "small" | "medium" | "large";
  readonly className?: string;
  readonly showBorder?: boolean;
}

/**
 * Размеры аватаров в пикселях
 */
const SIZE_MAP = {
  small: 40,
  medium: 64,
  large: 120,
} as const;

/**
 * Компонент аватара пользователя
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarId,
  size = "medium",
  className,
  showBorder = false,
}) => {
  const avatar = AvatarRegistry.getById(avatarId);

  // Добавляем версию к URL для обхода кэша браузера
  const avatarUrl = avatar ? `${avatar.metadata.url}${AVATAR_VERSION}` : "";

  if (!avatar) {
    // Fallback на дефолтный аватар
    return (
      <div
        className={`${styles.userAvatar} ${styles[`userAvatar--${size}`]} ${
          showBorder ? styles["userAvatar--bordered"] : ""
        } ${className || ""}`}
      >
        <span className={styles.userAvatar__fallback}>👤</span>
      </div>
    );
  }

  return (
    <div
      className={`${styles.userAvatar} ${styles[`userAvatar--${size}`]} ${
        showBorder ? styles["userAvatar--bordered"] : ""
      } ${className || ""}`}
    >
      <img
        src={avatarUrl}
        alt={avatar.metadata.name}
        width={SIZE_MAP[size]}
        height={SIZE_MAP[size]}
        className={styles.userAvatar__image}
        loading={size === "large" ? "eager" : "lazy"}
        key={avatarUrl} // Добавляем key для принудительного обновления при изменении URL
      />
    </div>
  );
};

