"use client";

import React from "react";
import Image from "next/image";
import { H2Bold, H3 } from "../Heading";
import { motion } from "framer-motion";

interface CardProps {
  icon?: string;
  title: string;
  description: string;
}

const Card: React.FC<CardProps> = ({ icon, title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-10px", amount: 0.1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col justify-center items-center gap-4 rounded-xl border border-lighter-green bg-white shadow-md p-6"
      whileHover={{ scale: 1.05 }}
    >
      <div className="flex h-16 pl-1 pr-2 pt-1.5 pb-1 items-center">
        <div className="w-10 h-10 relative">
          {icon && (
            <Image
              src={icon}
              alt={title}
              fill
              style={{ objectFit: "contain" }}
              sizes="40px"
            />
          )}
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <H2Bold>{title}</H2Bold>
        <H3>{description}</H3>
      </div>
    </motion.div>
  );
};

export default Card;
