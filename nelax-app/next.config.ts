import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/marketpalce',
        destination: '/marketplace',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/onboarding',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
