import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@merlynn/ui", "@merlynn/db"],
  serverExternalPackages: ["mongoose", "bcryptjs"],
};

export default nextConfig;
