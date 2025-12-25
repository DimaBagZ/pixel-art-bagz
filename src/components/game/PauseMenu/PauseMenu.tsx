/**
 * Компонент меню паузы
 * Соблюдает принцип Single Responsibility
 */

"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import styles from "./PauseMenu.module.css";

export interface PauseMenuProps {
  readonly isOpen: boolean;
  readonly onResume: () => void;
  readonly onSaveAndExit: () => void;
  readonly onExit: () => void;
}

/**
 * Компонент меню паузы
 */
export const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  onResume,
  onSaveAndExit,
  onExit,
}) => {
  // Обработка клавиши ESC
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        onResume();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onResume]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.pauseMenu}>
      <div className={styles.pauseMenu__overlay} onClick={onResume} />
      <div className={styles.pauseMenu__content}>
        <h2 className={styles.pauseMenu__title}>Пауза</h2>
        <div className={styles.pauseMenu__buttons}>
          <Button variant="primary" onClick={onResume} className={styles.pauseMenu__button}>
            Продолжить
          </Button>
          <Button variant="secondary" onClick={onSaveAndExit} className={styles.pauseMenu__button}>
            Сохранить и выйти
          </Button>
          <Button variant="outline" onClick={onExit} className={styles.pauseMenu__button}>
            Выход в меню
          </Button>
        </div>
        <div className={styles.pauseMenu__hint}>
          Нажмите ESC для продолжения
        </div>
      </div>
    </div>
  );
};

