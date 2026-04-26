import type { NextConfig } from "next"
import withSerwistInit from "@serwist/next"

const nextConfig: NextConfig = {
  // Allow LAN-origin requests to Next.js dev assets while testing on other devices.
  allowedDevOrigins: ["192.168.18.66"],
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
  async rewrites() {
    return [
      {
        source: "/rhm-manifest.webmanifest",
        destination: "/rhm-manifest",
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ]
  },
}

export default withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
})(nextConfig)
