import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import React, { useState } from "react";
import { Title, H2 } from "../Heading";
import { motion } from "framer-motion";

interface QuestionCardProps {
  question: string;
  answer: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCard = () => setIsOpen(!isOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div
        className={`w-full shadow-base rounded-xl border border-border-white flex-col justify-start lg:px-8 sm:px-4 md:px-6 gap-4 inline-flex mb-1 ${
          isOpen ? "bg-green-dark" : "bg-green"
        }`}
        style={{ outline: "none" }}
      >
        <div
          className="px-6 rounded-lg border-0 flex justify-between items-center cursor-pointer"
          onClick={toggleCard}
          style={{ outline: "none", minHeight: "unset", height: "auto" }}
        >
          <Title className="text-white-light">Q: {question}</Title>
          {isOpen ? (
            <IoIosArrowUp className="text-white-light text-2xl" />
          ) : (
            <IoIosArrowDown className="text-white-light text-2xl" />
          )}
        </div>

        {isOpen && (
          <div className="pl-4 pr-6 pt-2 pb-2 text-left transition-all duration-300 ease-in-out sm:pl-6 sm:pr-12 lg:pl-10 lg:pr-28">
            <H2 className="text-left mb-4 sm:m-2 text-white-light">{answer}</H2>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default QuestionCard;
