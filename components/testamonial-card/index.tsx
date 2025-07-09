import React from "react";
import { H2, H2Bold } from "../Heading";
import { motion } from "framer-motion";
import Image from "next/image";

interface CardComponentProps {
  rating: number;
  reviewText: string;
  Client: string;
  clientTitle?: string;
  clientImage?: string;
}

const CardComponent: React.FC<CardComponentProps> = ({
  reviewText,
  Client,
  clientTitle,
  clientImage,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-96 h-64 px-8 py-4 rounded-lg border border-lighter-green flex flex-col justify-between shadow-lg transition-shadow ease-in-out"
      whileHover={{ scale: 1.05 }}
    >
      {/* Review text */}
      <H2 className="text-left mt-4">{reviewText}</H2>

      {/* Client section */}
      <div className="flex items-center gap-4 mt-auto">
        {/* Client avatar */}
        {clientImage && (
          <Image
            className="w-14 h-14 rounded-full"
            src={clientImage}
            alt={`${Client}'s Avatar`}
            width={56}
            height={56}
            style={{ objectFit: "cover" }}
          />
        )}
        {/* Client details */}
        <div className="flex flex-col justify-start items-start gap-2 text-left">
          <H2Bold>{Client}</H2Bold>
          {clientTitle && <H2>{clientTitle}</H2>}
        </div>
      </div>
    </motion.div>
  );
};

export default CardComponent;
