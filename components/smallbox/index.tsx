import React from 'react';

import { motion } from 'framer-motion';

interface SmallerBoxProps {
  text: string | React.ReactNode;
}

const SmallerBox: React.FC<SmallerBoxProps> = ({ text }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    className="border-border-white flex h-8 items-center justify-center gap-2.5 rounded-md border px-4 py-2"
    whileHover={{ scale: 1.05, boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}
  >
    <div className="text-light-green font-Inter text-sm font-normal">{text}</div>
  </motion.div>
);

export default SmallerBox;
