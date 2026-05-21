import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://cateringslaski.pl"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/checkout",
          "/koszyk",
          "/konto",
          "/zamowienie/", // tokenized order pages — private
          "/*?token=", // any URL with token
        ],
      },
      // AI/LLM crawlers — allow training on public pages (good for AI search visibility)
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: SITE_URL + "/sitemap.xml",
    host: SITE_URL,
  }
}
