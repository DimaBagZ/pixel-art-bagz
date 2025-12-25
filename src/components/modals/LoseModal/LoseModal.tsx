/**
 * Модальное окно проигрыша
 * Соблюдает принцип Single Responsibility
 */

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import styles from "./LoseModal.module.css";

export interface LoseModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onPlayAgain: () => void;
  readonly isDraw?: boolean;
}

/**
 * Компонент модального окна проигрыша или ничьей
 */
export const LoseModal: React.FC<LoseModalProps> = ({
  isOpen,
  onClose,
  onPlayAgain,
  isDraw = false,
}) => {
  const handlePlayAgain = (): void => {
    onPlayAgain();
    onClose();
  };

  const title: string = isDraw
    ? "🤝 Ничья!"
    : "😊 Не расстраивайтесь!";

  const subtitle: string = isDraw
    ? "Никто не выиграл в этот раз. Попробуйте еще раз!"
    : "Компьютер выиграл в этот раз, но вы можете попробовать снова!";

  const encouragement: string = isDraw
    ? "Следующая игра может принести победу! 🎯"
    : "Каждая игра — это новый шанс на победу! 💪";

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.loseModal}>
      <div className={styles.loseModal__content}>
        <div className={styles.loseModal__header}>
          <h2 className={styles.loseModal__title}>{title}</h2>
          <p className={styles.loseModal__subtitle}>{subtitle}</p>
          <p className={styles.loseModal__encouragement}>{encouragement}</p>
        </div>

        <div className={styles.loseModal__actions}>
          <Button variant="primary" onClick={handlePlayAgain}>
            Сыграть еще раз
          </Button>
        </div>
      </div>
    </Modal>
  );
};

