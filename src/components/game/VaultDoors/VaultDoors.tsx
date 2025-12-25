/**
 * Компонент ворот бункера
 * Соблюдает принцип Single Responsibility
 */

"use client";

import React, { useState, useEffect } from "react";
import { VaultNut } from "./VaultNut";
import { VaultDoorPanel } from "./VaultDoorPanel";
import styles from "./VaultDoors.module.css";

export interface VaultDoorsProps {
  readonly isOpen: boolean;
  readonly hasSavedGame: boolean;
  readonly onOpen: () => void;
  readonly onClose?: () => void;
}

/**
 * Компонент ворот бункера с анимацией
 */
export const VaultDoors: React.FC<VaultDoorsProps> = ({
  isOpen,
  hasSavedGame,
  onOpen,
  onClose,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Завершение анимации через время анимации CSS
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1000); // Время анимации из CSS

      return () => {
        clearTimeout(timer);
      };
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleNutClick = (): void => {
    if (!isOpen && !isAnimating) {
      setIsAnimating(true);
      onOpen();
    }
  };

  return (
    <div className={styles.vaultDoors}>
      {/* Левая панель */}
      <VaultDoorPanel
        side="left"
        isOpen={isOpen}
        isAnimating={isAnimating}
      >
        {/* Кнопка привязана к левой панели */}
        {!isOpen && (
          <div className={styles.vaultDoors__buttonContainer}>
            <VaultNut
              hasSavedGame={hasSavedGame}
              onClick={handleNutClick}
              isAnimating={isAnimating}
            />
          </div>
        )}
      </VaultDoorPanel>

      {/* Правая панель */}
      <VaultDoorPanel
        side="right"
        isOpen={isOpen}
        isAnimating={isAnimating}
      />

      {/* Гайка посередине (когда ворота закрыты) */}
      {!isOpen && (
        <div className={styles.vaultDoors__centerNut}>
          <VaultNut
            hasSavedGame={hasSavedGame}
            onClick={handleNutClick}
            isAnimating={isAnimating}
          />
        </div>
      )}
    </div>
  );
};

