import React from "react";

interface HeadingProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

export const H1: React.FC<HeadingProps> = ({
  children,
  className = "",
  ...props
}) => (
  <h1
    className={`font-custom text-4xl md:text-5xl lg:text-7xl text-center leading-snug text-green ${className}`}
    {...props}
  >
    {children}
  </h1>
);

export const SmallerH1: React.FC<HeadingProps> = ({
  children,
  className = "",
  ...props
}) => (
  <h1
    className={`font-custom text-2xl md:text-3xl lg:text-4xl text-center leading-snug text-green ${className}`}
    {...props}
  >
    {children}
  </h1>
);

export const H2: React.FC<HeadingProps> = ({
  children,
  className = "",
  ...props
}) => (
  <h2
    className={`text-green text-center sm:mx-6 font-Inter text-base md:text-base lg:text-lg ${className}`}
    {...props}
  >
    {children}
  </h2>
);

export const H2Bold: React.FC<HeadingProps> = ({
  children,
  className = "",
  ...props
}) => (
  <h2
    className={`text-green text-center font-Inter text-lg font-bold md:text-base lg:text-lg ${className}`}
    {...props}
  >
    {children}
  </h2>
);

export const H3: React.FC<HeadingProps> = ({
  children,
  className = "",
  ...props
}) => (
  <h3
    className={`text-green text-center font-Inter text-base ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const Title: React.FC<HeadingProps> = ({
  children,
  className = "",
  ...props
}) => (
  <h2
    className={`text-green text-center m-4 font-Inter text-base md:text-lg lg:text-xl ${className}`}
    {...props}
  >
    {children}
  </h2>
);

export const H1Inter: React.FC<HeadingProps> = ({
  children,
  className = "",
  ...props
}) => (
  <h2
    className={`text-green font-Inter text-xl font-bold md:text-xl lg:text-2xl ${className}`}
    {...props}
  >
    {children}
  </h2>
);
