import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  // weight: ['400', '500', '700'] // can specify if needed
});

export const metadata: Metadata = {
  title: "CarbonJar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans text-center bg-lighter-green min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}

