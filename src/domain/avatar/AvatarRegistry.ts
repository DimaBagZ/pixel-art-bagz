/**
 * Реестр всех доступных аватаров
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

import type { AvatarPreset, AvatarId } from "./AvatarPreset";

/**
 * Реестр всех доступных аватаров
 */
const AVATARS: readonly AvatarPreset[] = [
  {
    id: "avatar-01",
    metadata: {
      id: "avatar-01",
      name: "Классический",
      url: "/avatars/avatar-01.svg",
      category: "classic",
    },
  },
  {
    id: "avatar-02",
    metadata: {
      id: "avatar-02",
      name: "Стильный",
      url: "/avatars/avatar-02.svg",
      category: "modern",
    },
  },
  {
    id: "avatar-03",
    metadata: {
      id: "avatar-03",
      name: "Элегантный",
      url: "/avatars/avatar-03.svg",
      category: "elegant",
    },
  },
  {
    id: "avatar-04",
    metadata: {
      id: "avatar-04",
      name: "Дружелюбный",
      url: "/avatars/avatar-04.svg",
      category: "friendly",
    },
  },
  {
    id: "avatar-05",
    metadata: {
      id: "avatar-05",
      name: "Яркий",
      url: "/avatars/avatar-05.svg",
      category: "vibrant",
    },
  },
  {
    id: "avatar-06",
    metadata: {
      id: "avatar-06",
      name: "Нежный",
      url: "/avatars/avatar-06.svg",
      category: "soft",
    },
  },
  {
    id: "avatar-07",
    metadata: {
      id: "avatar-07",
      name: "Современный",
      url: "/avatars/avatar-07.svg",
      category: "modern",
    },
  },
  {
    id: "avatar-08",
    metadata: {
      id: "avatar-08",
      name: "Романтичный",
      url: "/avatars/avatar-08.svg",
      category: "romantic",
    },
  },
  {
    id: "avatar-09",
    metadata: {
      id: "avatar-09",
      name: "Энергичный",
      url: "/avatars/avatar-09.svg",
      category: "energetic",
    },
  },
  {
    id: "avatar-10",
    metadata: {
      id: "avatar-10",
      name: "Спокойный",
      url: "/avatars/avatar-10.svg",
      category: "calm",
    },
  },
  {
    id: "avatar-11",
    metadata: {
      id: "avatar-11",
      name: "Игривый",
      url: "/avatars/avatar-11.svg",
      category: "playful",
    },
  },
  {
    id: "avatar-12",
    metadata: {
      id: "avatar-12",
      name: "Уверенный",
      url: "/avatars/avatar-12.svg",
      category: "confident",
    },
  },
  {
    id: "avatar-13",
    metadata: {
      id: "avatar-13",
      name: "Мечтательный",
      url: "/avatars/avatar-13.svg",
      category: "dreamy",
    },
  },
  {
    id: "avatar-14",
    metadata: {
      id: "avatar-14",
      name: "Жизнерадостный",
      url: "/avatars/avatar-14.svg",
      category: "cheerful",
    },
  },
  {
    id: "avatar-15",
    metadata: {
      id: "avatar-15",
      name: "Уникальный",
      url: "/avatars/avatar-15.svg",
      category: "unique",
    },
  },
] as const;

/**
 * Класс реестра аватаров
 */
export class AvatarRegistry {
  /**
   * Получить все доступные аватары
   */
  static getAll(): readonly AvatarPreset[] {
    return AVATARS;
  }

  /**
   * Получить аватар по ID
   */
  static getById(id: AvatarId): AvatarPreset | null {
    return AVATARS.find((avatar) => avatar.id === id) || null;
  }

  /**
   * Получить аватары по категории
   */
  static getByCategory(category: string): readonly AvatarPreset[] {
    return AVATARS.filter((avatar) => avatar.metadata.category === category);
  }

  /**
   * Получить случайный аватар
   */
  static getRandom(): AvatarPreset {
    return AVATARS[Math.floor(Math.random() * AVATARS.length)];
  }

  /**
   * Проверить существование аватара
   */
  static exists(id: string): id is AvatarId {
    return AVATARS.some((avatar) => avatar.id === id);
  }
}
