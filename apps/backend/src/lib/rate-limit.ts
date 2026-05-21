/**
 * Sliding-window rate limiter.
 *
 * Two backends:
 *  - Redis (if REDIS_URL set) — production grade, distributed
 *  - In-memory Map (fallback) — works for single-instance dev/MVP
 *
 * Usage in a route:
 *   const ok = await rateLimit({ key: `ip:${ip}:b2b-leads`, limit: 10, windowSec: 3600 })
 *   if (!ok.allowed) return res.status(429).json({ error: "Too many requests", retry_after: ok.retryAfter })
 */

import type { Redis } from "ioredis"

type RateLimitInput = {
  key: string
  limit: number
  windowSec: number
}

type RateLimitResult = {
  allowed: boolean
  remaining: number
  retryAfter: number // seconds
  limit: number
}

// In-memory store — Map<key, timestamps[]>
const memStore = new Map<string, number[]>()

// Lazy Redis init
let redisClient: Redis | null = null
let redisInitTried = false

async function getRedis(): Promise<Redis | null> {
  if (redisClient) return redisClient
  if (redisInitTried) return null
  redisInitTried = true
  if (!process.env.REDIS_URL) return null

  try {
    const Redis: any = (await import("ioredis")).default
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: false,
    })
    redisClient.on("error", (err: any) => {
      console.warn(`[rate-limit] Redis error, falling back to memory: ${err.message}`)
    })
    return redisClient
  } catch (err) {
    console.warn(`[rate-limit] Redis import failed, using in-memory: ${(err as Error).message}`)
    return null
  }
}

export async function rateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  const { key, limit, windowSec } = input
  const now = Date.now()
  const windowMs = windowSec * 1000
  const cutoff = now - windowMs

  const redis = await getRedis()

  if (redis) {
    try {
      // Sliding window with sorted set
      const pipe = redis.multi()
      pipe.zremrangebyscore(key, 0, cutoff)
      pipe.zadd(key, now, `${now}-${Math.random()}`)
      pipe.zcard(key)
      pipe.pexpire(key, windowMs)
      const results = await pipe.exec()
      const count = (results?.[2]?.[1] as number) ?? 0
      const allowed = count <= limit
      return {
        allowed,
        remaining: Math.max(0, limit - count),
        retryAfter: allowed ? 0 : windowSec,
        limit,
      }
    } catch (err) {
      // Redis hiccup — fall through to memory
      console.warn(`[rate-limit] Redis op failed, memory fallback: ${(err as Error).message}`)
    }
  }

  // In-memory fallback
  let entries = memStore.get(key) ?? []
  entries = entries.filter((t) => t > cutoff)
  entries.push(now)
  memStore.set(key, entries)

  // Cleanup old keys occasionally
  if (memStore.size > 10000 && Math.random() < 0.01) {
    for (const [k, v] of memStore.entries()) {
      if (v.length === 0 || v[v.length - 1] < cutoff) memStore.delete(k)
    }
  }

  const allowed = entries.length <= limit
  return {
    allowed,
    remaining: Math.max(0, limit - entries.length),
    retryAfter: allowed ? 0 : windowSec,
    limit,
  }
}

/**
 * Extract client IP from a request, respecting X-Forwarded-For when behind a trusted proxy.
 * Strips port suffix if present (e.g. "1.2.3.4:5678" → "1.2.3.4").
 */
export function getClientIp(req: any): string {
  const xff = req.headers?.["x-forwarded-for"]
  if (typeof xff === "string" && xff.length > 0) {
    return xff.split(",")[0].trim().replace(/:\d+$/, "")
  }
  if (Array.isArray(xff) && xff[0]) {
    return xff[0].split(",")[0].trim().replace(/:\d+$/, "")
  }
  const real = req.headers?.["x-real-ip"]
  if (typeof real === "string") return real.split(":")[0]
  return (req.ip || req.socket?.remoteAddress || "unknown").replace(/^::ffff:/, "")
}
