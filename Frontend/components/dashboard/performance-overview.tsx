"use client"

import { TrendingUp, AlertCircle } from "lucide-react"

interface PerformanceData {
  finalScore: number
  totalQuestions: number
  percentage: number
  focusAreas: string[]
}

interface PerformanceOverviewProps {
  data: PerformanceData
}

export default function PerformanceOverview({ data }: PerformanceOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Results Card */}
      <div className="bg-card rounded-lg border border-border p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-light text-foreground mb-2">Your Results</h2>
            <p className="text-muted-foreground text-sm">Assessment Performance Summary</p>
          </div>
          <TrendingUp size={24} className="text-amber-500" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-background rounded-lg p-6 border border-border">
            <p className="text-sm text-muted-foreground mb-2">Final Score</p>
            <p className="text-4xl font-light text-amber-500 mb-1">
              {data.finalScore}/{data.totalQuestions}
            </p>
            <p className="text-lg text-foreground font-light">{data.percentage.toFixed(1)}%</p>
          </div>

          <div className="bg-background rounded-lg p-6 border border-border">
            <p className="text-sm text-muted-foreground mb-2">Performance Level</p>
            <p className="text-2xl font-light text-foreground mb-1">
              {data.percentage >= 80 ? "Excellent" : data.percentage >= 60 ? "Good" : "Needs Improvement"}
            </p>
            <div className="w-full bg-border rounded-full h-2 mt-3">
              <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${data.percentage}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Focus Areas */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={20} className="text-amber-500" />
          <h3 className="text-lg font-light text-foreground">Recommended Focus Areas</h3>
        </div>

        <div className="space-y-3">
          {data.focusAreas.map((area, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-light text-amber-500">{index + 1}</span>
              </div>
              <p className="text-sm font-light text-foreground leading-relaxed">{area}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4 p-4 bg-background rounded-lg border border-border">
          Focus on these areas to improve your performance. Your teacher can provide additional resources and support.
        </p>
      </div>
    </div>
  )
}
