"use client";
import React from "react";

import { motion } from "framer-motion";
import Image from "next/image";

import { H2Bold, H3 } from "../Heading";

interface CardProps {
  icon?: string;
  title: string;
  description: string;
  learnMoreLink: string;
}

const Card: React.FC<CardProps> = ({
  icon,
  title,
  description,
  learnMoreLink,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-start lg:px-8 gap-4 rounded-xl border border-green-dark bg-green-dark shadow-md p-6 transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer"
    >
      <div className="flex items-center gap-2">
        {icon && (
          <div className="w-10 h-10 lg:w-14 lg:h-14">
            <Image
              src={icon}
              alt={title}
              width={56}
              height={56}
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>
      <div className="flex flex-col items-start gap-2">
        <H2Bold className="text-white-light">{title}</H2Bold>
        <H3 className="text-white-light text-left">{description}</H3>
        <a
          href={learnMoreLink}
          className="text-white font-Inter underline hover:underline"
        >
          View More
        </a>
      </div>
    </motion.div>
  );
};

export default Card;
