import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  reactCompiler: true,
  output: "standalone",

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
  ],
};

export default nextConfig;
