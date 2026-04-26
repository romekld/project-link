export const dynamic = "force-static"

export function GET() {
  const manifest = {
    name: "Project LINK — RHM",
    short_name: "LINK RHM",
    description: "Rural Health Midwife operations — health station management and field coordination.",
    start_url: "/rhm/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#18181b",
    orientation: "any",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["health", "medical", "utilities"],
  }

  return Response.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  })
}
