import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@merlynn/ui", "@merlynn/db"],
  serverExternalPackages: ["mongoose"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent webpack from bundling mongoose — its DocumentArray
      // constructor breaks when webpack minifies it.
      // serverExternalPackages alone doesn't work for transitive
      // deps imported from workspace packages.
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "mongoose",
        /^mongoose\/.*/,
      ];
    }
    return config;
  },
};

export default nextConfig;
