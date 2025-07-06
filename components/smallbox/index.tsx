import React from "react";
import { motion } from "framer-motion";

interface SmallerBoxProps {
  text: string | React.ReactNode;
}

const SmallerBox: React.FC<SmallerBoxProps> = ({ text }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: "-10px", amount: 0.1 }}
    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    className="h-8 px-4 py-2 rounded-md border border-border-white flex justify-center items-center gap-2.5"
    whileHover={{ scale: 1.05, boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }}
  >
    <div className="text-light-green text-sm font-normal font-Inter">
      {text}
    </div>
  </motion.div>
);

export default SmallerBox;
