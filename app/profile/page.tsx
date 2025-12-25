"use client";

/**
 * Страница личного кабинета пользователя
 * Редактирование профиля: имя, аватар, сложность ИИ
 */

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { UserProfile } from "@/components/user/UserProfile";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import styles from "./page.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, isLoading } = useUserProfile();

  // Проверка: если профиля нет (и загрузка завершена), редирект на welcome
  const hasRedirectedRef = useRef(false);
  useEffect(() => {
    if (!isLoading && profile === null && !hasRedirectedRef.current && pathname === "/profile") {
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

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.header__logo}>
            <Logo href="/welcome" size="medium" />
          </div>
          <nav className={styles.header__nav}>
            <Link href="/">
              <Button variant="outline">Вернуться к игре</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Статистика</Button>
            </Link>
          </nav>
        </header>

        {/* Profile Content */}
        <section className={styles.content}>
          <UserProfile />
        </section>
      </div>
    </main>
  );
}

