import React from "react";
import { motion } from "framer-motion";

interface SmallerBoxProps {
  text: string | React.ReactNode;
}

const SmallerBox: React.FC<SmallerBoxProps> = ({ text }) => (
  <motion.div
    className="h-8 px-4 py-2 rounded-md border border-border-white flex justify-center items-center gap-2.5"
    whileHover={{ scale: 1.05, boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }}
    transition={{ type: "spring", stiffness: 300, damping: 10 }}
  >
    <div className="text-light-green text-sm font-normal font-Inter">
      {text}
    </div>
  </motion.div>
);

export default SmallerBox;
