"use client";

/**
 * Страница дашборда со статистикой игр
 * Интегрирует все компоненты статистики
 */

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePixelArtStatistics } from "@/hooks/usePixelArtStatistics";
import { usePixelArtAchievements } from "@/hooks/usePixelArtAchievements";
import { useGameState } from "@/hooks/useGameState";
import { StatisticsCard } from "@/components/dashboard/StatisticsCard";
import { PixelArtAchievements } from "@/components/dashboard/Achievements/PixelArtAchievements";
import { UserAvatar } from "@/components/user/UserAvatar";
import { Button } from "@/components/ui/Button";
import { AvatarValidator } from "@/domain/avatar/AvatarValidator";
import styles from "./page.module.css";

/**
 * Форматирование времени игры
 */
const formatPlayTime = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `${hours} ч ${minutes} мин`;
  }
  return `${minutes} мин`;
};

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, isLoading } = useUserProfile();
  const { statistics } = usePixelArtStatistics();
  const { achievements, checkAchievements } = usePixelArtAchievements();
  const { savedState } = useGameState();

  // Проверить достижения при загрузке
  const hasCheckedAchievementsRef = useRef(false);
  useEffect(() => {
    if (profile && savedState && !hasCheckedAchievementsRef.current) {
      hasCheckedAchievementsRef.current = true;
      checkAchievements(statistics, savedState);
    }
  }, [profile, savedState, statistics, checkAchievements]);

  // Проверка первого визита: если профиля нет (и загрузка завершена), редирект на welcome
  const hasRedirectedRef = useRef(false);
  useEffect(() => {
    if (!isLoading && profile === null && !hasRedirectedRef.current && pathname === "/dashboard") {
      hasRedirectedRef.current = true;
      router.replace("/welcome");
    }
  }, [profile, isLoading, router, pathname]);


  // Если профиль еще загружается, показываем загрузку
  if (isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Загрузка...</p>
          </div>
        </div>
      </main>
    );
  }

  // Если профиля нет (и загрузка завершена), показываем загрузку (редирект произойдет через useEffect)
  if (!profile) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Загрузка...</p>
          </div>
        </div>
      </main>
    );
  }

  // Валидация avatarId из профиля
  const validAvatarId =
    profile && AvatarValidator.validateAndNormalize(profile.avatarId)
      ? AvatarValidator.validateAndNormalize(profile.avatarId)!
      : "avatar-01";

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.header__user}>
            <UserAvatar avatarId={validAvatarId} size="large" showBorder={true} />
            <div className={styles.header__userInfo}>
              <h1 className={styles.header__userName}>{profile?.name || "Игрок"}</h1>
              <p className={styles.header__userSubtitle}>Статистика игры</p>
            </div>
          </div>
          <div className={styles.header__actions}>
            <Link href="/profile" className={styles.header__link}>
              <Button variant="outline">Личный кабинет</Button>
            </Link>
            <Link href="/" className={styles.header__link}>
              <Button variant="outline">Вернуться к игре</Button>
            </Link>
          </div>
        </header>

        {/* Общая статистика */}
        <section className={styles.section}>
          <h2 className={styles.section__title}>Общая статистика</h2>
          <div className={styles.statisticsGrid}>
            <StatisticsCard
              title="Собрано монет"
              value={statistics.totalCoinsCollected}
              icon="💰"
              trend="up"
            />
            <StatisticsCard
              title="Собрано зелий"
              value={statistics.totalPotionsCollected + (statistics.totalStaminaPotionsCollected ?? 0)}
              icon="🧪"
              trend="up"
            />
            <StatisticsCard
              title="Собрано редких предметов"
              value={statistics.totalRareItemsCollected}
              icon="⭐"
              trend="up"
            />
            <StatisticsCard
              title="Текущий уровень"
              value={statistics.currentLevel}
              icon="📈"
              trend="up"
            />
            <StatisticsCard
              title="Опыт"
              value={statistics.totalExperience}
              icon="⚡"
              trend="up"
            />
            <StatisticsCard
              title="Время игры"
              value={formatPlayTime(statistics.totalPlayTime)}
              icon="⏱️"
              trend="neutral"
            />
            <StatisticsCard
              title="Сессий"
              value={statistics.sessionsCount}
              icon="🎮"
              trend="neutral"
            />
          </div>
        </section>

        {/* Достижения */}
        {savedState && (
          <section className={styles.section}>
            <PixelArtAchievements achievements={achievements} />
          </section>
        )}
      </div>
    </main>
  );
}
