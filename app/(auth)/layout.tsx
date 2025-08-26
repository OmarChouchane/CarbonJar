'use client';
import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-dotted-pattern min-h-screen w-full bg-cover bg-center" data-auth-page>
      {/* Navbar */}
      <nav className="bg-green border-border-white relative z-50 rounded-b-xl border px-4 sm:mx-8 sm:px-4 md:mx-12 lg:mx-32 lg:rounded-b-3xl lg:px-4">
        <div className="mx-auto flex h-17 items-center justify-center px-4 sm:h-30 sm:px-1 md:h-20 lg:h-20 lg:px-1">
          <Link href="/">
            <Image
              className="h-40 w-50"
              src="/CarbonJar3.svg"
              alt="CarbonJar"
              width={48}
              height={30}
              priority
            />
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div className="mt-8 flex w-full items-center justify-center sm:mt-6 md:mt-8 lg:mt-12">
        {children}
      </div>
    </div>
  );
};

export default Layout;
