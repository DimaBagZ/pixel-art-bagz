/**
 * Модальное окно победы
 * Соблюдает принцип Single Responsibility
 */

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { PromoCode } from "@/components/ui/PromoCode";
import { Button } from "@/components/ui/Button";
import styles from "./WinModal.module.css";

export interface WinModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onPlayAgain: () => void;
  readonly promoCode: string;
}

/**
 * Компонент модального окна победы
 */
export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  onClose,
  onPlayAgain,
  promoCode,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Ошибка копирования:", error);
    }
  };

  const handlePlayAgain = (): void => {
    onPlayAgain();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.winModal}>
      <div className={styles.winModal__content}>
        <div className={styles.winModal__header}>
          <h2 className={styles.winModal__title}>🎉 Поздравляем!</h2>
          <p className={styles.winModal__subtitle}>
            Вы выиграли! Получите промокод на скидку:
          </p>
        </div>

        <div className={styles.winModal__promo}>
          <PromoCode code={promoCode} />
        </div>

        <div className={styles.winModal__actions}>
          <Button
            variant="outline"
            onClick={handleCopy}
            className={styles.winModal__copyButton}
          >
            {copied ? "✓ Скопировано!" : "📋 Копировать"}
          </Button>
          <Button variant="primary" onClick={handlePlayAgain}>
            Сыграть еще раз
          </Button>
        </div>
      </div>
    </Modal>
  );
};
