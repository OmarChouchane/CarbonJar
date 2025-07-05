import React from "react";
import Button from "../button";
import { SmallerH1 } from "../Heading";

const NewsletterSubscription = () => {
  return (
    <section className="flex justify-center items-center">
      <div className="w-full lg:w-1/2 mt-12 lg:mt-0">
        <div className="border border-lighter-green rounded-xl py-5 px-4 shadow-md">
          <SmallerH1 className="mb-4 text-lg md:text-xl lg:text-2xl">
            Subscribe to our newsletter
          </SmallerH1>
          <div className="flex w-full gap-8">
            <input
              aria-label="full name"
              type="text"
              className="border border-lighter-grey bg-white focus:bg-white-light min-w-0 w-full rounded text-grey py-2 px-3"
              placeholder="Enter your full name"
            />
            <input
              aria-label="email address"
              type="text"
              className="border border-lighter-grey bg-white focus:bg-white-light min-w-0 w-full rounded text-grey py-2 px-3"
              placeholder="Enter your email"
            />
            <Button primary>Subscribe</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSubscription;
