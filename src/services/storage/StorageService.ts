/**
 * Базовый сервис для работы с localStorage
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

/**
 * Тип хранилища (localStorage, sessionStorage, или in-memory)
 */
type StorageType = "localStorage" | "sessionStorage" | "memory";

/**
 * Интерфейс для хранилища (совместим с Storage API)
 */
interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * In-memory хранилище как fallback
 */
class MemoryStorage implements StorageLike {
  private readonly data: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.data.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}

/**
 * Базовый сервис для работы с хранилищем
 */
export class StorageService {
  private readonly storage: StorageLike;
  private readonly storageType: StorageType;

  constructor(storageType: StorageType = "localStorage") {
    this.storageType = storageType;

    if (storageType === "localStorage") {
      this.storage = this.getLocalStorage();
    } else if (storageType === "sessionStorage") {
      this.storage = this.getSessionStorage();
    } else {
      this.storage = new MemoryStorage();
    }
  }

  /**
   * Получить доступ к localStorage с fallback
   */
  private getLocalStorage(): StorageLike {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        // Тест доступности
        const testKey = "__storage_test__";
        window.localStorage.setItem(testKey, "test");
        window.localStorage.removeItem(testKey);
        return window.localStorage;
      }
    } catch {
      // localStorage недоступен
    }

    // Fallback на sessionStorage
    return this.getSessionStorage();
  }

  /**
   * Получить доступ к sessionStorage с fallback
   */
  private getSessionStorage(): StorageLike {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        return window.sessionStorage;
      }
    } catch {
      // sessionStorage недоступен
    }

    // Fallback на in-memory
    return new MemoryStorage();
  }

  /**
   * Получить данные из хранилища
   */
  get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(key);
      if (item === null) {
        return null;
      }

      const parsed = JSON.parse(item) as T;
      return parsed;
    } catch (error) {
      console.error(`Ошибка чтения из хранилища (ключ: ${key}):`, error);
      return null;
    }
  }

  /**
   * Сохранить данные в хранилище
   */
  set<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      this.storage.setItem(key, serialized);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        console.error("Превышен лимит хранилища:", error);
      } else {
        console.error(`Ошибка записи в хранилище (ключ: ${key}):`, error);
      }
      return false;
    }
  }

  /**
   * Удалить данные из хранилища
   */
  remove(key: string): boolean {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Ошибка удаления из хранилища (ключ: ${key}):`, error);
      return false;
    }
  }

  /**
   * Очистить все данные из хранилища
   */
  clear(): boolean {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error("Ошибка очистки хранилища:", error);
      return false;
    }
  }

  /**
   * Проверить существование ключа
   */
  exists(key: string): boolean {
    try {
      const item = this.storage.getItem(key);
      return item !== null;
    } catch {
      return false;
    }
  }

  /**
   * Получить тип используемого хранилища
   */
  getStorageType(): StorageType {
    return this.storageType;
  }
}

/**
 * Экземпляр сервиса по умолчанию (localStorage с fallback)
 */
export const defaultStorageService = new StorageService("localStorage");
