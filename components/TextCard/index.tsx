import React from "react";
import { H2, H2Bold, SmallerH1 } from "../Heading";
import { motion } from "framer-motion";

interface TextCardProps {
  texts: { title: string; text: string }[];
  title?: string;
}

const TextCard: React.FC<TextCardProps> = ({ texts, title }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="rounded-lg border border-lighter-green bg-white-light lg:mt-20 lg:mb-20 lg:mx-32"
  >
    {title && <SmallerH1 className="mt-6 px-6">{title}</SmallerH1>}

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {texts.map((textItem, index) => (
        <div
          key={index}
          className="flex flex-col p-4 rounded-lg hover:shadow-md transition duration-300"
        >
          <H2Bold className="text-3xl">{textItem.title}</H2Bold>
          <H2>{textItem.text}</H2>
        </div>
      ))}
    </div>
  </motion.div>
);

export default TextCard;
