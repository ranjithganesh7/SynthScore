"use client"

import { LogOut } from "lucide-react"
import type { User } from "@/app/context/auth-context"

interface StudentHeaderProps {
  user: User
  onLogout: () => void
}

export default function StudentHeader({ user, onLogout }: StudentHeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-light text-foreground italic">SynthScore</h1>
          <p className="text-xs text-muted-foreground">Student Dashboard</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-light text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors text-sm font-light"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
