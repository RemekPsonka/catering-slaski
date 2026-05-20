import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",

  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "cateringslaski.pl"],
    },
    typedRoutes: false,
  },

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.cateringslaski.pl" },
      // Medusa backend dla product images (in dev)
      { protocol: "http", hostname: "localhost", port: "9000" },
      { protocol: "https", hostname: "api.cateringslaski.pl" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ]
  },

  async rewrites() {
    return {
      beforeFiles: [
        // Stary sklep redirects (rewrite na nowe routes)
        { source: "/products", destination: "/menu" },
        { source: "/products/:slug", destination: "/produkt/:slug" },
        { source: "/products/account", destination: "/konto" },
        { source: "/products/cart", destination: "/koszyk" },
      ],
    }
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    })
    return config
  },
}

export default nextConfig
