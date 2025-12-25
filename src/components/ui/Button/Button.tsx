/**
 * Переиспользуемый компонент кнопки
 * Соблюдает принцип Single Responsibility
 */

import React from "react";
import styles from "./Button.module.css";

export interface ButtonProps {
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
  readonly variant?: "primary" | "secondary" | "outline";
  readonly disabled?: boolean;
  readonly type?: "button" | "submit" | "reset";
  readonly className?: string;
}

/**
 * Компонент кнопки
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  className = "",
}) => {
  const buttonClasses = [
    styles.button,
    styles[`button--${variant}`],
    disabled && styles["button--disabled"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {children}
    </button>
  );
};

