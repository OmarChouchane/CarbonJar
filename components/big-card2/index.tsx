"use client";

import React from "react";
import Image from "next/image";
import { SmallerH1, H2 } from "../Heading";
import Button from "../button";
import { IoIosArrowForward } from "react-icons/io";

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
  <div className="flex lg:mt-12 flex-col bg-light-green mx-auto lg:flex-row justify-start items-start lg:items-stretch lg:p-8 p-2 rounded-lg border border-lighter-green">
    <div className="flex flex-col justify-start items-start gap-6 lg:ml-6 w-full">
      <div className="flex flex-col justify-start items-start">
        <SmallerH1 className=" text-center w-full">{title}</SmallerH1>
        <br />
        {description1 && <H2 className="text-left">{description1}</H2>}

        <div className="flex items-center mx-6 gap-2">
          {icon && (
            <div className="relative w-6 h-6">
              <Image
                src={icon}
                alt="icon"
                fill
                style={{ objectFit: "contain" }}
                sizes="24px"
                priority
              />
            </div>
          )}
          <H2 className="font-bold text-left">{Maindescription}</H2>
        </div>
        <H2 className="lg:mx-6 pl-10 mx-2 text-left">{description}</H2>
      </div>

      {button1 && (
        <div className="flex gap-3 justify-end w-full">
          <div className="flex items-center mx-auto lg:mx-8">
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
