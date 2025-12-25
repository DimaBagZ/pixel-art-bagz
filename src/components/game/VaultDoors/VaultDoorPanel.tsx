/**
 * Компонент панели ворота бункера
 * Соблюдает принцип Single Responsibility
 */

import React from "react";
import styles from "./VaultDoors.module.css";

export interface VaultDoorPanelProps {
  readonly side: "left" | "right";
  readonly isOpen: boolean;
  readonly isAnimating: boolean;
  readonly children?: React.ReactNode;
}

/**
 * Компонент панели ворота (левая или правая)
 */
export const VaultDoorPanel: React.FC<VaultDoorPanelProps> = ({
  side,
  isOpen,
  isAnimating,
  children,
}) => {
  const panelClasses = [
    styles.vaultDoorPanel,
    styles[`vaultDoorPanel--${side}`],
    isOpen && styles["vaultDoorPanel--open"],
    isAnimating && styles["vaultDoorPanel--animating"],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={panelClasses}>
      <div className={styles.vaultDoorPanel__surface}>
        {/* Металлическая текстура */}
        <div className={styles.vaultDoorPanel__texture} />
        {/* Ржавчина по краям */}
        <div className={styles.vaultDoorPanel__rust} />
        {/* Болты */}
        <div className={styles.vaultDoorPanel__bolts}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={styles.vaultDoorPanel__bolt}
              style={{
                top: `${15 + i * 12}%`,
                left: side === "left" ? "5%" : "95%",
              }}
            />
          ))}
        </div>
      </div>
      {/* Дочерние элементы (например, кнопка на левой панели) */}
      {children && <div className={styles.vaultDoorPanel__content}>{children}</div>}
    </div>
  );
};

