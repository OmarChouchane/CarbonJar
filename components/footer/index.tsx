import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { H2 } from '../Heading';

const Footer = () => {
  return (
    <footer className="bg-green border-border-white rounded-lg border px-8 sm:mx-1 sm:px-2 md:mx-10 md:mt-10 lg:mx-32 lg:mt-8 lg:mb-10 lg:rounded-xl lg:px-10">
      {/* Mobile Footer - Only Links */}
      <div className="flex flex-col items-center space-y-6 py-8 sm:hidden">
        <Link href="/" className="transition-transform duration-200 hover:scale-105">
          <Image
            src="/CarbonJar2.svg"
            alt="CarbonJar"
            width={240}
            height={30}
            className="h-8 w-52"
          />
        </Link>

        <div className="grid-rows border-border-white border-opacity-20 mt-3 grid w-full max-w-xs gap-4 border-t pt-6">
          {[
            { name: 'Home', href: '/' },
            { name: 'About us', href: '/about' },
            { name: 'Expertise', href: '/expertise' },
            { name: 'Trainings', href: '/trainings' },
            { name: 'Blogs', href: '/blogs' },
            { name: 'Careers', href: '/careers' },
            { name: 'Contact us', href: '/contact' },
          ].map(({ name, href }) => (
            <Link
              key={name}
              href={href}
              className="group bg-opacity-5 hover:bg-opacity-15 rounded-lg px-4 py-1 text-center transition-all duration-200 hover:scale-105"
            >
              <H2 className="text-white-light group-hover:text-light-green text-xl transition-colors duration-200">
                {name}
              </H2>
            </Link>
          ))}
        </div>

        <div className="flex gap-4 pt-4">
          <a
            href="#"
            className="hover:border-opacity-60 rounded-full px-2 transition-all duration-200 hover:scale-110"
          >
            <Image
              src="/images/icons/Facebook.svg"
              alt="Facebook"
              width={30}
              height={30}
              className="h-10 w-10"
            />
          </a>
          <a
            href="https://www.linkedin.com/company/carbon-jar/"
            className="hover:border-opacity-60 rounded-full px-2 transition-all duration-200 hover:scale-110"
          >
            <Image
              src="/images/icons/Linkedin.svg"
              alt="LinkedIn"
              width={30}
              height={30}
              className="h-10 w-10"
            />
          </a>
          <a
            href="#"
            className="hover:border-opacity-60 rounded-full px-2 transition-all duration-200 hover:scale-110"
          >
            <Image
              src="/images/icons/Instagram.svg"
              alt="Instagram"
              width={30}
              height={30}
              className="h-10 w-10"
            />
          </a>
        </div>

        <div className="border-border-white border-opacity-20 w-full border-t pt-6 text-center">
          <H2 className="text-white-light text-xs opacity-75">
            © 2025 CarbonJar. All rights reserved.
          </H2>
        </div>
      </div>

      {/* Desktop Footer - Full Layout */}
      <div className="hidden flex-col items-start justify-between sm:flex sm:flex-row">
        <div className="flex flex-col lg:gap-4">
          <div className="m-4 flex items-center gap-3 lg:m-6">
            <Link href="/">
              <Image
                src="/CarbonJar2.svg"
                alt="CarbonJar"
                width={320}
                height={40}
                className="h-10 w-60 lg:h-10 lg:w-80"
              />
            </Link>
          </div>
          <div className="mb-4 flex flex-col gap-2 md:mt-6 lg:mx-8 lg:mb-8 lg:gap-3 lg:px-8">
            <div className="flex items-center lg:gap-3">
              <Image
                src="/images/icons/Location.svg"
                alt="Location"
                width={24}
                height={28}
                className="h-7 w-6"
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
                className="h-7 w-6"
              />
              <H2 className="text-white-light">+216 36 013 111</H2>
            </div>
            <div className="flex items-center lg:gap-3">
              <Image
                src="/images/icons/Envelope.svg"
                alt="Email"
                width={24}
                height={28}
                className="h-7 w-6"
              />
              <H2 className="text-white-light">contact@carbonjar.tn</H2>
            </div>
            <div className="flex items-center lg:gap-3">
              <Image
                src="/images/icons/mdi_web.svg"
                alt="Website"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <a href="https://carbonjar.tn/">
                <H2 className="text-white-light">https://carbonjar.tn/</H2>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col justify-end gap-3 text-left lg:m-8 lg:mt-10">
          {[
            { name: 'Home', href: '/' },
            { name: 'About us', href: '/about' },
            { name: 'Expertise', href: '/expertise' },
            { name: 'Trainings', href: '/trainings' },
            { name: 'Blogs', href: '/blogs' },
            { name: 'Careers', href: '/careers' },
            { name: 'Contact us', href: '/contact' },
          ].map(({ name, href }) => (
            <Link key={name} href={href}>
              <H2 className="text-white-light text-left">{name}</H2>
            </Link>
          ))}
        </div>
        <div className="mx-4 mt-8 hidden flex-col items-center justify-end sm:flex">
          <div className="flex flex-col items-center gap-3">
            <H2 className="text-white-light text-center">Find us on social media</H2>
            <div className="flex gap-2">
              <Image
                src="/images/icons/Facebook.svg"
                alt="Facebook"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <a href="https://www.linkedin.com/company/carbon-jar/">
                <Image
                  src="/images/icons/Linkedin.svg"
                  alt="LinkedIn"
                  width={28}
                  height={28}
                  className="h-7 w-7"
                />
              </a>
              <Image
                src="/images/icons/Instagram.svg"
                alt="Instagram"
                width={28}
                height={28}
                className="h-7 w-7"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
