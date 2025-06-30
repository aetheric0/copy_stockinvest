// lib/cache.ts
interface CacheStore {
  [key: string]: {
    data: any
    expires: number
  }
}

const cache: CacheStore = {}

export default {
  get: async (key: string) => cache[key]?.data || null,
  set: async (key: string, data: any, ttl: number = 60) => {
    cache[key] = {
      data,
      expires: Date.now() + ttl * 1000
    }
  }
}