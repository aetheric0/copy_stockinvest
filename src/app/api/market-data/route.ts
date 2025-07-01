// File: app/api/market-data/route.ts
import { NextResponse } from "next/server"

// Fetch top 10 coins by market cap from CoinGecko
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/markets'
const CACHE_TTL = 60 // seconds

let lastFetchTime = 0
let cachedData: unknown = null

// Force dynamic to allow caching logic
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 1. Return cached data if still fresh
    if (Date.now() - lastFetchTime < CACHE_TTL * 1000 && cachedData) {
      return NextResponse.json(cachedData, {
        headers: { 'X-Cache': 'HIT' }
      })
    }

    // 2. Build query params
    const params = new URLSearchParams({
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: '10',
      page: '1',
      sparkline: 'false',
      locale: 'en'
    })

    // 3. Fetch from CoinGecko
    const response = await fetch(`${COINGECKO_URL}?${params}`)

    // 4. Handle non-OK responses
    if (!response.ok) {
      if (cachedData) {
        return NextResponse.json(cachedData, {
          headers: { 'X-Cache': 'FALLBACK' }
        })
      }
      // No cached data: return error to client
      return NextResponse.json(
        { error: `CoinGecko API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    // 5. Parse JSON and update cache
    const data = await response.json()
    cachedData = data
    lastFetchTime = Date.now()

    // 6. Return fresh data with caching headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL - 1}`,
        'X-Cache': 'MISS'
      }
    })
  } catch (err: unknown) {
    console.error('Error fetching market data:', err)
    // On exception, fall back to cache or return 500
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: { 'X-Cache': 'FALLBACK' }
      })
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}