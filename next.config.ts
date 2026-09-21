import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  async rewrites() {
    const backend =
      process.env.BACKEND_URL ??
      "https://detasawybackend-production.up.railway.app";
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
};
export default nextConfig;
