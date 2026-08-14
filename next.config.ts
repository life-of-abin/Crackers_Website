import type { NextConfig } from "next";

const nextConfig: any = {
  allowedDevOrigins: ["10.174.74.182"],
  experimental: {
    cpus: 1,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;