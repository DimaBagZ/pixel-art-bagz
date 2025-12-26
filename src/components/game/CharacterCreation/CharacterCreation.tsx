/**
 * Компонент создания персонажа
 * Выбор характеристик при первом запуске
 * Соблюдает принцип Single Responsibility
 */

"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { PlayerStats } from "@/types/pixel-art-game.types";
import styles from "./CharacterCreation.module.css";

export interface CharacterCreationProps {
  readonly isOpen: boolean;
  readonly onComplete: (stats: PlayerStats, characterClass: CharacterClass) => void;
  readonly onCancel?: () => void;
}

/**
 * Типы характеристик персонажа
 */
export type CharacterClass = "SURVIVOR" | "EXPLORER" | "COLLECTOR";

interface CharacterPreset {
  readonly name: string;
  readonly description: string;
  readonly stats: Omit<PlayerStats, "level" | "experience" | "experienceToNextLevel">;
}

export const CHARACTER_PRESETS: Record<CharacterClass, CharacterPreset> = {
  SURVIVOR: {
    name: "Выживальщик",
    description: "Высокое здоровье и стамина. Идеально для долгих исследований.",
    stats: {
      health: 120,
      maxHealth: 120,
      stamina: 100,
      maxStamina: 100,
    },
  },
  EXPLORER: {
    name: "Исследователь",
    description: "Баланс между здоровьем и стаминой. Универсальный выбор.",
    stats: {
      health: 100,
      maxHealth: 100,
      stamina: 120,
      maxStamina: 120,
    },
  },
  COLLECTOR: {
    name: "Собиратель",
    description: "Высокая стамина для быстрого перемещения. Больше предметов за меньшее время.",
    stats: {
      health: 80,
      maxHealth: 80,
      stamina: 150,
      maxStamina: 150,
    },
  },
};

/**
 * Компонент создания персонажа
 */
export const CharacterCreation: React.FC<CharacterCreationProps> = ({
  isOpen,
  onComplete,
  onCancel,
}) => {
  const [selectedClass, setSelectedClass] = useState<CharacterClass>("EXPLORER");

  const handleSelectClass = useCallback((characterClass: CharacterClass): void => {
    setSelectedClass(characterClass);
  }, []);

  const handleConfirm = useCallback((): void => {
    const preset = CHARACTER_PRESETS[selectedClass];
    const stats: PlayerStats = {
      ...preset.stats,
      level: 1,
      experience: 0,
      experienceToNextLevel: 10,
    };
    onComplete(stats, selectedClass);
  }, [selectedClass, onComplete]);

  if (!isOpen) {
    return null;
  }

  const selectedPreset = CHARACTER_PRESETS[selectedClass];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onCancel || (() => {})}
      className={styles.characterCreationModal}
      closeOnOverlayClick={false}
    >
      <div className={styles.characterCreation}>
        <h2 className={styles.characterCreation__title}>Создание персонажа</h2>
        <p className={styles.characterCreation__subtitle}>
          Выберите класс персонажа для начала игры
        </p>

        <div className={styles.characterCreation__classes}>
          {(Object.keys(CHARACTER_PRESETS) as CharacterClass[]).map((characterClass) => {
            const preset = CHARACTER_PRESETS[characterClass];
            const isSelected = selectedClass === characterClass;

            return (
              <button
                key={characterClass}
                type="button"
                className={`${styles.characterCreation__class} ${
                  isSelected ? styles["characterCreation__class--selected"] : ""
                }`}
                onClick={() => handleSelectClass(characterClass)}
              >
                <h3 className={styles.characterCreation__className}>{preset.name}</h3>
                <p className={styles.characterCreation__classDescription}>
                  {preset.description}
                </p>
                <div className={styles.characterCreation__stats}>
                  <div className={styles.characterCreation__stat}>
                    <span className={styles.characterCreation__statLabel}>Здоровье:</span>
                    <span className={styles.characterCreation__statValue}>
                      {preset.stats.maxHealth}
                    </span>
                  </div>
                  <div className={styles.characterCreation__stat}>
                    <span className={styles.characterCreation__statLabel}>Стамина:</span>
                    <span className={styles.characterCreation__statValue}>
                      {preset.stats.maxStamina}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className={styles.characterCreation__actions}>
          <Link href="/profile" className={styles.characterCreation__profileLink}>
            <Button variant="outline">
              Профиль
            </Button>
          </Link>
          <div className={styles.characterCreation__actionsRight}>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Отмена
              </Button>
            )}
            <Button variant="primary" onClick={handleConfirm}>
              Начать игру
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

