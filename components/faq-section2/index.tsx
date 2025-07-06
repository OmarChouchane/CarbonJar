"use client";

import React from "react";
import { motion } from "framer-motion";
import { SmallerH1, H2 } from "../Heading";
import QuestionCard from "../question-card2";

const faqs = [
  {
    question: "What is a carbon footprint in accounting terms?",
    answer:
      "A carbon footprint, from an accounting perspective, represents the total volume of greenhouse gas emissions, including carbon dioxide and methane, that are directly and indirectly produced by an entity, event, product, or individual. It’s vital for businesses to meticulously track and report these emissions as part of their commitment to environmental stewardship and sustainability.",
  },
  {
    question: "How can businesses account for their carbon emissions?",
    answer:
      "Businesses can monitor their carbon emissions by adopting carbon accounting methodologies. This process involves pinpointing and quantifying the greenhouse gas emissions emanating from various aspects of their operations, such as energy usage, transportation, waste management, and manufacturing processes. These measurements are subsequently converted into carbon dioxide equivalents (CO2e) for comprehensive reporting and analysis.",
  },
  {
    question:
      "What are some effective strategies for carbon footprint reduction?",
    answer:
      "There are several strategies businesses can employ to reduce their carbon footprint. These include implementing energy-efficient practices, encouraging remote work, optimizing logistics to reduce transportation emissions, and investing in renewable energy sources.",
  },
  {
    question: "What is the Carbon Border Adjustment Mechanism (CBAM)?",
    answer:
      "The Carbon Border Adjustment Mechanism (CBAM) is a policy initiative introduced by the European Union (EU) to tackle carbon leakage. It’s designed to deter companies from shifting production to regions with less stringent climate regulations. CBAM levies tariffs on certain imported goods based on their embedded carbon emissions, ensuring that imported products bear a similar carbon cost as those produced domestically.",
  },
  {
    question: "What challenges do businesses face when adapting to CBAM?",
    answer:
      "Businesses face several challenges when adapting to CBAM. These include accounting for CBAM-related costs, modifying supply chains to reduce carbon emissions, and ensuring compliance with stringent reporting requirements.",
  },
  {
    question: "How does ESG impact a company’s reputation?",
    answer:
      "Robust ESG (Environmental, Social, and Governance) practices can significantly enhance a company’s reputation. They can attract customers who prioritize social responsibility, improve trust among stakeholders, and potentially lead to better financial performance.",
  },
  {
    question: "What are the risks of ignoring ESG considerations?",
    answer:
      "Ignoring ESG considerations can pose significant risks to a company. These include potential reputational damage, regulatory fines, and skepticism from investors, which could negatively impact the company’s financial performance and market value.",
  },
];

const FAQSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10px", amount: 0.1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <section className="lg:mx-32 sm:mx-1 md:mx-10 lg:px-8 px-2 lg:mt-8 mb-12">
        <SmallerH1 className="text-white-light">FAQs</SmallerH1>
        <H2 className="text-white-light">
          Replying to the most frequently asked questions
        </H2>
        <br />
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <QuestionCard
              key={index}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default FAQSection;
