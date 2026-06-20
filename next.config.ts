import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    middlewareClientMaxBodySize: '25mb',
  },
};

export default nextConfig;
