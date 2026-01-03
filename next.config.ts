import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@prisma/client', 'prisma'],
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pinimg.com",
        pathname: "/736x/9a/83/ef/9a83ef6460721ba0e09b5fc69bc5d64b.jpg"
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
        pathname: "/736x/10/ea/c5/10eac55b589ea817e7aa5eb7471c141a.jpg"
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
        pathname: "/736x/6e/22/33/6e22335dfb94c453afefc69cb46528f2.jpg"
      }
    ]
  }
};

export default nextConfig;