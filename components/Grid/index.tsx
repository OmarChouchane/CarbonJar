'use client';
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { H2, H2Bold, H3 } from "../Heading";
import Button from "../button";
import Image from "next/image";

interface CardProps {
  icon?: string;
  title: string;
  description: string;
  learnMoreLink: string;
  id: string;
}

const Card: React.FC<CardProps> = ({
  icon,
  title,
  description,
  learnMoreLink,
  id,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <motion.div
        layoutId={id}
        className="flex flex-col items-start lg:px-8 gap-4 rounded-xl border border-green-dark bg-green-dark shadow-md p-6 transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer"
        onClick={() => setSelectedId(id)}
      >
        <div className="flex items-center gap-2">
          {icon && (
            <div className="w-10 h-10 lg:w-14 lg:h-14">
              <Image
                src={icon}
                alt={title}
                width={56} // 14 * 4 = 56px (lg:w-14)
                height={56} // 14 * 4 = 56px (lg:h-14)
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

      <AnimatePresence>
        {selectedId === id && (
          <motion.div
            layoutId={id}
            className="fixed inset-0 bg-gray-800 bg-opacity-80 flex items-center justify-center z-50"
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              className="flex flex-col items-center bg-green-dark p-6 lg:px-12 lg:mx-44 rounded-lg shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-4">
                {icon && (
                  <div className="w-10 h-10 lg:w-14 lg:h-14">
                    <Image
                      src={icon}
                      alt={title}
                      width={56} // 14 * 4 = 56px (lg:w-14)
                      height={56} // 14 * 4 = 56px (lg:h-14)
                      className="object-contain"
                    />
                  </div>
                )}
                <H2Bold className="text-white-light">{title}</H2Bold>
              </div>
              <H2 className="text-white-light text-left mb-6">{description}</H2>
              <Button secondary onClick={() => setSelectedId(null)}>
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Card;
