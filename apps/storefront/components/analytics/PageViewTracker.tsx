"use client"
/**
 * Tracks page_view on route changes. Mounted once in root layout.
 * Uses next/navigation (App Router) — fires on every pathname/search change.
 */
import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { trackPageView } from "@/lib/analytics"

export function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    const qs = searchParams?.toString()
    const url = qs ? `${pathname}?${qs}` : pathname
    trackPageView(url)
  }, [pathname, searchParams])

  return null
}
