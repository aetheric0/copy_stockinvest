// lib/cache.ts
interface CacheEntry {
  data: unknown
  expires: number
}

interface CacheStore {
  [key: string]: CacheEntry
}

const cache: CacheStore = {}

/** Named export object so it’s not anonymous */
const Cache = {
  async get(key: string): Promise<unknown | null> {
    const entry = cache[key]
    if (!entry || entry.expires < Date.now()) return null
    return entry.data
  },

  async set(key: string, data: unknown, ttl: number = 60): Promise<void> {
    cache[key] = {
      data,
      expires: Date.now() + ttl * 1000,
    }
  },
}

export default Cache
