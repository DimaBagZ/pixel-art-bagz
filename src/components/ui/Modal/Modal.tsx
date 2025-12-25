/**
 * Базовый компонент модального окна
 * Соблюдает принцип Single Responsibility и DRY
 */

import React, { useEffect } from "react";
import styles from "./Modal.module.css";

export interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly children: React.ReactNode;
  readonly className?: string;
}

/**
 * Базовый компонент модального окна
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
}) => {
  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`${styles.modalOverlay} ${isOpen ? styles["modalOverlay--open"] : ""}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={`${styles.modal} ${className}`}>
        {children}
      </div>
    </div>
  );
};

