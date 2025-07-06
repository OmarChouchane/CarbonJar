"use client";

import React from "react";
import BigCard1 from "../big-card1";
import BigCard2 from "../big-card2";
import { motion } from "framer-motion";

const CardsSection: React.FC = () => {
  const card1 = {
    image: "/images/images/card1.jpg",
    title: "Empowering Organizations to Take Climate Action",
    Maindescription: "It's Time to Take Climate Action",
    description:
      "Join the growing movement towards a sustainable future. At CarbonJar, we empower organizations to understand, manage, and reduce their carbon footprints, promoting sustainable practices and innovations.",
    button1: "Learn More",
    button2: "Get Started Now",
  };

  const card2 = {
    title:
      "Shaping MENA’s Future: Online Climate Education for Sustainable Development",
    Maindescription: "Welcome to Carbon Jar Academy!",
    description: (
      <>
        Our courses are <span className="font-bold text-left">100% online</span>
        , making them accessible to learners around the globe. We are proud to
        offer our content in three languages, ensuring that language is not a
        barrier to climate education.
        <br />
        Most importantly, our training is effective. A whopping{" "}
        <span className="font-bold">
          87% of our participants report feeling better equipped
        </span>{" "}
        to take action in their organizations in the face of climate change.
      </>
    ),
    button1: "Learn More",
    icon: "/images/icons/University.svg",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10px", amount: 0.1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <section className=" lg:px-8 px-2 lg:mt-8 mb-8 rounded-lg">
        <div className="container mx-auto">
          <BigCard1
            title={card1.title}
            description={card1.description}
            Maindescription={card1.Maindescription}
            image={card1.image}
            button1={card1.button1}
            button2={card1.button2}
          />
        </div>

        <div className="container lg:px-8 px-2 mx-auto">
          <BigCard2
            title={card2.title}
            description={card2.description}
            Maindescription={card2.Maindescription}
            icon={card2.icon}
            button1={card2.button1}
          />
        </div>
      </section>
    </motion.div>
  );
};

export default CardsSection;
