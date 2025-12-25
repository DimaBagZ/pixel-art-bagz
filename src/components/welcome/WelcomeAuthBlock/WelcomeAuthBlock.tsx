/**
 * Компонент блока для авторизованных пользователей на welcome странице
 * Соблюдает принцип Single Responsibility
 * Строгая типизация без использования any
 */

"use client";

import React from "react";
import Link from "next/link";
import { useUserProfile } from "@/hooks/useUserProfile";
import { UserAvatar } from "@/components/user/UserAvatar";
import { Button } from "@/components/ui/Button";
import { AvatarValidator } from "@/domain/avatar/AvatarValidator";
import styles from "./WelcomeAuthBlock.module.css";

/**
 * Компонент блока для авторизованных пользователей
 */
export const WelcomeAuthBlock: React.FC = () => {
  const { profile } = useUserProfile();

  if (!profile) {
    return null;
  }

  const validAvatarId =
    AvatarValidator.validateAndNormalize(profile.avatarId) || "avatar-01";

  return (
    <section className={styles.welcomeAuthBlock}>
      <div className={styles.welcomeAuthBlock__container}>
        <div className={styles.welcomeAuthBlock__content}>
          <div className={styles.welcomeAuthBlock__avatar}>
            <UserAvatar avatarId={validAvatarId} size="large" showBorder={true} />
          </div>
          <div className={styles.welcomeAuthBlock__info}>
            <h2 className={styles.welcomeAuthBlock__title}>
              Добро пожаловать, {profile.name}!
            </h2>
            <p className={styles.welcomeAuthBlock__description}>
              Вы уже авторизованы. Перейдите в личный кабинет, чтобы изменить настройки
              профиля, аватар или уровень сложности ИИ.
            </p>
            <div className={styles.welcomeAuthBlock__actions}>
              <Link href="/profile">
                <Button variant="primary" className={styles.welcomeAuthBlock__button}>
                  Перейти в личный кабинет
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className={styles.welcomeAuthBlock__button}>
                  Вернуться к игре
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

