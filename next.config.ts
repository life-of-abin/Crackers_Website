import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 1,
  },
  allowedDevOrigins: ["10.125.53.182", "localhost", "127.0.0.1"],
};

export default nextConfig;