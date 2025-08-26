import React from 'react';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { H2, H2Bold } from '../Heading';

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
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="border-lighter-green flex h-64 w-96 flex-col justify-between rounded-lg border px-8 py-4 shadow-lg transition-shadow ease-in-out"
      whileHover={{ scale: 1.05 }}
    >
      {/* Review text */}
      <H2 className="mt-4 text-left">{reviewText}</H2>

      {/* Client section */}
      <div className="mt-auto flex items-center gap-4">
        {/* Client avatar */}
        {clientImage && (
          <Image
            className="h-14 w-14 rounded-full"
            src={clientImage}
            alt={`${Client}'s Avatar`}
            width={56}
            height={56}
            style={{ objectFit: 'cover' }}
          />
        )}
        {/* Client details */}
        <div className="flex flex-col items-start justify-start gap-2 text-left">
          <H2Bold>{Client}</H2Bold>
          {clientTitle && <H2>{clientTitle}</H2>}
        </div>
      </div>
    </motion.div>
  );
};

export default CardComponent;
