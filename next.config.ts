import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'simak.unismuh.ac.id',
        port: '',
        pathname: '/**',
      },
    ],
  }
};

export default nextConfig;
