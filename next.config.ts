import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.174.74.182"],
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;