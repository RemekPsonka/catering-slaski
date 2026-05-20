import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },


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
    // CSP — restrictive. unsafe-inline pozwalane dla JSON-LD <script type="application/ld+json">
    // i Next.js inline styles. Resztę zamykamy ścisło.
    const cspProd = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com https://cdn.cateringslaski.pl https://api.cateringslaski.pl",
      "connect-src 'self' https://api.cateringslaski.pl https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; ")

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), payment=(self), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: cspProd,
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
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
