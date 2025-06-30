"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Star } from "lucide-react"

interface Testimonial {
  id: number
  quote: string
  author: string
  role: string
  company: string
  rating: number
  avatar: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      "This investment platform helped me achieve a 32% return on my portfolio in just 6 months. The market insights and analytics are exceptional.",
    author: "James Wilson",
    role: "Portfolio Manager",
    company: "Capital Investments",
    rating: 5,
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    quote:
      "I've tried several investment platforms, but this one stands out with its intuitive interface and powerful analytics. My investment strategy has completely transformed.",
    author: "Emily Chen",
    role: "Retail Investor",
    company: "",
    rating: 5,
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    quote:
      "The real-time market data and AI-powered recommendations have given me an edge in the market. I've seen consistent growth across my diverse portfolio.",
    author: "Michael Rodriguez",
    role: "Financial Advisor",
    company: "Wealth Strategies Inc.",
    rating: 4,
    avatar: "/placeholder.svg?height=80&width=80",
  },
]

export function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const nextTestimonial = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [currentIndex])

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">What Our Investors Say</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of successful investors who have transformed their investment strategy with our platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>

              <div className="flex items-center">
                <div className="mr-4">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.author}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <h4 className="font-bold dark:text-white">{testimonial.author}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {testimonial.role}
                    {testimonial.company && `, ${testimonial.company}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Join Our Investment Community
          </button>
        </div>
      </div>
    </section>
  )
}
