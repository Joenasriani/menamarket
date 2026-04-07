import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure workspace packages are transpiled correctly during Next.js build
  transpilePackages: ["@menamarket/ui", "@menamarket/api"],
};

export default nextConfig;
