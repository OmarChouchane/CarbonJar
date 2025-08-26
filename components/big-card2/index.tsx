'use client';

import React from 'react';

import Image from 'next/image';
import { IoIosArrowForward } from 'react-icons/io';

import Button from '../button';
import { SmallerH1, H2 } from '../Heading';

interface BigCardProps {
  title: string;
  description1?: string;
  Maindescription: string;
  description: React.ReactNode;
  button1?: string;
  icon?: string;
}

const BigCard2: React.FC<BigCardProps> = ({
  title,
  description,
  Maindescription,
  icon,
  button1,
  description1,
}) => (
  <div className="bg-light-green border-lighter-green mx-auto flex flex-col items-start justify-start rounded-lg border p-2 lg:mt-12 lg:flex-row lg:items-stretch lg:p-8">
    <div className="flex w-full flex-col items-start justify-start gap-6 lg:ml-6">
      <div className="flex flex-col items-start justify-start">
        <SmallerH1 className="w-full text-center">{title}</SmallerH1>
        <br />
        {description1 && <H2 className="text-left">{description1}</H2>}

        <div className="mx-6 flex items-center gap-2">
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
          <H2 className="text-left font-bold">{Maindescription}</H2>
        </div>
        <H2 className="mx-2 pl-10 text-left lg:mx-6">{description}</H2>
      </div>

      {button1 && (
        <div className="flex w-full justify-end gap-3">
          <div className="mx-auto flex items-center lg:mx-8">
            <Button primary>
              {button1}
              <IoIosArrowForward className="ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default BigCard2;
