/**
 * Компонент преимуществ игры
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import React from "react";
import styles from "./WelcomeFeatures.module.css";

export interface Feature {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

export interface WelcomeFeaturesProps {
  readonly className?: string;
}

/**
 * Список преимуществ игры
 */
const FEATURES: readonly Feature[] = [
  {
    icon: "🗺️",
    title: "Исследование бункера",
    description: "Исследуй огромную карту 40x40 тайлов, находи секреты и собирай ценные предметы",
  },
  {
    icon: "💰",
    title: "Система монет и опыта",
    description: "Собирай монеты для опыта, находи редкие предметы и повышай свой уровень",
  },
  {
    icon: "📦",
    title: "Инвентарь и коллекции",
    description: "Управляй инвентарем на 10 слотов, собирай редкие предметы и следи за заполненностью",
  },
  {
    icon: "⚡",
    title: "Система стамины",
    description: "Беги быстрее, но следи за стаминой. Стратегически планируй свои перемещения",
  },
  {
    icon: "📊",
    title: "Статистика и достижения",
    description: "Отслеживай свой прогресс, разблокируй достижения и улучшай результаты",
  },
  {
    icon: "🎨",
    title: "Пиксель-арт стиль",
    description: "Мрачная атмосфера Fallout с пиксель-арт графикой и терминальным интерфейсом",
  },
] as const;

/**
 * Компонент преимуществ игры
 */
export const WelcomeFeatures: React.FC<WelcomeFeaturesProps> = ({
  className = "",
}) => {
  return (
    <section className={`${styles.welcomeFeatures} ${className}`}>
      <h2 className={styles.welcomeFeatures__title}>Почему стоит играть?</h2>
      <div className={styles.welcomeFeatures__grid}>
        {FEATURES.map((feature, index) => (
          <div
            key={index}
            className={styles.welcomeFeatures__item}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={styles.welcomeFeatures__itemIcon}>
              {feature.icon}
            </div>
            <h3 className={styles.welcomeFeatures__itemTitle}>
              {feature.title}
            </h3>
            <p className={styles.welcomeFeatures__itemDescription}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

