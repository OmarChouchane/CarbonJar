"use client";

import React from "react";

import { motion } from "framer-motion";
import Image from "next/image";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import "swiper/css/effect-fade";

import Button from "../button";
import { SmallerH1, H2 } from "../Heading";
import CardComponent from "../testamonial-card";

interface CardData {
  rating: number;
  reviewText: string;
  Client: string;
  clientTitle?: string;
  clientImage?: string;
}

interface TrustedPartner {
  name: string;
  logo: string;
}

const trustedPartners: TrustedPartner[] = [
  {
    name: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/512px-Google_2015_logo.svg.png",
  },
  {
    name: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/512px-Amazon_logo.svg.png",
  },
  {
    name: "Tesla",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Tesla_T_symbol.svg/512px-Tesla_T_symbol.svg.png",
  },
  {
    name: "Apple",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/512px-Apple_logo_black.svg.png",
  },
  {
    name: "IBM",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/512px-IBM_logo.svg.png",
  },
  {
    name: "Meta",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/512px-Meta_Platforms_Inc._logo.svg.png",
  },
  {
    name: "Netflix",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Logonetflix.png/512px-Logonetflix.png",
  },
  {
    name: "Spotify",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/512px-Spotify_logo_without_text.svg.png",
  },
  {
    name: "Adobe",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg/512px-Adobe_Systems_logo_and_wordmark.svg.png",
  },
  {
    name: "Uber",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Uber_logo_2018.png/512px-Uber_logo_2018.png",
  },
  {
    name: "Nike",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/512px-Logo_NIKE.svg.png",
  },
  {
    name: "Airbnb",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_Bélo.svg/512px-Airbnb_Logo_Bélo.svg.png",
  },
  {
    name: "Twitter",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png",
  },
  {
    name: "Intel",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Intel_logo_%282006-2020%29.svg/512px-Intel_logo_%282006-2020%29.svg.png",
  },
  {
    name: "Oracle",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Oracle_logo.svg/512px-Oracle_logo.svg.png",
  },
  {
    name: "Shopify",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopify_logo_2018.svg/512px-Shopify_logo_2018.svg.png",
  },
  {
    name: "Zoom",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Zoom_Communications_Logo.svg/512px-Zoom_Communications_Logo.svg.png",
  },
];

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

      {/* Trusted Partners Section */}
      <motion.section
        className="lg:px-8 px-2 mt-16 mb-12  p-6 lg:mt-16 lg:mb-12 bg-green flex flex-col justify-center items-center gap-10 "
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      >
        <div className="text-center">
          <div className="self-stretch text-center">
            <SmallerH1 className="text-white-light">
              <span className="text-light-green">Trusted</span>{" "}
              <span className="text-white-light">by Industry Leaders</span>
            </SmallerH1>
          </div>
          <p className="text-white/80 text-lg font-Inter">
            Join hundreds of companies making a positive environmental impact
          </p>
        </div>

        {/* Auto-rotating Logo Carousel */}
        <div className="relative overflow-hidden w-full">
          <div className="flex animate-scroll-left space-x-12 items-center ">
            {/* First set of logos */}
            <div className="flex space-x-6 items-center min-w-max">
              {trustedPartners.map((partner, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-40 h-20 flex items-center justify-center"
                >
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={120}
                    height={40}
                    className="max-w-full max-h-full object-contain filter brightness-0 invert hover:brightness-100 hover:invert-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
            {/* Duplicate set for seamless loop */}
            <div className="flex space-x-12 items-center min-w-max">
              {trustedPartners.map((partner, index) => (
                <div
                  key={`duplicate-${index}`}
                  className="flex-shrink-0 w-40 h-20 flex items-center justify-center"
                >
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={120}
                    height={40}
                    className="max-w-full max-h-full object-contain filter brightness-0 invert hover:brightness-100 hover:invert-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Left vignette */}
          <div className="absolute left-0 top-0 w-50 h-full bg-gradient-to-r from-green to-transparent z-10 pointer-events-none"></div>
          {/* Right vignette */}
          <div className="absolute right-0 top-0 w-50 h-full bg-gradient-to-l from-green to-transparent z-10 pointer-events-none"></div>
        </div>

        <div className="text-center">
          <p className="text-white/60 text-sm font-Inter">
            And many more companies choosing sustainable solutions
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default CardSection;
