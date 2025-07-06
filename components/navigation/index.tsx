"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/button";

interface IMenuButton {
  toggleMenu: React.MouseEventHandler<HTMLButtonElement>;
  showMenu: boolean;
}

type LinkType = {
  label: string;
  href: string;
};

const links: LinkType[] = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about" },
  { label: "Expertise", href: "/expertise" },
  { label: "Trainings", href: "/trainings" },
  { label: "Resources", href: "/" },
  { label: "Careers", href: "/" },
];

const MenuButton = ({ toggleMenu, showMenu }: IMenuButton) => (
  <button
    type="button"
    aria-controls="mobile-menu"
    aria-expanded={showMenu}
    onClick={toggleMenu}
    className="p-2 text-white"
  >
    <span className="sr-only">Open menu</span>
    {showMenu ? (
      <svg
        className="h-6 w-6 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
        width={24}
        height={24}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ) : (
      <svg
        className="h-6 w-6 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
        width={24}
        height={24}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    )}
  </button>
);

const MobileMenu = () => (
  <div
    className="md:hidden absolute top-full left-0 right-0 z-50 bg-green rounded-b-lg border border-border-white border-t-0 shadow-xl"
    style={{
      transform: "translateY(0)",
      transition: "all 1s ease-in-out",
      opacity: 1,
    }}
  >
    <div className="px-2 pt-4 pb-6 space-y-2 sm:px-3 text-center">
      {links.map((link: LinkType) => (
        <Link
          href={link.href}
          className="text-white block px-3 py-3 text-base font-medium hover:text-light-green rounded-md"
          key={link.label}
          prefetch={true}
          style={{
            transition: "all 1s ease-in-out",
          }}
        >
          {link.label}
        </Link>
      ))}
      <div className="pt-4">
        <Button>Contact us</Button>
      </div>
    </div>
  </div>
);

const Navigation = () => {
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu(!showMenu);

  return (
    <div className="relative z-50">
      <nav className="bg-green lg:mx-32 sm:mx-8 md:mx-12 lg:mt-8 md:mt-10 px-4 sm:px-4 lg:px-4 rounded-lg lg:rounded-xl border border-border-white relative z-50">
        <div className="flex items-center justify-between lg:h-20 md:h-20 sm:h-30 h-17 px-4 sm:px-1 lg:px-1 mx-auto">
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                className="h-12 w-12"
                src="/logoCarbonJar.svg"
                alt="logo"
                width={48}
                height={48}
                priority
              />
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div className="hidden md:block flex-1 justify-center">
              <div className="ml-10 items-baseline lg:space-x-4 flex space-x-4">
                {links.map((link: LinkType) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    prefetch={true}
                    className="text-white hover:text-light-green px-3 py-2 rounded-md font-Inter"
                    style={{
                      transition: "color 0.1s ease-in-out",
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-10">
              <Button>Contact us</Button>
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <MenuButton showMenu={showMenu} toggleMenu={toggleMenu} />
          </div>
        </div>

        {showMenu && <MobileMenu />}
      </nav>

      {/* Backdrop overlay for mobile menu */}
      {showMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={toggleMenu}
          style={{
            transition: "opacity 1s ease-in-out",
          }}
        />
      )}
    </div>
  );
};

export default Navigation;
