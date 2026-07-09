/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a self-contained build in .next/standalone for Docker deploys
  output: "standalone",
};

export default nextConfig;
