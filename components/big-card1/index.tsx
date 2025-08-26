import React from "react";

import Image from "next/image";
import { IoIosArrowForward } from "react-icons/io";

import Button from "../button";
import { SmallerH1, H2, H3 } from "../Heading";

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
  <div className="flex lg:m-8 m-4 flex-col lg:flex-row justify-start items-center lg:items-stretch gap-4 p-4 rounded-lg border border-lighter-green">
    <div className="relative w-full lg:w-[500px] h-[294px] rounded-lg overflow-hidden">
      <Image
        src={image}
        alt={title}
        fill
        style={{ objectFit: "cover" }}
        sizes="(min-width: 1024px) 500px, 100vw"
        priority
      />
    </div>
    <div className="flex flex-col justify-center items-start gap-6 lg:ml-6 w-full">
      <div className="flex flex-col justify-start items-start gap-3 w-full">
        <SmallerH1 className="mx-4">{title}</SmallerH1>
        <br />
        <H2 className="font-bold">{Maindescription}</H2>
        <H3 className="text-left">{description}</H3>
      </div>
      <div className="flex gap-3 justify-end w-full">
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
