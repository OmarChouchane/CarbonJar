import React from "react";
import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full bg-dotted-pattern bg-cover bg-center">
      {/* Navbar */}
      <nav className="bg-green lg:mx-32 sm:mx-8 md:mx-12 lg:mt-0 md:mt-10 px-4 sm:px-4 lg:px-4 rounded-b-xl lg:rounded-b-3xl border border-border-white relative z-50">
        <div className="flex items-center justify-center lg:h-20 md:h-20 sm:h-30 h-17 px-4 sm:px-1 lg:px-1 mx-auto">
          <div className="flex-shrink-0">
            <Image
              className="h-40 w-50"
              src="/CarbonJar3.svg"
              alt="CarbonJar"
              width={48}
              height={30}
              priority
            />
          </div>
        </div>
      </nav>

      {/* Main content */}
    <div className="flex w-full items-center justify-center mt-10 sm:mt-6 md:mt-8 lg:mt-12">
      {children}
    </div>
    </div>
  );
};

export default Layout;
