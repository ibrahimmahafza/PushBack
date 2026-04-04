import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse v2 bundles pdf.js with a worker that needs native Node module
  // resolution — webpack bundling breaks it. Externalizing it lets Next.js
  // use require() directly in the serverless function.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
