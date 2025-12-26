/**
 * Компонент мобильного меню (бургер-меню)
 * Для мобильной версии игры
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/user/UserAvatar";
import { Button } from "@/components/ui/Button";
import { StatsIcon } from "@/components/ui/StatsIcon";
import type { AvatarId } from "@/domain/avatar/AvatarPreset";
import styles from "./MobileMenu.module.css";

export interface MobileMenuProps {
  readonly avatarId: AvatarId;
  readonly userName: string;
  readonly onSaveAndNavigate?: (path: string) => void;
  readonly onPause?: () => void;
  readonly showPauseButton?: boolean;
}

/**
 * Компонент мобильного меню
 */
export const MobileMenu: React.FC<MobileMenuProps> = ({
  avatarId,
  userName,
  onSaveAndNavigate,
  onPause,
  showPauseButton = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (): void => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = (): void => {
    setIsOpen(false);
  };

  const handleLinkClick = (path: string): void => {
    if (onSaveAndNavigate) {
      onSaveAndNavigate(path);
    }
    handleClose();
  };

  const handlePause = (): void => {
    if (onPause) {
      onPause();
    }
    handleClose();
  };

  return (
    <>
      {/* Кнопка бургер-меню */}
      <button
        className={`${styles.burgerButton} ${isOpen ? styles.burgerButton__active : ""}`}
        onClick={handleToggle}
        aria-label="Меню"
        aria-expanded={isOpen}
      >
        <span className={styles.burgerButton__line}></span>
        <span className={styles.burgerButton__line}></span>
        <span className={styles.burgerButton__line}></span>
      </button>

      {/* Оверлей */}
      {isOpen && (
        <div className={styles.overlay} onClick={handleClose} aria-hidden="true" />
      )}

      {/* Меню */}
      <div className={`${styles.menu} ${isOpen ? styles.menu__open : ""}`}>
        <div className={styles.menu__header}>
          <UserAvatar avatarId={avatarId} size="medium" showBorder={true} />
          <span className={styles.menu__userName}>{userName}</span>
        </div>

        <div className={styles.menu__content}>
          {showPauseButton && onPause && (
            <Button
              variant="outline"
              onClick={handlePause}
              className={styles.menu__button}
            >
              ⏸ Пауза
            </Button>
          )}

          <Link
            href="/dashboard"
            className={styles.menu__link}
            onClick={() => handleLinkClick("/dashboard")}
          >
            <Button variant="outline" className={styles.menu__button}>
              <StatsIcon />
              Статистика
            </Button>
          </Link>

          <Link
            href="/profile"
            className={styles.menu__link}
            onClick={() => handleLinkClick("/profile")}
          >
            <Button variant="outline" className={styles.menu__button}>
              Профиль
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};
