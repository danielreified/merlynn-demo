import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@merlynn/ui"],
  serverExternalPackages: ["@merlynn/db", "mongoose"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent webpack from bundling mongoose — it breaks DocumentArray
      // when minified. serverExternalPackages alone doesn't work for
      // transitive deps of workspace packages.
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
