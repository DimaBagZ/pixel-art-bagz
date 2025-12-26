"use client";

/**
 * Главная страница игры - Пиксель Арт Бункер
 * Интегрирует все компоненты новой игры
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePixelArtGame } from "@/hooks/usePixelArtGame";
import { useGameState } from "@/hooks/useGameState";
import { gameStateService } from "@/services/storage/GameStateService";
import { VaultDoors } from "@/components/game/VaultDoors";
import { GameCanvas } from "@/components/game/GameCanvas";
import { GameUI } from "@/components/game/GameUI";
import { Inventory } from "@/components/game/Inventory";
import { Minimap } from "@/components/game/Minimap";
import { PauseMenu } from "@/components/game/PauseMenu";
import { CharacterCreation } from "@/components/game/CharacterCreation";
import { TradeTerminal } from "@/components/game/TradeTerminal";
import { TreasurePuzzle } from "@/components/game/TreasurePuzzle";
import { UserAvatar } from "@/components/user/UserAvatar";
import { Button } from "@/components/ui/Button";
import { AvatarValidator } from "@/domain/avatar/AvatarValidator";
import type { PlayerStats } from "@/types/pixel-art-game.types";
import { Logo } from "@/components/ui/Logo";
import { StatsIcon } from "@/components/ui/StatsIcon";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const { profile, isLoading, updateCharacterClass } = useUserProfile();
  const { hasSavedGame } = useGameState();
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [showTradeTerminal, setShowTradeTerminal] = useState(false);
  const [showTreasurePuzzle, setShowTreasurePuzzle] = useState(false);

  // Инициализация игры
  const {
    gameState,
    getGameState,
    updateGame,
    handleMove,
    startGame,
    resetGame,
    restartGame,
    pauseGame,
    resumeGame,
    updateInventory,
    goToNextLevel,
    sellItem,
    sellResources,
    unlockTreasureRoom,
    isLoading: isGameLoading,
    isOnExit,
    isNearTerminal,
    isNearTreasureDoor,
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
    // Ждём загрузки игры
    if (isGameLoading) return;
    
    // Если нет сохраненной игры, показываем создание персонажа
    if (!hasSavedGame && !gameState.isGameStarted) {
      setShowCharacterCreation(true);
      return;
    }
    
    setDoorsOpen(true);
    if (!gameState.isGameStarted) {
      startGame();
    } else {
      resumeGame();
    }
  }, [isGameLoading, hasSavedGame, gameState.isGameStarted, startGame, resumeGame]);
  
  // Обработка создания персонажа
  const handleCharacterCreated = useCallback((stats: PlayerStats, characterClass: "SURVIVOR" | "EXPLORER" | "COLLECTOR"): void => {
    setShowCharacterCreation(false);
    // Сохраняем выбранный класс персонажа
    updateCharacterClass(characterClass);
    // Передаем stats в startGame для применения характеристик
    startGame(stats);
    // Открываем ворота после небольшой задержки для завершения анимации
    setTimeout(() => {
      setDoorsOpen(true);
    }, 100);
  }, [startGame, updateCharacterClass]);

  // Обработка закрытия ворот
  const handleDoorsClose = useCallback((): void => {
    setDoorsOpen(false);
    pauseGame();
  }, [pauseGame]);

  // Обработка паузы (ESC) и взаимодействия (E)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && doorsOpen && gameState.isGameStarted) {
        event.preventDefault();
        setShowPauseMenu(true);
        pauseGame();
      }
      
      // Взаимодействие по кнопке E (или У для русской раскладки)
      if ((event.key === "e" || event.key === "E" || event.key === "у" || event.key === "У") && doorsOpen && gameState.isGameStarted) {
        event.preventDefault();
        
        // Открыть торговый терминал
        if (isNearTerminal && !showTradeTerminal) {
          setShowTradeTerminal(true);
          pauseGame();
        }
        
        // Открыть ребус сокровищницы
        if (isNearTreasureDoor && !showTreasurePuzzle && !gameState.treasureRoomUnlocked) {
          setShowTreasurePuzzle(true);
          pauseGame();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [doorsOpen, gameState.isGameStarted, gameState.treasureRoomUnlocked, pauseGame, isNearTerminal, isNearTreasureDoor, showTradeTerminal, showTreasurePuzzle]);

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

  // Сохранение при размонтировании компонента (переход на другую страницу)
  useEffect(() => {
    return () => {
      // При размонтировании компонента сохраняем состояние игры
      if (gameState.isGameStarted && !gameState.isPaused) {
        const currentState = getGameState();
        if (currentState) {
          // Используем прямое сохранение через gameStateService для гарантии
          try {
            gameStateService.saveGameState(currentState);
          } catch (e) {
            console.error("Ошибка сохранения при размонтировании:", e);
          }
        }
      }
    };
  }, [gameState.isGameStarted, gameState.isPaused, getGameState]);

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
          <Link 
            href="/dashboard" 
            className={styles.header__link}
            onClick={() => {
              // Сохраняем состояние перед переходом
              if (gameState.isGameStarted && !gameState.isPaused) {
                const currentState = getGameState();
                if (currentState) {
                  gameStateService.saveGameState(currentState);
                }
              }
            }}
          >
            <Button variant="outline" className={styles.header__button}>
              <StatsIcon />
              Статистика
            </Button>
          </Link>
          <Link 
            href="/profile" 
            className={styles.header__link}
            onClick={() => {
              // Сохраняем состояние перед переходом
              if (gameState.isGameStarted && !gameState.isPaused) {
                const currentState = getGameState();
                if (currentState) {
                  gameStateService.saveGameState(currentState);
                }
              }
            }}
          >
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
          hideNut={showCharacterCreation}
        />

        {/* Игровой Canvas */}
        {doorsOpen && (
          <>
            <GameCanvas
              getGameState={getGameState}
              onUpdate={updateGame}
              enabled={!showPauseMenu && !gameState.isPaused}
            />

            {/* UI поверх игры */}
            <GameUI
              stats={gameState.player.stats}
              coins={gameState.coins}
              inventory={gameState.inventory}
              mapLevel={gameState.mapLevel}
              isOnExit={isOnExit}
              isNearTerminal={isNearTerminal}
              isNearTreasureDoor={isNearTreasureDoor}
              treasureRoomUnlocked={gameState.treasureRoomUnlocked}
              onGoToNextLevel={goToNextLevel}
            />

            {/* Мини-карта */}
            <Minimap gameState={gameState} size={200} />

            {/* Инвентарь */}
            <Inventory 
              inventory={gameState.inventory}
              collectedResources={gameState.collectedResources}
              onInventoryChange={updateInventory}
              onSellResources={sellResources}
            />
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
        onRestart={() => {
          setShowPauseMenu(false);
          restartGame();
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

      {/* Создание персонажа */}
      <CharacterCreation
        isOpen={showCharacterCreation}
        onComplete={handleCharacterCreated}
        onCancel={() => {
          // При отмене просто закрываем модальное окно
          // Кнопка "Начать" останется видимой, так как ворота закрыты
          setShowCharacterCreation(false);
        }}
      />

      {/* Торговый терминал */}
      <TradeTerminal
        isOpen={showTradeTerminal}
        inventory={gameState.inventory}
        onSellItem={(slotIndex) => {
          const xp = sellItem(slotIndex);
          return xp;
        }}
        onClose={() => {
          setShowTradeTerminal(false);
          resumeGame();
        }}
      />

      {/* Ребус для сокровищницы */}
      <TreasurePuzzle
        isOpen={showTreasurePuzzle}
        mapLevel={gameState.mapLevel}
        onSolve={() => {
          unlockTreasureRoom();
          setShowTreasurePuzzle(false);
          resumeGame();
        }}
        onClose={() => {
          setShowTreasurePuzzle(false);
          resumeGame();
        }}
      />
    </main>
  );
}
