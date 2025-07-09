"use client";

import React from "react";
import { motion } from "framer-motion";
import { H2Bold, H3 } from "../Heading";
import Link from "next/link";
import Image from "next/image";

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
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-start lg:px-8 gap-4 rounded-xl border border-green-dark bg-green-dark shadow-md p-6 transition-transform duration-200 hover:scale-105 hover:shadow-xl"
    >
      <div className="flex items-center gap-2">
        {icon && (
          <Image
            src={icon}
            alt={title}
            width={56}
            height={56}
            className="w-full h-full object-contain"
            unoptimized
          />
        )}
      </div>

      <div className="flex flex-col items-start gap-2">
        <H2Bold className="text-white-light">{title}</H2Bold>
        <H3 className="text-white-light text-left">{description}</H3>
        <Link
          href={learnMoreLink}
          className="text-white font-inter underline hover:underline"
        >
          View More
        </Link>
      </div>
    </motion.div>
  );
};

export default Card;
