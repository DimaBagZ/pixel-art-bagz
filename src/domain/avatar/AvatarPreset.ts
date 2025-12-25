/**
 * Типы для аватаров
 * Строгая типизация без использования any
 */

/**
 * ID аватара (пресет)
 */
export type AvatarId =
  | "avatar-01"
  | "avatar-02"
  | "avatar-03"
  | "avatar-04"
  | "avatar-05"
  | "avatar-06"
  | "avatar-07"
  | "avatar-08"
  | "avatar-09"
  | "avatar-10"
  | "avatar-11"
  | "avatar-12"
  | "avatar-13"
  | "avatar-14"
  | "avatar-15";

/**
 * Метаданные аватара
 */
export interface AvatarMetadata {
  readonly id: AvatarId;
  readonly name: string;
  readonly url: string;
  readonly category?: string;
}

/**
 * Пресет аватара
 */
export interface AvatarPreset {
  readonly id: AvatarId;
  readonly metadata: AvatarMetadata;
}
