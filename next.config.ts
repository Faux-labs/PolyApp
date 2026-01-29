import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compress: false, // Disable Next.js compression to avoid conflicts with Cloudflare Tunnels
};

export default nextConfig;
