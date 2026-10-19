import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TransRoute - Indian Box & Cargo Transport Finder",
    short_name: "TransRoute",
    description:
      "Search and filter road freight operators, LTL parcel booking offices, and carton dispatch godowns across India.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#ea580c",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
