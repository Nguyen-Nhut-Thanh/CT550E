
import type { NextConfig } from "next";
import { config } from "dotenv";
import { resolve } from "node:path";

// Share the repository-root environment with the API and database workspace.
config({ path: resolve(__dirname, "../../.env"), quiet: true });

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_BUILD_DIR || ".next",
  transpilePackages: ["shared"],
  allowedDevOrigins: ["nhutthanh.id.vn", "www.nhutthanh.id.vn", "127.0.0.1"],
  async rewrites() {
    const apiOrigin = (process.env.API_INTERNAL_URL || "http://127.0.0.1:4000").replace(/\/+$/, "");
    return [
      { source: "/api/:path*", destination: `${apiOrigin}/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
      },
      {
        protocol: "https",
        hostname: "api.nhutthanh.id.vn",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
