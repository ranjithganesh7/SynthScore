"use client"

interface HeroProps {
  scrollY: number
}

export default function Hero({ scrollY }: HeroProps) {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Ir9QNbpCgC2kHuOXpFLuFErrgyXlqq.png')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6">
        {/* Glowing Vortex Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 via-orange-400/10 to-transparent blur-3xl animate-pulse" />
        </div>

        {/* Main Title - positioned above the book */}
        <h1 className="absolute top-1/4 left-1/2 -translate-x-1/2 text-7xl md:text-8xl font-serif font-light text-white/95 tracking-tight drop-shadow-lg py-0 px-96 my-[-45px] mx-[-3px]">
          SynthScore
        </h1>

        {/* Right side content - tagline and description */}

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}
