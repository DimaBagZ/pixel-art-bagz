"use client";

/**
 * Компонент торгового терминала
 * Позволяет продавать предметы из инвентаря за опыт
 */

import React, { useState } from "react";
import type { InventorySlot } from "@/types/pixel-art-game.types";
import { ItemType, ITEM_SELL_PRICES } from "@/types/pixel-art-game.types";
import styles from "./TradeTerminal.module.css";

export interface TradeTerminalProps {
  readonly isOpen: boolean;
  readonly inventory: readonly InventorySlot[];
  readonly onSellItem: (slotIndex: number) => number;
  readonly onClose: () => void;
}

const ITEM_NAMES: Record<ItemType, string> = {
  [ItemType.COIN]: "Монета",
  [ItemType.POTION]: "Зелье здоровья",
  [ItemType.STAMINA_POTION]: "Зелье стамины",
  [ItemType.RARE_ITEM]: "Редкий артефакт",
};

const ITEM_ICONS: Record<ItemType, string> = {
  [ItemType.COIN]: "🪙",
  [ItemType.POTION]: "🧪",
  [ItemType.STAMINA_POTION]: "💚",
  [ItemType.RARE_ITEM]: "💎",
};

export const TradeTerminal: React.FC<TradeTerminalProps> = ({
  isOpen,
  inventory,
  onSellItem,
  onClose,
}) => {
  const [lastSoldXP, setLastSoldXP] = useState<number | null>(null);
  const [soldAnimation, setSoldAnimation] = useState(false);

  if (!isOpen) return null;

  const itemsToSell = inventory.filter((slot) => slot.item !== null);

  const handleSell = (slotIndex: number) => {
    const xp = onSellItem(slotIndex);
    if (xp > 0) {
      setLastSoldXP(xp);
      setSoldAnimation(true);
      setTimeout(() => {
        setSoldAnimation(false);
        setLastSoldXP(null);
      }, 1500);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.terminal} onClick={(e) => e.stopPropagation()}>
        {/* Заголовок терминала */}
        <div className={styles.header}>
          <div className={styles.headerGlow} />
          <div className={styles.headerContent}>
            <span className={styles.headerIcon}>💻</span>
            <h2 className={styles.title}>ТОРГОВЫЙ ТЕРМИНАЛ</h2>
            <span className={styles.headerIcon}>💻</span>
          </div>
          <div className={styles.subtitle}>Обменяйте предметы на опыт</div>
        </div>

        {/* Анимация продажи */}
        {soldAnimation && lastSoldXP && (
          <div className={styles.soldNotification}>
            <span className={styles.soldXP}>+{lastSoldXP} XP</span>
          </div>
        )}

        {/* Список предметов */}
        <div className={styles.itemsList}>
          {itemsToSell.length === 0 ? (
            <div className={styles.emptyMessage}>
              <span className={styles.emptyIcon}>📦</span>
              <p>Инвентарь пуст</p>
              <p className={styles.emptyHint}>Соберите предметы на карте</p>
            </div>
          ) : (
            itemsToSell.map((slot) => {
              if (!slot.item) return null;
              const price = ITEM_SELL_PRICES[slot.item.type];
              const name = ITEM_NAMES[slot.item.type];
              const icon = ITEM_ICONS[slot.item.type];

              return (
                <div key={slot.index} className={styles.itemRow}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemIcon}>{icon}</span>
                    <span className={styles.itemName}>{name}</span>
                  </div>
                  <div className={styles.itemPrice}>
                    <span className={styles.xpValue}>{price} XP</span>
                  </div>
                  <button
                    className={styles.sellButton}
                    onClick={() => handleSell(slot.index)}
                  >
                    ПРОДАТЬ
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Прайс-лист */}
        <div className={styles.priceList}>
          <div className={styles.priceListTitle}>📋 Цены скупки:</div>
          <div className={styles.priceGrid}>
            {Object.entries(ITEM_SELL_PRICES).map(([type, price]) => (
              <div key={type} className={styles.priceItem}>
                <span>{ITEM_ICONS[type as ItemType]}</span>
                <span className={styles.priceName}>{ITEM_NAMES[type as ItemType]}</span>
                <span className={styles.priceValue}>{price} XP</span>
              </div>
            ))}
          </div>
        </div>

        {/* Кнопка закрытия */}
        <button className={styles.closeButton} onClick={onClose}>
          ЗАКРЫТЬ ТЕРМИНАЛ
        </button>
      </div>
    </div>
  );
};
