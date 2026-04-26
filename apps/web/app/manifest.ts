import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Project LINK — BHW",
    short_name: "LINK Field",
    description: "Barangay Health Worker field operations — household profiling and service recording.",
    start_url: "/bhw/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#18181b",
    orientation: "portrait",
    icons: [
      {
        src: "../public/vercel.svg",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "../public/vercel.svg",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["health", "medical", "utilities"],
  }
}
