import React from 'react';

import { motion } from 'framer-motion';

import { H2, H2Bold, SmallerH1 } from '../Heading';

interface TextCardProps {
  texts: { title: string; text: string }[];
  title?: string;
}

const TextCard: React.FC<TextCardProps> = ({ texts, title }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    className="border-lighter-green bg-white-light rounded-lg border lg:mx-32 lg:mt-20 lg:mb-20"
  >
    {title && <SmallerH1 className="mt-6 px-6">{title}</SmallerH1>}

    <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {texts.map((textItem, index) => (
        <div
          key={index}
          className="flex flex-col rounded-lg p-4 transition duration-300 hover:shadow-md"
        >
          <H2Bold className="text-3xl">{textItem.title}</H2Bold>
          <H2>{textItem.text}</H2>
        </div>
      ))}
    </div>
  </motion.div>
);

export default TextCard;
