import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@merlynn/ui"],
  serverExternalPackages: ["@merlynn/db", "mongoose", "bcryptjs"],
};

export default nextConfig;
