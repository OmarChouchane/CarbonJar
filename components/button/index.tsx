"use client";

import { motion } from "framer-motion";

interface IButton {
  primary?: boolean;
  secondary?: boolean;
  children: React.ReactNode;
  modifier?: string;
  onClick?: () => void;
  className?: string;
}

const Button = ({
  primary,
  secondary,
  modifier,
  children,
  onClick,
  ...rest
}: IButton) => {
  const baseStyle = `font-inter font-medium py-2 px-5 border rounded flex justify-center items-center gap-2`;

  const styles = primary
    ? `bg-green text-white border-green`
    : secondary
    ? `bg-white text-green border-green`
    : `bg-light-green text-green border-light-green`;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`${baseStyle} ${styles} ${modifier ?? ""}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      {...rest}
    >
      {children}
    </motion.button>
  );
};

export default Button;
