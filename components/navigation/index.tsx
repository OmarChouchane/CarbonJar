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
  <div className="md:hidden">
    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="text-white block px-3 py-2 text-base font-medium"
        >
          {link.label}
        </Link>
      ))}
    </div>
  </div>
);

const Navigation = () => {
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu(!showMenu);

  return (
    <nav className="bg-green lg:mx-32 sm:mx-8 md:mx-12 lg:mt-8 md:mt-10 px-4 sm:px-4 lg:px-4 rounded-lg lg:rounded-xl border border-border-white flex items-center justify-between">
      <Link href="/">
        <Image
          src="/logoCarbonJar.svg"
          alt="logo"
          width={48}
          height={48}
          className="h-20 w-12 ml-1"
        />
      </Link>

      <div className="hidden md:flex flex-1 justify-center">
        <div className="ml-10 items-baseline lg:space-x-4 flex space-x-4">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-white hover:text-light-green px-3 py-2 rounded-md font-Inter"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="hidden md:flex items-center md:ml-10">
        <Button>Contact us</Button>
      </div>

      <div className="flex md:hidden -mr-2">
        <MenuButton showMenu={showMenu} toggleMenu={toggleMenu} />
      </div>

      {showMenu && <MobileMenu />}
    </nav>
  );
};

export default Navigation;
