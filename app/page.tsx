"use client";

/**
 * Главная страница игры - Пиксель Арт Бункер
 * Интегрирует все компоненты новой игры
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePixelArtGame } from "@/hooks/usePixelArtGame";
import { VaultDoors } from "@/components/game/VaultDoors";
import { GameCanvas } from "@/components/game/GameCanvas";
import { GameUI } from "@/components/game/GameUI";
import { Inventory } from "@/components/game/Inventory";
import { Minimap } from "@/components/game/Minimap";
import { PauseMenu } from "@/components/game/PauseMenu";
import { UserAvatar } from "@/components/user/UserAvatar";
import { Button } from "@/components/ui/Button";
import { AvatarValidator } from "@/domain/avatar/AvatarValidator";
import { Logo } from "@/components/ui/Logo";
import { StatsIcon } from "@/components/ui/StatsIcon";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const { profile, isLoading } = useUserProfile();
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);

  // Инициализация игры
  const {
    gameState,
    updateGame,
    handleMove,
    startGame,
    resetGame,
    pauseGame,
    resumeGame,
  } = usePixelArtGame({
    enabled: doorsOpen && !showPauseMenu,
    onStateChange: (state) => {
      // Автоматическое закрытие ворот при паузе
      if (state.isPaused && doorsOpen) {
        setDoorsOpen(false);
      }
    },
    onAchievementUnlocked: (achievementIds) => {
      // Можно добавить уведомление о достижениях
      console.log("Достижения разблокированы:", achievementIds);
    },
  });

  // Проверка первого визита: если профиля нет (и загрузка завершена), редирект на welcome
  useEffect(() => {
    if (!isLoading && profile === null) {
      router.replace("/welcome");
    }
  }, [profile, isLoading, router]);

  // Обработка открытия ворот
  const handleDoorsOpen = useCallback((): void => {
    setDoorsOpen(true);
    if (!gameState.isGameStarted) {
      startGame();
    } else {
      resumeGame();
    }
  }, [gameState.isGameStarted, startGame, resumeGame]);

  // Обработка закрытия ворот
  const handleDoorsClose = useCallback((): void => {
    setDoorsOpen(false);
    pauseGame();
  }, [pauseGame]);

  // Обработка паузы (ESC)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && doorsOpen && gameState.isGameStarted) {
        event.preventDefault();
        setShowPauseMenu(true);
        pauseGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [doorsOpen, gameState.isGameStarted, pauseGame]);

  // Обработка видимости страницы (автопауза при переключении вкладки)
  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (document.hidden && doorsOpen && gameState.isGameStarted) {
        handleDoorsClose();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [doorsOpen, gameState.isGameStarted, handleDoorsClose]);

  // Если профиль еще загружается, показываем загрузку
  if (isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.loading}>
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
          <div className={styles.loading}>
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

  const hasSavedGame = gameState.isGameStarted;

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.header__left}>
          <Logo />
        </div>
        <div className={styles.header__center}>
          <UserAvatar avatarId={validAvatarId} size="medium" showBorder={true} />
          <span className={styles.header__userName}>{profile.name}</span>
        </div>
        <div className={styles.header__right}>
          <Link href="/dashboard" className={styles.header__link}>
            <Button variant="outline" className={styles.header__button}>
              <StatsIcon />
              Статистика
            </Button>
          </Link>
          <Link href="/profile" className={styles.header__link}>
            <Button variant="outline" className={styles.header__button}>
              Профиль
            </Button>
          </Link>
        </div>
      </header>

      {/* Игровая область */}
      <div className={styles.gameArea}>
        {/* Ворота бункера */}
        <VaultDoors
          isOpen={doorsOpen}
          hasSavedGame={hasSavedGame}
          onOpen={handleDoorsOpen}
          onClose={handleDoorsClose}
        />

        {/* Игровой Canvas */}
        {doorsOpen && (
          <>
            <GameCanvas
              gameState={gameState}
              onUpdate={updateGame}
              enabled={!showPauseMenu && !gameState.isPaused}
            />

            {/* UI поверх игры */}
            <GameUI gameState={gameState} />

            {/* Мини-карта */}
            <Minimap gameState={gameState} size={200} />

            {/* Инвентарь */}
            <Inventory inventory={gameState.inventory} />
          </>
        )}
      </div>

      {/* Меню паузы */}
      <PauseMenu
        isOpen={showPauseMenu}
        onResume={() => {
          setShowPauseMenu(false);
          resumeGame();
        }}
        onSaveAndExit={() => {
          handleDoorsClose();
          setShowPauseMenu(false);
        }}
        onExit={() => {
          handleDoorsClose();
          setShowPauseMenu(false);
          router.push("/dashboard");
        }}
      />
    </main>
  );
}
