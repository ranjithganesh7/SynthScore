"use client"

import React, { useEffect, useRef, useState } from "react"
import { BookOpen, Lock, Sparkles, LayoutDashboard, Search, Shield } from "lucide-react"

const features = [
  {
    title: "Unified Storage",
    description: "Keep all your ideas, saves, sparks, reads, and visuals in one beautifully organized space.",
    icon: <LayoutDashboard className="w-10 h-10 text-amber-600" />,
  },
  {
    title: "Privacy First",
    description: "Your thoughts are yours alone. All data is encrypted and stored securely, just for you.",
    icon: <Lock className="w-10 h-10 text-amber-600" />,
  },
  {
    title: "Smart Search",
    description: "Quickly find what you need with our powerful search and intuitive tagging system.",
    icon: <Search className="w-10 h-10 text-amber-600" />,
  },
  {
    title: "Seamless Organization",
    description: "Intuitive collections and categorization make managing your content effortless.",
    icon: <BookOpen className="w-10 h-10 text-amber-600" />,
  },
  {
    title: "Data Security",
    description: "Enterprise-grade encryption keeps your information safe and private at all times.",
    icon: <Shield className="w-10 h-10 text-amber-600" />,
  },
  {
    title: "Smart Features",
    description: "Advanced tools that help you work smarter and more efficiently every day.",
    icon: <Sparkles className="w-10 h-10 text-amber-600" />,
  },
]

export default function Features() {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="features"
      ref={ref}
      className={`relative py-24 transition-opacity duration-1000 bg-white ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 mb-4">Features</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto rounded-full" />
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-xl bg-white border border-gray-100 hover:border-amber-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-6 group-hover:bg-amber-100 transition-colors duration-300">
                {React.cloneElement(feature.icon, { className: 'w-6 h-6 text-amber-600' })}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
