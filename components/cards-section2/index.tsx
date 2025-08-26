"use client";

import React from "react";

import { motion } from "framer-motion";

import Card from "../card2";
import { H2, SmallerH1 } from "../Heading";

const CarbonCards: React.FC = () => {
  const cards = [
    {
      id: "1",
      icon: "/images/icons/majesticons_data-lineWh.svg",
      title: "Data Collection, Management, and GHG Protocol Adherence",
      description:
        "Our service accurately measures your Scope 1, 2, and 3 emissions, ensuring GHG Protocol compliance and a seamless transition to sustainable practices.",
      learnMoreLink: "/learn-more",
    },
    {
      id: "2",
      icon: "/images/icons/mdi_teachingWh.svg",
      title: "Trainings & Workshops",
      description:
        "Our training programs and workshops empower your team with essential skills for sustainability. We offer modules on climate change, emissions management, and best practices.",
      learnMoreLink: "/learn-more",
    },
    {
      id: "3",
      icon: "/images/icons/ph_pathWh.svg",
      title: "Net Zero Strategy",
      description:
        "We provide strategic guidance on your journey to net zero. Our experts will help you set achievable targets, develop effective strategies, and monitor progress towards your sustainability goals.",
      learnMoreLink: "/learn-more",
    },
    {
      id: "4",
      icon: "/images/icons/tabler_leafWh.svg",
      title: "Supply Chain Engagement",
      description:
        "Our service helps you evaluate and manage the environmental impact of your supply chain, developing strategies to reduce emissions and promote sustainability.",
      learnMoreLink: "/learn-more",
    },
    {
      id: "5",
      icon: "/images/icons/footprintWh.svg",
      title: "GHG & ESG Reporting",
      description:
        "Our GHG & ESG reporting service tracks your emissions and ESG performance, providing clear reports that meet global standards.",
      learnMoreLink: "/learn-more",
    },
    {
      id: "6",
      icon: "/images/icons/majesticons_data-lineWh.svg",
      title: "Financed Emissions",
      description:
        "Our service helps you manage emissions from your financial activities, providing insights and strategies to align your portfolio with sustainability goals.",
      learnMoreLink: "/learn-more",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10px", amount: 0.1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <section className="bg-green p-8 lg:mt-8 lg:mx-44 rounded-lg">
        <div className="container mx-auto">
          <SmallerH1 className="text-white-light lg:text-5xl">
            Our field of expertise
          </SmallerH1>
          <br />
          <H2 className="text-white-light">
            We offer a comprehensive suite of services designed to help your
            organization navigate <br />
            the path to sustainability.
          </H2>
          <br />
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-6 mt-8">
            {cards.map((card, index) => (
              <Card
                key={index}
                icon={card.icon}
                title={card.title}
                description={card.description}
                learnMoreLink={card.learnMoreLink}
              />
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default CarbonCards;
