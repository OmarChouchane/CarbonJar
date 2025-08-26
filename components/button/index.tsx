"use client";

import type { MouseEventHandler } from "react";

import { motion } from "framer-motion";

interface IButton {
  primary?: boolean;
  secondary?: boolean;
  children: React.ReactNode;
  modifier?: string | undefined;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
}

const Button = ({
  primary,
  secondary,
  modifier,
  children,
  onClick,
  disabled,
  ...rest
}: IButton) => {
  const baseStyle = `font-inter font-medium py-2 px-5 border rounded flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 transition-colors duration-150`;

  const styles = primary
    ? `bg-green text-white border-green hover:bg-green/90`
    : secondary
    ? `bg-white text-green border-green hover:bg-light-green/80`
    : `bg-light-green text-green border-light-green hover:bg-light-green/80`;

  return (
    <motion.button
      className={`${baseStyle} ${styles} ${modifier || ""}`}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </motion.button>
  );
};

export default Button;
