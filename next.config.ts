import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
module.exports = {
  images: {
    domains: ['assets.coingecko.com']
  },
  experimental: {
    serverActions: {},
  }
}
export default nextConfig;
