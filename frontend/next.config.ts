import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["10.10.66.23", "localhost:5000", "127.0.0.1:5000"],
};

export default nextConfig;
