"use client";

import React from "react";

import { motion } from "framer-motion";
import { IoIosArrowForward } from "react-icons/io";

import Button from "@/components/button";
import LinkImageGrid from "@/components/LinkImageGrid"; // Updated to correct component

import { H1, H2, H3 } from "../Heading";



interface Link {
  url: string;
  imgSrc: string;
  altText?: string;
  hoverImgSrc: string;
}

const imageLinks: Link[] = [
  {
    url: "https://www.iso.org/home.html",
    imgSrc: "/images/logos/iso.svg",
    hoverImgSrc: "/images/logos/iso_hover.svg",
    altText: "Iso",
  },
  {
    url: "https://sciencebasedtargets.org/",
    imgSrc: "images/logos/ScienceBasedTarget.svg",
    hoverImgSrc: "images/logos/ScienceBasedTarget_hover.svg",
    altText: "Science based targets",
  },
  {
    url: "https://carbonaccountingfinancials.com/",
    imgSrc: "images/logos/pcaf.svg",
    hoverImgSrc: "images/logos/pcaf_hover.svg",
    altText: "Partnership for Carbon Accounting Financials",
  },
  {
    url: "https://ghgprotocol.org/",
    imgSrc: "/images/logos/greenhouse.svg",
    hoverImgSrc: "/images/logos/greenhouse_hover.svg",
    altText: "Greenhouse gaz protocol",
  },
  {
    url: "https://www.fsb-tcfd.org/",
    imgSrc: "images/logos/tcfd.svg",
    hoverImgSrc: "images/logos/TCFD_hover.svg",
    altText: "Task Force on Climate-related Financial Disclosures",
  },
  {
    url: "https://www.globalreporting.org/media/m22dl3o0/gri-data-legend-sustainability-disclosure-database-profiling.pdf",
    imgSrc: "/images/logos/qri.svg",
    hoverImgSrc: "/images/logos/qri_hover.svg",
    altText: "Sustainability Disclosure Database",
  },
];

const Header = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >
    <header>
      <div className="max-w-4xl mx-auto py-12 sm:px-4 lg:px-6 mb-4 lg:mb-10 md:mb-6 sm:mb-8 lg:mt-10 md:mt-4 sm:mt-4">
        <br />
        <H1 className="leading-tight">Measuring Today, Preserving Tomorrow.</H1>
        <br />
        <H2>
          Empowering businesses with the tools to measure, manage, and reduce
          their carbon footprints for a greener future.
        </H2>
        <div className="mt-10 flex justify-center items-center w-full mx-auto">
          <Button secondary>Learn more</Button>
          <span className="mx-2"></span>
          <div className="flex items-center">
            <Button primary>
              Book a consultation
              <IoIosArrowForward className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="mt-2 w-full">
          <H3>Aligned with Global Standards and Frameworks</H3>
          <LinkImageGrid links={imageLinks} />
        </div>
      </div>
    </header>
  </motion.div>
);

export default Header;
