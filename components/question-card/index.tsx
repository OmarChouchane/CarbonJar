import React, { useState } from 'react';

import { motion } from 'framer-motion';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

import { Title, H2 } from '../Heading';

interface QuestionCardProps {
  question: string;
  answer: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCard = () => {
    setIsOpen(!isOpen);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div
        className={`shadow-base border-lighter-green mb-2 inline-flex w-full flex-col justify-start gap-4 rounded-xl border sm:px-4 md:px-6 lg:px-8 ${
          isOpen ? 'bg-lighter-grey' : 'bg-white'
        }`}
        style={{ boxShadow: 'none' }} // Remove outline/shadow
      >
        <div
          className="flex cursor-pointer items-center justify-between rounded-lg border-0 px-2"
          onClick={toggleCard}
          style={{ minHeight: '24px' }} // Further reduce height
        >
          <Title className="text-base">Q: {question}</Title>
          {isOpen ? (
            <IoIosArrowUp className="text-green text-xl" />
          ) : (
            <IoIosArrowDown className="text-green text-xl" />
          )}
        </div>
        <motion.div
          initial={false}
          animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{
            height: { duration: 0.3, ease: 'easeInOut' },
            opacity: { duration: 0.2 },
          }}
          style={{ overflow: 'hidden' }}
        >
          <div
            style={{
              display: isOpen ? 'block' : 'none',
            }}
            className="pt-2 pr-6 pb-2 pl-4 text-left transition-all duration-300 ease-in-out sm:pr-12 sm:pl-6 lg:pr-28 lg:pl-10"
          >
            <H2 className="mb-2 text-left sm:m-2">{answer}</H2>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QuestionCard;
