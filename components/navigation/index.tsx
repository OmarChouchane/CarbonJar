'use client';

import { useEffect, useState } from 'react';

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';

import Button from '@/components/button';
import NotificationBell from '@/components/notifications/NotificationBell';

interface IMenuButton {
  toggleMenu: React.MouseEventHandler<HTMLButtonElement>;
  showMenu: boolean;
}

type LinkType = {
  label: string;
  href: string;
};

const links: LinkType[] = [
  { label: 'Home', href: '/' },
  { label: 'About us', href: '/about' },
  { label: 'Expertise', href: '/expertise' },
  { label: 'Trainings', href: '/trainings' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Careers', href: '/' },
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

const MobileMenu = ({
  isVisible,
  showDashboard,
}: {
  isVisible: boolean;
  showDashboard: boolean;
}) => (
  <div
    className={`bg-green/90 border-border-white absolute top-full right-3.5 left-3.5 z-30 -mt-1 overflow-hidden rounded-b-3xl border shadow-xl backdrop-blur-sm transition-all duration-300 ease-in-out md:hidden ${
      isVisible
        ? 'max-h-screen translate-y-0 transform opacity-100'
        : 'max-h-0 -translate-y-4 transform opacity-0'
    }`}
  >
    <div className="space-y-2 px-2 pt-4 pb-6 text-center sm:px-3">
      {links.map((link: LinkType) => (
        <Link
          href={link.href}
          className="hover:text-light-green block rounded-md px-3 py-3 text-base font-medium text-white transition-colors duration-200 ease-in-out"
          key={link.label}
          prefetch={true}
        >
          {link.label}
        </Link>
      ))}

      <div className="flex flex-col items-center space-y-3 pt-4">
        <SignedIn>
          <Link href={showDashboard ? '/mentor' : '/dashboard/certificates'}>
            <Button>{showDashboard ? 'Dashboard' : 'Certificates'}</Button>
          </Link>
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
  const [showDashboard, setShowDashboard] = useState(false);

  // Determine if current signed-in user is trainer/admin by querying /api/users?role=trainer/admin
  useEffect(() => {
    let active = true;
    const checkRole = async () => {
      try {
        // Grab all users (small list) and match by Clerk ID via /api/users
        const res = await fetch('/api/users', { cache: 'no-store' });
        if (!res.ok) return;
        const users = (await res.json()) as Array<{
          clerkId?: string | null;
          role?: string | null;
        }>;
        // Clerk user id is only available client-side via window.Clerk?.user?; easier path: hit dedicated endpoint for me only if exists.
        // Fallback: we infer by checking window.Clerk.user.id if available
        const clerkId =
          typeof window !== 'undefined' &&
          typeof (window as unknown as { Clerk?: { user?: { id?: string } } }).Clerk?.user?.id ===
            'string'
            ? ((window as unknown as { Clerk?: { user?: { id?: string } } }).Clerk!.user!
                .id as string)
            : null;
        if (!clerkId) return;
        const me = users.find((u) => u.clerkId === clerkId);
        if (!me) return;
        if (me.role === 'trainer' || me.role === 'admin') {
          if (active) setShowDashboard(true);
        }
      } catch {
        // ignore
      }
    };
    void checkRole();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative z-50">
      <nav className="bg-green border-border-white fixed top-0 right-0 left-0 z-50 rounded-b-3xl border px-4 sm:px-4 md:relative md:mx-12 md:mt-10 md:rounded-lg md:px-4 lg:mx-32 lg:mt-8 lg:rounded-xl lg:px-4">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:h-16 sm:px-1 md:h-20 lg:h-20 lg:px-1">
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
            <div className="hidden items-center md:flex">
              <div className="flex space-x-4">
                {links.map((link: LinkType) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    prefetch={true}
                    className="hover:text-light-green font-Inter rounded-md px-3 py-2 text-white"
                    style={{
                      transition: 'color 0.1s ease-in-out',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="ml-auto hidden items-center space-x-4 md:flex">
            <SignedIn>
              <Link href={showDashboard ? '/mentor' : '/dashboard/certificates'}>
                <Button>{showDashboard ? 'Dashboard' : 'Certificates'}</Button>
              </Link>
              {/* Notifications */}
              <NotificationBell />
              {/* Reserve space for UserButton to prevent layout shift */}
              <div className="flex h-8 w-8 items-center justify-center">
                <UserButton
                  userProfileMode="modal"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: 'w-8 h-8',
                    },
                  }}
                />
              </div>
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in">
                <Button>Login</Button>
              </Link>
            </SignedOut>
          </div>

          <div className="flex items-center space-x-2 md:hidden">
            <SignedIn>
              {/* Mobile Notifications */}
              <NotificationBell />
              {/* Mobile UserButton - Reserve space to prevent layout shift */}
              <div className="flex h-8 w-8 items-center justify-center">
                <UserButton
                  userProfileMode="modal"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: 'w-8 h-8',
                    },
                  }}
                />
              </div>
            </SignedIn>
            <MenuButton showMenu={showMenu} toggleMenu={toggleMenu} />
          </div>
        </div>
      </nav>
      <MobileMenu isVisible={showMenu} showDashboard={showDashboard} />
    </div>
  );
};

export default Navigation;
