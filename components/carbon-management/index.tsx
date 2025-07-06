"use client";

import React from "react";
import { motion } from "framer-motion";
import { H2, SmallerH1 } from "../Heading";
import Card from "../card";

const CarbonManagement: React.FC = () => {
  const cards = [
    {
      icon: "/images/icons/ph_path-bold.svg",
      title: "Water Reduction Planning & Net Zero Roadmap",
      description: "Craft pathways to net-zero with strategic precision.",
    },
    {
      icon: "/images/icons/majesticons_data-line.svg",
      title: "GHG Data Collection & Measurement",
      description:
        "Measure your Scope 1, 2, and 3 emissions with our advanced tools.",
    },
    {
      icon: "/images/icons/Leaf.svg",
      title: "Supply Chain Decarbonization",
      description: "Engage, evaluate, and elevate sustainable supply chains.",
    },
    {
      icon: "/images/icons/mingcute_building-4-line.svg",
      title: "Financed Emissions",
      description:
        "Optimize your portfolio and reduce your financed emissions.",
    },
    {
      icon: "/images/icons/footprint.svg",
      title: "Carbon Footprint & ESG Reporting",
      description:
        "Set your emissions baseline and report your ESG performance.",
    },
    {
      icon: "/images/icons/mdi_teaching.svg",
      title: "Trainings & Workshops",
      description:
        "Equip your team with the knowledge and tools for sustainability.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10px", amount: 0.1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <section className=" p-8 lg:mt-8 rounded-lg">
        <div className="container mx-auto">
          <SmallerH1>Comprehensive Carbon Management</SmallerH1>
          <br />
          <H2>Find here All-Inclusive Carbon Management Solutions</H2>
          <br />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mt-8">
            {cards.map((card, index) => (
              <Card
                key={index}
                icon={card.icon}
                title={card.title}
                description={card.description}
              />
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default CarbonManagement;
