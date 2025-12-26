"use client";

/**
 * Компонент ребуса для сокровищницы
 * Нужно решить головоломку, чтобы открыть дверь
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import styles from "./TreasurePuzzle.module.css";

export interface TreasurePuzzleProps {
  readonly isOpen: boolean;
  readonly mapLevel: number;
  readonly onSolve: () => void;
  readonly onClose: () => void;
}

// Типы головоломок
type PuzzleType = "math" | "sequence" | "word";

interface Puzzle {
  type: PuzzleType;
  question: string;
  answer: string;
  hint: string;
}

// Генератор головоломок
const generatePuzzle = (level: number): Puzzle => {
  const puzzleType: PuzzleType = ["math", "sequence", "word"][level % 3] as PuzzleType;

  if (puzzleType === "math") {
    // Математические загадки
    const mathPuzzles = [
      { q: "Сколько будет 7 × 8?", a: "56", h: "Таблица умножения" },
      { q: "Сколько будет 144 ÷ 12?", a: "12", h: "Делим без остатка" },
      { q: "Какое число следующее: 2, 4, 8, 16, ?", a: "32", h: "Умножаем на 2" },
      { q: "15 + 27 - 12 = ?", a: "30", h: "Простая арифметика" },
      { q: "Корень из 81?", a: "9", h: "9 × 9 = ?" },
      { q: "Сколько будет 3³?", a: "27", h: "3 × 3 × 3" },
      { q: "100 - 37 × 2 = ?", a: "26", h: "Сначала умножение" },
      { q: "Сколько секунд в 2 минутах?", a: "120", h: "60 × 2" },
    ];
    const p = mathPuzzles[(level * 7) % mathPuzzles.length];
    return { type: "math", question: p.q, answer: p.a, hint: p.h };
  }

  if (puzzleType === "sequence") {
    // Последовательности
    const seqPuzzles = [
      { q: "Следующее число: 1, 1, 2, 3, 5, 8, ?", a: "13", h: "Фибоначчи" },
      { q: "Продолжите: 3, 6, 9, 12, ?", a: "15", h: "+3 каждый раз" },
      { q: "Что дальше: 1, 4, 9, 16, 25, ?", a: "36", h: "Квадраты чисел" },
      { q: "Следующее: 2, 6, 12, 20, 30, ?", a: "42", h: "Разница растёт" },
      { q: "Продолжите: A, C, E, G, ?", a: "I", h: "Через одну букву" },
      { q: "Что дальше: 1, 8, 27, 64, ?", a: "125", h: "Кубы чисел" },
    ];
    const p = seqPuzzles[(level * 5) % seqPuzzles.length];
    return { type: "sequence", question: p.q, answer: p.a.toLowerCase(), hint: p.h };
  }

  // Словесные загадки
  const wordPuzzles = [
    { q: "Что можно увидеть с закрытыми глазами?", a: "сон", h: "Когда спишь..." },
    { q: "Без рук, без ног, а ворота открывает", a: "ветер", h: "Природное явление" },
    { q: "Какое слово наоборот читается так же?", a: "шалаш", h: "Палиндром из 5 букв" },
    { q: "Сколько месяцев в году имеют 28 дней?", a: "12", h: "Подвох в вопросе" },
    { q: "Что принадлежит вам, но другие используют чаще?", a: "имя", h: "Каждый день" },
    { q: "Летит без крыльев, бьёт без рук", a: "время", h: "Оно идёт" },
  ];
  const p = wordPuzzles[(level * 3) % wordPuzzles.length];
  return { type: "word", question: p.q, answer: p.a.toLowerCase(), hint: p.h };
};

export const TreasurePuzzle: React.FC<TreasurePuzzleProps> = ({
  isOpen,
  mapLevel,
  onSolve,
  onClose,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  
  // Отслеживаем предыдущие значения
  const prevIsOpenRef = useRef(false);
  const prevLevelRef = useRef(mapLevel);

  // Сбрасываем состояние когда окно ОТКРЫВАЕТСЯ или меняется уровень
  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    const levelChanged = mapLevel !== prevLevelRef.current;
    
    if (justOpened || levelChanged) {
      console.log(`[TreasurePuzzle] Сброс состояния: открытие=${justOpened}, смена уровня=${levelChanged}`);
      setUserAnswer("");
      setShowHint(false);
      setIsWrong(false);
      setIsSolved(false);
    }
    
    prevIsOpenRef.current = isOpen;
    prevLevelRef.current = mapLevel;
  }, [isOpen, mapLevel]);

  const puzzle = useMemo(() => generatePuzzle(mapLevel), [mapLevel]);

  const handleSubmit = useCallback(() => {
    const normalizedAnswer = userAnswer.trim().toLowerCase();
    const correctAnswer = puzzle.answer.toLowerCase();

    if (normalizedAnswer === correctAnswer) {
      setIsSolved(true);
      setTimeout(() => {
        onSolve();
      }, 1500);
    } else {
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 500);
    }
  }, [userAnswer, puzzle.answer, onSolve]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.puzzle} ${isWrong ? styles.shake : ""} ${
          isSolved ? styles.solved : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Декоративные элементы */}
        <div className={styles.cornerTL} />
        <div className={styles.cornerTR} />
        <div className={styles.cornerBL} />
        <div className={styles.cornerBR} />

        {/* Заголовок */}
        <div className={styles.header}>
          <div className={styles.lockIcon}>
            {isSolved ? "🔓" : "🔒"}
          </div>
          <h2 className={styles.title}>
            {isSolved ? "ДОСТУП ОТКРЫТ" : "ЗАМОК СОКРОВИЩНИЦЫ"}
          </h2>
          <div className={styles.subtitle}>
            Этаж {mapLevel} • {puzzle.type === "math" ? "Математика" : 
              puzzle.type === "sequence" ? "Последовательность" : "Загадка"}
          </div>
        </div>

        {isSolved ? (
          <div className={styles.successContent}>
            <div className={styles.successIcon}>✨</div>
            <p className={styles.successText}>
              Сокровищница открыта!
            </p>
          </div>
        ) : (
          <>
            {/* Вопрос */}
            <div className={styles.questionBox}>
              <div className={styles.questionIcon}>❓</div>
              <p className={styles.question}>{puzzle.question}</p>
            </div>

            {/* Поле ввода */}
            <div className={styles.inputBox}>
              <input
                type="text"
                className={styles.input}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Введите ответ..."
                autoFocus
              />
              <button
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={!userAnswer.trim()}
              >
                ✓
              </button>
            </div>

            {/* Подсказка */}
            <div className={styles.hintSection}>
              {showHint ? (
                <div className={styles.hint}>
                  <span className={styles.hintIcon}>💡</span>
                  <span className={styles.hintText}>{puzzle.hint}</span>
                </div>
              ) : (
                <button
                  className={styles.hintButton}
                  onClick={() => setShowHint(true)}
                >
                  Показать подсказку
                </button>
              )}
            </div>
          </>
        )}

        {/* Кнопка закрытия */}
        {!isSolved && (
          <button className={styles.closeButton} onClick={onClose}>
            ОТОЙТИ
          </button>
        )}
      </div>
    </div>
  );
};

