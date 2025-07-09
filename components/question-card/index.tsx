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

  const toggleCard = () => {
    setIsOpen(!isOpen);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div
        className={`w-full shadow-base rounded-xl border border-lighter-green flex-col justify-start lg:px-8 sm:px-4 md:px-6 gap-4 inline-flex mb-2 ${
          isOpen ? "bg-lighter-grey" : "bg-white"
        }`}
        style={{ boxShadow: "none" }} // Remove outline/shadow
      >
        <div
          className="px-2 rounded-lg border-0 flex justify-between items-center cursor-pointer"
          onClick={toggleCard}
          style={{ minHeight: "24px" }} // Further reduce height
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
          animate={
            isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
          }
          transition={{
            height: { duration: 0.3, ease: "easeInOut" },
            opacity: { duration: 0.2 },
          }}
          style={{ overflow: "hidden" }}
        >
          <div
            style={{
              display: isOpen ? "block" : "none",
            }}
            className="pl-4 pr-6 pt-2 pb-2 text-left transition-all duration-300 ease-in-out sm:pl-6 sm:pr-12 lg:pl-10 lg:pr-28"
          >
            <H2 className="text-left mb-2 sm:m-2">{answer}</H2>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QuestionCard;
