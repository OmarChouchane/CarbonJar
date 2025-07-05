export default function Home() {
  return (
    <nav className="bg-green lg:mx-32 sm:mx-8 md:mx-12 lg:mt-8 md:mt-10 px-4 sm:px-4 lg:px-4 rounded-lg lg:rounded-xl border border-border-white">
      <div className="flex items-center justify-between lg:h-20 md:h-20 sm:h-18 px-4 sm:px-1 lg:px-1 mx-auto">
        <div className="flex-shrink-0">
          <a href="/">
            <img
              className="h-12 w-12"
              src="logoCarbonJar.svg"
              alt="logo"
              width={48}
              height={48}
            />
          </a>
        </div>

        {/* Desktop menu links */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="items-baseline lg:space-x-4 flex justify-center">
            <a href="/" className="text-white hover:text-light-green px-3 py-2 rounded-md font-inter">
              Home
            </a>
            <a href="/about" className="text-white hover:text-light-green px-3 py-2 rounded-md font-inter">
              About us
            </a>
            <a href="/expertise" className="text-white hover:text-light-green px-3 py-2 rounded-md font-inter">
              Expertise
            </a>
            <a href="/trainings" className="text-white hover:text-light-green px-3 py-2 rounded-md font-inter">
              Trainings
            </a>
            <a href="/" className="text-white hover:text-light-green px-3 py-2 rounded-md font-inter">
              Resources
            </a>
            <a href="/" className="text-white hover:text-light-green px-3 py-2 rounded-md font-inter">
              Careers
            </a>
          </div>
        </div>

        {/* Contact us button */}
        <div className="hidden md:block">
          <div className="ml-4 flex items-center md:ml-10">
            <button className="bg-light-green text-white px-4 py-2 rounded-md hover:bg-green-dark font-semibold">
              Contact us
            </button>
          </div>
        </div>

        {/* Mobile menu icon (static, no toggle) */}
        <div className="-mr-2 flex md:hidden">
          <button type="button" className="p-2 text-white" aria-label="Open menu">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu (always visible here) */}
      <div className="md:hidden bg-green px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <a href="/" className="text-white block px-3 py-2 text-base font-medium">
          Home
        </a>
        <a href="/about" className="text-white block px-3 py-2 text-base font-medium">
          About us
        </a>
        <a href="/expertise" className="text-white block px-3 py-2 text-base font-medium">
          Expertise
        </a>
        <a href="/trainings" className="text-white block px-3 py-2 text-base font-medium">
          Trainings
        </a>
        <a href="/" className="text-white block px-3 py-2 text-base font-medium">
          Resources
        </a>
        <a href="/" className="text-white block px-3 py-2 text-base font-medium">
          Careers
        </a>
      </div>
    </nav>
  );
}
