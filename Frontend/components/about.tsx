"use client"

import { useEffect, useRef, useState } from "react"

export default function About() {
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
      id="about"
      ref={ref}
      className={`relative py-24 px-6 transition-opacity duration-1000 bg-gradient-to-b from-[#AC7965] to-white ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-black mb-4">About SynthScore</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto rounded-full" />
        </div>

        <p className="text-lg text-gray-800 leading-relaxed text-center font-light max-w-3xl mx-auto">
          Imagine a classroom where students pour their hearts onto paper, carefully crafting answers with curiosity and care. 
          This is where <b>SYNTHSCORE</b> comes in. Our AI-driven system reads every handwritten answer, understands the intent, and evaluates it with precision, fairness, and empathy. No more lost effort, no more delayed feedback; just a system that recognizes every student’s hard work and frees teachers to truly inspire, guide, and nurture young minds.
        </p>
      </div>
    </section>
  )
}
