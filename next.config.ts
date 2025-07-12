import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "logos-world.net",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        port: "",
        pathname: "/wikipedia/commons/**",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        port: "",
        pathname: "/npm/**",
      },
    ],
  },
};

export default nextConfig;
