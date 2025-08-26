import React, { type HTMLAttributes } from 'react';

interface HeadingProps extends HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

export const H1: React.FC<HeadingProps> = ({ children, className = '', ...props }) => (
  <h1
    className={`font-custom text-green text-center text-4xl leading-snug md:text-5xl lg:text-7xl ${className}`}
    {...props}
  >
    {children}
  </h1>
);

export const SmallerH1: React.FC<HeadingProps> = ({ children, className = '', ...props }) => (
  <h1
    className={`font-custom text-green text-center text-2xl leading-snug md:text-3xl lg:text-4xl ${className}`}
    {...props}
  >
    {children}
  </h1>
);

export const H2: React.FC<HeadingProps> = ({ children, className = '', ...props }) => (
  <h2
    className={`text-green font-Inter text-center text-base sm:mx-6 md:text-base lg:text-lg ${className}`}
    {...props}
  >
    {children}
  </h2>
);

export const H2Bold: React.FC<HeadingProps> = ({ children, className = '', ...props }) => (
  <h2
    className={`text-green font-Inter text-center text-lg font-bold md:text-base lg:text-lg ${className}`}
    {...props}
  >
    {children}
  </h2>
);

export const H3: React.FC<HeadingProps> = ({ children, className = '', ...props }) => (
  <h3 className={`text-green font-Inter text-center text-base ${className}`} {...props}>
    {children}
  </h3>
);

export const Title: React.FC<HeadingProps> = ({ children, className = '', ...props }) => (
  <h2
    className={`text-green font-Inter m-4 text-center text-base md:text-lg lg:text-xl ${className}`}
    {...props}
  >
    {children}
  </h2>
);

export const H1Inter: React.FC<HeadingProps> = ({ children, className = '', ...props }) => (
  <h2
    className={`text-green font-Inter text-xl font-bold md:text-xl lg:text-2xl ${className}`}
    {...props}
  >
    {children}
  </h2>
);
