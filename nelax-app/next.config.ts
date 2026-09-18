import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/marketpalce',
        destination: '/marketplace',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
