"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isWhiteSectionVisible, setIsWhiteSectionVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const sections = ["about", "features", "team", "footer"]
    const observers = []

    sections.forEach((sectionId) => {
      const section = document.getElementById(sectionId)
      if (!section) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsWhiteSectionVisible(true)
          } else {
            // Check if any other white section is still visible
            const anyVisible = sections.some((id) => {
              const el = document.getElementById(id)
              if (!el) return false
              const rect = el.getBoundingClientRect()
              return rect.top < window.innerHeight && rect.bottom > 0
            })
            setIsWhiteSectionVisible(anyVisible)
          }
        },
        { threshold: 0.1 },
      )

      observer.observe(section)
      observers.push(observer)
    })

    return () => observers.forEach((obs) => obs.disconnect())
  }, [])

  return (
    <nav className="fixed top-8 left-0 right-0 z-50 flex items-center justify-center gap-12">
      <Link
        href="/"
        className={`text-2xl font-light italic absolute left-8 transition-colors duration-300 ${
          isWhiteSectionVisible ? "text-white" : "text-white"
        }`}
      >
        SynthScore
      </Link>

      {/* Pill-shaped Navigation Bar - Centered */}
      <div
        className={`transition-all duration-300 rounded-full ${
          isWhiteSectionVisible
            ? "backdrop-blur-md bg-black border border-white/20"
            : isScrolled
              ? "backdrop-blur-md bg-white/15"
              : "backdrop-blur-sm bg-white/10"
        }`}
      >
        <div className="flex items-center justify-center gap-8 px-8 py-3 rounded-full">
          {/* Navigation Links */}
          <Link
            href="#about"
            className={`transition-colors text-sm font-light ${
              isWhiteSectionVisible ? "text-white hover:text-white/80" : "text-white/80 hover:text-white"
            }`}
          >
            About
          </Link>
          <Link
            href="#features"
            className={`transition-colors text-sm font-light ${
              isWhiteSectionVisible ? "text-white hover:text-white/80" : "text-white/80 hover:text-white"
            }`}
          >
            Features
          </Link>
          <Link
            href="#team"
            className={`transition-colors text-sm font-light ${
              isWhiteSectionVisible ? "text-white hover:text-white/80" : "text-white/80 hover:text-white"
            }`}
          >
            Our Team
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4 absolute right-8">
        <Link
          href="/signin"
          className={`transition-colors text-sm font-light ${
            isWhiteSectionVisible ? "text-white hover:text-white/80" : "text-white/80 hover:text-white"
          }`}
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className={`px-4 py-1.5 rounded-full transition-colors text-sm font-light border ${
            isWhiteSectionVisible
              ? "bg-white/20 hover:bg-white/30 text-white border-white/30"
              : "bg-white/20 hover:bg-white/30 text-white border-white/30"
          }`}
        >
          Sign Up
        </Link>
      </div>
    </nav>
  )
}
