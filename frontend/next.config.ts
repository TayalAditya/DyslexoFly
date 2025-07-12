import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: {
    position: 'bottom-left'
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // ESLint is now enabled during builds
  eslint: {
    dirs: ['src']
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'dyslexofly.onrender.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/u/**',
      },
      {
        protocol: 'https',
        hostname: 'dyslexofly.onrender.com',
        port: '',
        pathname: '/api/**',
      },
    ],
  }
};

export default nextConfig;
