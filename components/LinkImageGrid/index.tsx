'use client';

import React, { useState } from 'react';

import Image from 'next/image';

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
    <div className="mx-auto grid h-4/5 grid-cols-2 items-center justify-center gap-4 px-8 sm:m-8 md:m-6 md:grid-cols-3 md:px-6 lg:m-4 lg:grid-cols-6 lg:px-8">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className="relative">
            <Image
              src={hoveredIndex === index ? link.hoverImgSrc : link.imgSrc}
              alt={link.altText || 'Partner logo'}
              width={0}
              height={0}
              sizes="100vw"
              className="h-auto w-auto object-contain transition-transform duration-200"
            />
          </div>
        </a>
      ))}
    </div>
  );
};

export default LinkImageGrid;
