"use client"

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="relative py-8 px-6 bg-[#AC7965]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Copyright */}
          <p className="text-white/90 text-sm font-light">© 2025 SynthScore. All rights reserved.</p>

          {/* Center: Quick Links */}
          <div className="flex items-center gap-6">
            <Link href="#" className="text-white/90 hover:text-white transition-colors text-sm font-light">
              Privacy Policy
            </Link>
            <div className="w-px h-4 bg-white/30" />
            <Link href="#" className="text-white/90 hover:text-white transition-colors text-sm font-light">
              Contact
            </Link>
          </div>

          {/* Social Icons Removed */}
        </div>
      </div>
    </footer>
  )
}
