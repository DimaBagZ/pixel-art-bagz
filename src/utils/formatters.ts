/**
 * Утилиты для форматирования данных
 * Строгая типизация без использования any
 */

/**
 * Форматирование процента побед
 * @param rate - Процент (0-100)
 * @returns Отформатированная строка (например, "75.5%")
 */
export function formatWinRate(rate: number): string {
  const rounded = Math.round(rate * 100) / 100;
  return `${rounded.toFixed(1)}%`;
}

/**
 * Форматирование даты
 * @param timestamp - Временная метка в миллисекундах
 * @returns Отформатированная дата (например, "23.12.2025")
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Форматирование длительности игры
 * @param seconds - Длительность в секундах
 * @returns Отформатированная длительность (например, "2 мин 30 сек")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} сек`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes} мин`;
  }

  return `${minutes} мин ${remainingSeconds} сек`;
}

/**
 * Форматирование относительного времени
 * @param timestamp - Временная метка в миллисекундах
 * @returns Относительное время (например, "2 часа назад", "вчера")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "только что";
  }

  if (minutes < 60) {
    return `${minutes} ${getMinutesWord(minutes)} назад`;
  }

  if (hours < 24) {
    return `${hours} ${getHoursWord(hours)} назад`;
  }

  if (days === 1) {
    return "вчера";
  }

  if (days < 7) {
    return `${days} ${getDaysWord(days)} назад`;
  }

  // Если больше недели - показываем дату
  return formatDate(timestamp);
}

/**
 * Получить правильную форму слова "минута"
 */
function getMinutesWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "минут";
  }

  if (lastDigit === 1) {
    return "минуту";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "минуты";
  }

  return "минут";
}

/**
 * Получить правильную форму слова "час"
 */
function getHoursWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "часов";
  }

  if (lastDigit === 1) {
    return "час";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "часа";
  }

  return "часов";
}

/**
 * Получить правильную форму слова "день"
 */
function getDaysWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "дней";
  }

  if (lastDigit === 1) {
    return "день";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "дня";
  }

  return "дней";
}
