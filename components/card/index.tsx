"use client";

import React from "react";

import { motion } from "framer-motion";
import Image from "next/image";

import { H2Bold, H3 } from "../Heading";

interface CardProps {
  icon?: string;
  title: string;
  description: string;
}

const Card: React.FC<CardProps> = ({ icon, title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col justify-center items-center gap-4 rounded-xl border border-lighter-green bg-white shadow-md p-6"
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
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
