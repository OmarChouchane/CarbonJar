"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

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

      <div className="pt-4 space-y-3 flex flex-col items-center">
        <SignedIn>
          <Button>Certificates</Button>
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in">
        <Button>Login</Button>
          </Link>
        </SignedOut>
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
          <div className="flex flex-1 justify-center">
            <div className="hidden md:flex items-center">
              <div className="flex space-x-4">
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
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            <SignedIn>
              <Button>Certificates</Button>
              {/* Notification Icon */}
              <button
                type="button"
                className="relative p-2 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                aria-label="Notifications"
              >
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {/* Notification badge */}
                {/* <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">3</span> */}
              </button>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in">
                <Button>Login</Button>
              </Link>
            </SignedOut>
          </div>

          <div className="flex items-center space-x-2 md:hidden">
            <SignedIn>
              {/* Mobile Notification Icon */}
              <button
                type="button"
                className="relative p-2 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                aria-label="Notifications"
              >
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              {/* Mobile UserButton */}
              <div className="scale-100 pt-1">
                <UserButton />
              </div>
            </SignedIn>
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
