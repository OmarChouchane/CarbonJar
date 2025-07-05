"use client";

import React from "react";
import Image from "next/image";
import { H2, H2Bold } from "../Heading";

interface BigCardProps {
  title: React.ReactNode;
  description: React.ReactNode;
  icon?: string;
}

const BigCard3: React.FC<BigCardProps> = ({ title, description, icon }) => (
  <div className="flex lg:mt-20 lg:m-8 m-4 flex-col bg-green lg:flex-row justify-start items-center lg:items-stretch gap-4 p-6 rounded-lg border border-lighter-green">
    <div className="flex flex-col justify-center items-start gap-6 lg:ml-6 w-full">
      <div className="flex flex-col justify-start items-start gap-3 w-full">
        <div className="flex items-center gap-2 mx-4">
          <H2Bold className="text-white-light">{title}</H2Bold>
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
        </div>
        <H2 className="text-left text-white-light">{description}</H2>
      </div>
    </div>
  </div>
);

export default BigCard3;
