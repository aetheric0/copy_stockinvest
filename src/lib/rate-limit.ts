import type { NextRequest } from "next/server"

// Simple in-memory store for rate limiting
// NOTE: This approach has limitations in a multi-instance environment
// For production, consider using a distributed cache like Redis
const inMemoryStore = new Map<string, { count: number; timestamp: number }>()

// Configuration
const DEFAULT_LIMIT = 20 // requests
const DEFAULT_WINDOW = 60 // seconds

type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  retryAfter: number
}

/**
 * Get a unique identifier for the request
 * Since req.ip is not available, we use a combination of headers
 */
function getRequestIdentifier(req: NextRequest): string {
  // Try to get identifying information from headers
  const forwardedFor = req.headers.get("x-forwarded-for")
  const userAgent = req.headers.get("user-agent") || "unknown"

  // Use a combination of headers and URL path as identifier
  // This is not as reliable as IP but can work as a fallback
  const identifier = forwardedFor ? `${forwardedFor}` : `${userAgent.substring(0, 50)}`

  return `${identifier}:${req.nextUrl.pathname}`
}

/**
 * Simple in-memory rate limiter
 * WARNING: This implementation only works reliably in a single-instance deployment.
 * For multi-instance deployments, use a distributed cache solution.
 */
export function rateLimit(req: NextRequest, limit = DEFAULT_LIMIT, window = DEFAULT_WINDOW): RateLimitResult {
  // Get a unique identifier for this request
  const key = getRequestIdentifier(req)

  const now = Date.now()
  const windowMs = window * 1000

  // Clean up expired entries (simple garbage collection)
  // In a high-traffic API, you might want to do this less frequently
  if (Math.random() < 0.01) {
    // ~1% chance to run cleanup on any request
    for (const [storedKey, data] of inMemoryStore.entries()) {
      if (now - data.timestamp > windowMs) {
        inMemoryStore.delete(storedKey)
      }
    }
  }

  // Get or create entry
  const entry = inMemoryStore.get(key) || { count: 0, timestamp: now }

  // Reset if window expired
  if (now - entry.timestamp > windowMs) {
    entry.count = 0
    entry.timestamp = now
  }

  // Increment count
  entry.count++
  inMemoryStore.set(key, entry)

  const remaining = Math.max(0, limit - entry.count)
  const success = entry.count <= limit

  // Calculate retry after time if rate limited
  const retryAfter = success ? 0 : Math.ceil((windowMs - (now - entry.timestamp)) / 1000)

  return {
    success,
    limit,
    remaining,
    retryAfter,
  }
}
