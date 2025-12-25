"use client";

/**
 * Страница приветствия и настройки профиля
 * Первый визит пользователя
 */

import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { WelcomeHero } from "@/components/welcome/WelcomeHero";
import { WelcomeFeatures } from "@/components/welcome/WelcomeFeatures";
import { WelcomeCTA } from "@/components/welcome/WelcomeCTA";
import { WelcomeAuthBlock } from "@/components/welcome/WelcomeAuthBlock";
import { Logo } from "@/components/ui/Logo";
import styles from "./page.module.css";

export default function WelcomePage() {
  const router = useRouter();
  const { profile, isLoading } = useUserProfile();

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

  const handleComplete = (): void => {
    // Редирект на главную страницу после настройки
    router.push("/");
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <Logo href="/welcome" size="large" />
        </div>

        {/* Если пользователь авторизован, показываем блок для авторизованных */}
        {profile ? (
          <>
            <WelcomeHero />
            <WelcomeFeatures />
            <WelcomeAuthBlock />
          </>
        ) : (
          <>
            <WelcomeHero />
            <WelcomeFeatures />
            <WelcomeCTA onComplete={handleComplete} />
          </>
        )}
      </div>
    </main>
  );
}

