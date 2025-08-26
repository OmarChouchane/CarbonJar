'use client';

import React from 'react';

import Image from 'next/image';

import { H2, H2Bold } from '../Heading';

interface BigCardProps {
  title: React.ReactNode;
  description: React.ReactNode;
  icon?: string;
}

const BigCard3: React.FC<BigCardProps> = ({ title, description, icon }) => (
  <div className="bg-green border-lighter-green m-4 flex flex-col items-center justify-start gap-4 rounded-lg border p-6 lg:m-8 lg:mt-20 lg:flex-row lg:items-stretch">
    <div className="flex w-full flex-col items-start justify-center gap-6 lg:ml-6">
      <div className="flex w-full flex-col items-start justify-start gap-3">
        <div className="mx-4 flex items-center gap-2">
          <H2Bold className="text-white-light">{title}</H2Bold>
          {icon && (
            <div className="relative h-6 w-6">
              <Image
                src={icon}
                alt="icon"
                fill
                style={{ objectFit: 'contain' }}
                sizes="24px"
                priority
              />
            </div>
          )}
        </div>
        <H2 className="text-white-light text-left">{description}</H2>
      </div>
    </div>
  </div>
);

export default BigCard3;
