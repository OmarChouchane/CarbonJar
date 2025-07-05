import React from "react";
import Image from "next/image";
import Link from "next/link";
import { H2 } from "../Heading";

const Footer = () => {
  return (
    <footer className="bg-green lg:mx-32 sm:mx-1 md:mx-10 lg:mt-8 md:mt-10 px-8 sm:px-2 lg:px-10 lg:mb-10 rounded-lg lg:rounded-xl border border-border-white flex flex-col sm:flex-row justify-between items-start">
      <div className="flex flex-col lg:gap-4">
        <div className="flex items-center gap-3 lg:m-6 m-4">
          <Link href="/">
            <Image
              src="/CarbonJar2.svg"
              alt="CarbonJar"
              width={320}
              height={40}
              className="lg:w-80 w-60 h-10 lg:h-10"
            />
          </Link>
        </div>
        <div className="flex flex-col lg:gap-3 gap-2 lg:mb-8 mb-4 md:mt-6 lg:mx-8 lg:px-8">
          <div className="flex items-center lg:gap-3">
            <Image
              src="/images/icons/Location.svg"
              alt="Location"
              width={24}
              height={28}
              className="w-6 h-7"
            />
            <H2 className="text-white-light text-left">
              20th March Street, Gam <br /> Building, Sousse
            </H2>
          </div>
          <div className="flex items-center lg:gap-3">
            <Image
              src="/images/icons/Phone.svg"
              alt="Phone"
              width={24}
              height={28}
              className="w-6 h-7"
            />
            <H2 className="text-white-light">+216 36 013 111</H2>
          </div>
          <div className="flex items-center lg:gap-3">
            <Image
              src="/images/icons/Envelope.svg"
              alt="Email"
              width={24}
              height={28}
              className="w-6 h-7"
            />
            <H2 className="text-white-light">contact@carbonjar.tn</H2>
          </div>
          <div className="flex items-center lg:gap-3">
            <Image
              src="/images/icons/mdi_web.svg"
              alt="Website"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <a href="https://carbonjar.tn/">
              <H2 className="text-white-light">https://carbonjar.tn/</H2>
            </a>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-end text-left mt-6 lg:mt-10 gap-3 lg:m-8">
        {[
          { name: "Home", href: "/" },
          { name: "About us", href: "/about" },
          { name: "Expertise", href: "/expertise" },
          { name: "Trainings", href: "/trainings" },
          { name: "Resources", href: "/resources" },
          { name: "Careers", href: "/careers" },
          { name: "Contact us", href: "/contact" },
        ].map(({ name, href }) => (
          <Link key={name} href={href}>
            <H2 className="text-left text-white-light">{name}</H2>
          </Link>
        ))}
      </div>
      <div className="hidden sm:flex mx-4 flex-col justify-end items-center mt-8">
        <div className="flex flex-col items-center gap-3">
          <H2 className="text-center text-white-light">
            Find us on social media
          </H2>
          <div className="flex gap-2">
            <Image
              src="/images/icons/Facebook.svg"
              alt="Facebook"
              width={28}
              height={28}
              className="w-7 h-7"
            />
            <a href="https://www.linkedin.com/company/carbon-jar/">
              <Image
                src="/images/icons/Linkedin.svg"
                alt="LinkedIn"
                width={28}
                height={28}
                className="w-7 h-7"
              />
            </a>
            <Image
              src="/images/icons/Instagram.svg"
              alt="Instagram"
              width={28}
              height={28}
              className="w-7 h-7"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
