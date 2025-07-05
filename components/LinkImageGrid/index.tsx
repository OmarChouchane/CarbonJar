'use client';

import React, { useState } from "react";
import Image from "next/image";


interface Link {
  url: string;
  imgSrc: string;
  altText?: string;
  hoverImgSrc: string;
}

interface LinkImageGridProps {
  links: Link[];
}

const LinkImageGrid: React.FC<LinkImageGridProps> = ({ links }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 justify-center items-center mx-auto h-12 lg:m-4 lg:px-8 px-8 sm:m-8 md:m-6 md:px-6">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-center items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className="w-20 h-20 lg:w-24 lg:h-24 relative">
            <Image
              src={hoveredIndex === index ? link.hoverImgSrc : link.imgSrc}
              alt={link.altText || "Partner logo"}
              fill={true}
              className="object-contain transition-opacity duration-200"
            />
          </div>
        </a>
      ))}
    </div>
  );
};

export default LinkImageGrid;
