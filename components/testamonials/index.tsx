"use client";

import React from "react";
import CardComponent from "../testamonial-card";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import "swiper/css/effect-fade";
import { Autoplay, Navigation } from "swiper/modules";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Button from "../button";
import { SmallerH1, H2 } from "../Heading";
import { motion } from "framer-motion";

interface CardData {
  rating: number;
  reviewText: string;
  Client: string;
  clientTitle?: string;
  clientImage?: string;
}

const cardData: CardData[] = [
  {
    rating: 5,
    reviewText:
      "We at Weev felt like we had found a genealogy in the Carbon Jar. Their team has served our light guide to navigate through the complex world of carbon accounting. We have become a greener, more responsible company.",
    Client: "Weev",
  },
  {
    rating: 5,
    reviewText:
      "I trust Carbon Jar’s honest and dependable calculations to guide our carbon reductions.",
    Client: "Ingrid",
  },
  {
    rating: 5,
    reviewText:
      "Their experience in reducing our carbon footprint and their help in improving our ESG performance has been quite surprising. We are proud of the changes we have made.",
    Client: "Aira",
  },
  {
    rating: 5,
    reviewText:
      "Our sustainability goals seemed ambitious, but Carbon Jar made them achievable. Their complete services and their unwavering support have helped us not only to reach but also to overcome our goals.",
    Client: "Electra",
  },
  {
    rating: 5,
    reviewText:
      "We take our environmental responsibility seriously. Carbon Jar has been an invaluable partner in this regard. Their skills have informed our strategic decisions, helping to reduce our environmental impact and improve our sustainability profile. We couldn’t be more satisfied with their services.",
    Client: "Fronted",
  },
];

const CardSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <section className=" lg:mx-32 lg:px-8 px-2 lg:mt-8 mb-12 rounded-lg p-6 items-center justify-center">
        <SmallerH1>Testamonials</SmallerH1>
        <br />
        <H2>
          Trusted by professionals & enthusiasts, that’s what our client said
          about us
        </H2>
        <br />
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={50}
          autoplay={{ delay: 2000 }}
          loop={true}
          navigation={{
            nextEl: ".btn-next",
            prevEl: ".btn-prev",
          }}
          breakpoints={{
            // when window width is >= 640px
            640: {
              slidesPerView: 1,
            },
            // when window width is >= 768px
            768: {
              slidesPerView: 2,
            },
            // when window width is >= 1024px
            1200: {
              slidesPerView: 3,
            },
          }}
        >
          {cardData.map((data, index) => (
            <SwiperSlide key={index} className="lg:mt-8">
              <CardComponent
                rating={data.rating}
                reviewText={data.reviewText}
                Client={data.Client}
                clientTitle={data.clientTitle}
                clientImage={data.clientImage}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="flex justify-center mt-4">
          <Button secondary modifier="btn-prev mr-4">
            <IoIosArrowBack />
          </Button>
          <Button secondary modifier="btn-next">
            <IoIosArrowForward />
          </Button>
        </div>
      </section>
    </motion.div>
  );
};

export default CardSection;
