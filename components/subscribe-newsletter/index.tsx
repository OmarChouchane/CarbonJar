import React from 'react';

import Button from '../button';
import { SmallerH1 } from '../Heading';

const NewsletterSubscription = () => {
  return (
    <section className="flex items-center justify-center">
      <div className="mt-12 w-full lg:mt-0 lg:w-1/2">
        <div className="border-lighter-green rounded-xl border px-4 py-5 shadow-md">
          <SmallerH1 className="mb-4 text-lg md:text-xl lg:text-2xl">
            Subscribe to our newsletter
          </SmallerH1>
          <div className="flex w-full gap-8">
            <input
              aria-label="full name"
              type="text"
              className="border-lighter-grey focus:bg-white-light text-grey w-full min-w-0 rounded border bg-white px-3 py-2"
              placeholder="Enter your full name"
            />
            <input
              aria-label="email address"
              type="text"
              className="border-lighter-grey focus:bg-white-light text-grey w-full min-w-0 rounded border bg-white px-3 py-2"
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
