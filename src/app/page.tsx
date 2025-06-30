import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { MarketCapTicker } from "@/components/market-cap-ticker"
import { SecondHeroSection } from "@/components/second-hero-section"
import { InlineMarketCap } from "@/components/inline-market-cap"
import { SubscriptionCards } from "@/components/subscription-cards"
import { MarketCap } from "@/components/market-cap"
import { TestimonialSection } from "@/components/testimonial_section"
import { TradingViewWidget } from "@/components/trading-view-widget"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <main className="mx-auto max-w-7xl px-4">
        <Navbar />
        <HeroSection />
        <MarketCapTicker />
        <SecondHeroSection />
        <InlineMarketCap />
        <SubscriptionCards />
        <MarketCap />
        <TestimonialSection />
        <TradingViewWidget />
      </main>
      <Footer />
    </div>
  )
}
