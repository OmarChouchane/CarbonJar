'use client';

import React from 'react';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';

import Button from '../button';
import { SmallerH1, H2 } from '../Heading';
import CardComponent from '../testamonial-card';

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
    name: 'Google',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/512px-Google_2015_logo.svg.png',
  },
  {
    name: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/512px-Amazon_logo.svg.png',
  },
  {
    name: 'Tesla',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Tesla_T_symbol.svg/512px-Tesla_T_symbol.svg.png',
  },
  {
    name: 'Apple',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/512px-Apple_logo_black.svg.png',
  },
  {
    name: 'IBM',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/512px-IBM_logo.svg.png',
  },
  {
    name: 'Meta',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/512px-Meta_Platforms_Inc._logo.svg.png',
  },
  {
    name: 'Netflix',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Logonetflix.png/512px-Logonetflix.png',
  },
  {
    name: 'Spotify',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/512px-Spotify_logo_without_text.svg.png',
  },
  {
    name: 'Adobe',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg/512px-Adobe_Systems_logo_and_wordmark.svg.png',
  },
  {
    name: 'Uber',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Uber_logo_2018.png/512px-Uber_logo_2018.png',
  },
  {
    name: 'Nike',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/512px-Logo_NIKE.svg.png',
  },
  {
    name: 'Airbnb',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_Bélo.svg/512px-Airbnb_Logo_Bélo.svg.png',
  },
  {
    name: 'Twitter',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png',
  },
  {
    name: 'Intel',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Intel_logo_%282006-2020%29.svg/512px-Intel_logo_%282006-2020%29.svg.png',
  },
  {
    name: 'Oracle',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Oracle_logo.svg/512px-Oracle_logo.svg.png',
  },
  {
    name: 'Shopify',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopify_logo_2018.svg/512px-Shopify_logo_2018.svg.png',
  },
  {
    name: 'Zoom',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Zoom_Communications_Logo.svg/512px-Zoom_Communications_Logo.svg.png',
  },
];

const cardData: CardData[] = [
  {
    rating: 5,
    reviewText:
      'We at Weev felt like we had found a genealogy in the Carbon Jar. Their team has served our light guide to navigate through the complex world of carbon accounting. We have become a greener, more responsible company.',
    Client: 'Weev',
  },
  {
    rating: 5,
    reviewText:
      'I trust Carbon Jar’s honest and dependable calculations to guide our carbon reductions.',
    Client: 'Ingrid',
  },
  {
    rating: 5,
    reviewText:
      'Their experience in reducing our carbon footprint and their help in improving our ESG performance has been quite surprising. We are proud of the changes we have made.',
    Client: 'Aira',
  },
  {
    rating: 5,
    reviewText:
      'Our sustainability goals seemed ambitious, but Carbon Jar made them achievable. Their complete services and their unwavering support have helped us not only to reach but also to overcome our goals.',
    Client: 'Electra',
  },
  {
    rating: 5,
    reviewText:
      'We take our environmental responsibility seriously. Carbon Jar has been an invaluable partner in this regard. Their skills have informed our strategic decisions, helping to reduce our environmental impact and improve our sustainability profile. We couldn’t be more satisfied with their services.',
    Client: 'Fronted',
  },
];

const CardSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <section className="mb-12 items-center justify-center rounded-lg p-6 px-2 lg:mx-32 lg:mt-8 lg:px-8">
        <SmallerH1>Testamonials</SmallerH1>
        <br />
        <H2>Trusted by professionals & enthusiasts, that’s what our client said about us</H2>
        <br />
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={50}
          autoplay={{ delay: 2000 }}
          loop={true}
          navigation={{
            nextEl: '.btn-next',
            prevEl: '.btn-prev',
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
                {...(data.clientTitle ? { clientTitle: data.clientTitle } : {})}
                {...(data.clientImage ? { clientImage: data.clientImage } : {})}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="mt-4 flex justify-center">
          <Button secondary modifier="btn-prev mr-4">
            <IoIosArrowBack />
          </Button>
          <Button secondary modifier="btn-next">
            <IoIosArrowForward />
          </Button>
        </div>
      </section>

      {/**
       * Trusted Partners Section (commented out for future use)
       * To re-enable, remove this comment block.
       *
       * <motion.section
       *   className="bg-green mt-16 mb-12 flex flex-col items-center justify-center gap-10 p-6 px-2 lg:mt-16 lg:mb-12 lg:px-8"
       *   initial={{ opacity: 0, y: 30 }}
       *   whileInView={{ opacity: 1, y: 0 }}
       *   viewport={{ once: true, amount: 0.3 }}
       *   transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
       * >
       *   <div className="text-center">
       *     <div className="self-stretch text-center">
       *       <SmallerH1 className="text-white-light">
       *         <span className="text-light-green">Trusted</span>{' '}
       *         <span className="text-white-light">by Industry Leaders</span>
       *       </SmallerH1>
       *     </div>
       *     <p className="font-Inter text-lg text-white/80">
       *       Join hundreds of companies making a positive environmental impact
       *     </p>
       *   </div>
       *
       *   <div className="relative w-full overflow-hidden">
       *     <div className="animate-scroll-left flex items-center space-x-12">
       *       <div className="flex min-w-max items-center space-x-6">
       *         {trustedPartners.map((partner, index) => (
       *           <div key={index} className="flex h-20 w-40 flex-shrink-0 items-center justify-center">
       *             <Image
       *               src={partner.logo}
       *               alt={partner.name}
       *               width={120}
       *               height={40}
       *               className="max-h-full max-w-full object-contain brightness-0 invert filter transition-all duration-300 hover:brightness-100 hover:invert-0"
       *             />
       *           </div>
       *         ))}
       *       </div>
       *       <div className="flex min-w-max items-center space-x-12">
       *         {trustedPartners.map((partner, index) => (
       *           <div key={`duplicate-${index}`} className="flex h-20 w-40 flex-shrink-0 items-center justify-center">
       *             <Image
       *               src={partner.logo}
       *               alt={partner.name}
       *               width={120}
       *               height={40}
       *               className="max-h-full max-w-full object-contain brightness-0 invert filter transition-all duration-300 hover:brightness-100 hover:invert-0"
       *             />
       *           </div>
       *         ))}
       *       </div>
       *     </div>
       *
       *     <div className="from-green pointer-events-none absolute top-0 left-0 z-10 h-full w-50 bg-gradient-to-r to-transparent"></div>
       *     <div className="from-green pointer-events-none absolute top-0 right-0 z-10 h-full w-50 bg-gradient-to-l to-transparent"></div>
       *   </div>
       *
       *   <div className="text-center">
       *     <p className="font-Inter text-sm text-white/60">
       *       And many more companies choosing sustainable solutions
       *     </p>
       *   </div>
       * </motion.section>
       */}
    </motion.div>
  );
};

export default CardSection;
