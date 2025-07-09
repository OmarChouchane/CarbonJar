import React from "react";
import { H2, H1 } from "../Heading";
import { motion } from "framer-motion";

interface StatisticBlockProps {
  number: string;
  description: React.ReactNode;
}

const StatisticBlock: React.FC<StatisticBlockProps> = ({
  number,
  description,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
    >
      <div
        className="w-full sm:w-72 flex flex-col justify-start items-center gap-2 p-4"
        style={{
          transition: "box-shadow 0.3s, background 0.3s, transform 0.3s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background =
            "rgba(0,0,0,0.05)";
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 10px 24px rgba(0,0,0,0.15)";
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "";
          (e.currentTarget as HTMLDivElement).style.transform = "";
        }}
      >
        <H1 className="font-bold">{number}</H1>
        <div className="w-full text-center">
          <H2 className="text-center lg:text-xl">{description}</H2>
        </div>
      </div>
    </motion.div>
  );
};

export default StatisticBlock;
