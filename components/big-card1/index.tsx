import React from 'react';

import Image from 'next/image';
import { IoIosArrowForward } from 'react-icons/io';

import Button from '../button';
import { SmallerH1, H2, H3 } from '../Heading';

interface BigCardProps {
  title: string;
  image: string;
  Maindescription?: string;
  description: React.ReactNode;
  button1?: string;
  button2?: string;
}

const BigCard1: React.FC<BigCardProps> = ({
  title,
  image,
  description,
  Maindescription,
  button1,
  button2,
}) => (
  <div className="border-lighter-green m-4 flex flex-col items-center justify-start gap-4 rounded-lg border p-4 lg:m-8 lg:flex-row lg:items-stretch">
    <div className="relative h-[294px] w-full overflow-hidden rounded-lg lg:w-[500px]">
      <Image
        src={image}
        alt={title}
        fill
        style={{ objectFit: 'cover' }}
        sizes="(min-width: 1024px) 500px, 100vw"
        priority
      />
    </div>
    <div className="flex w-full flex-col items-start justify-center gap-6 lg:ml-6">
      <div className="flex w-full flex-col items-start justify-start gap-3">
        <SmallerH1 className="mx-4">{title}</SmallerH1>
        <br />
        <H2 className="font-bold">{Maindescription}</H2>
        <H3 className="text-left">{description}</H3>
      </div>
      <div className="flex w-full justify-end gap-3">
        {button1 && <Button secondary>{button1}</Button>}
        <div className="flex items-center">
          {button2 && (
            <Button primary>
              {button2}
              <IoIosArrowForward className="ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default BigCard1;
