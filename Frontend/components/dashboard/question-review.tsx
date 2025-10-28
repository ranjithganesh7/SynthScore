"use client"

import { useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"

export interface Question {
  id: number
  status: "correct" | "incorrect"
  category: string
  masterKey: string
  studentAnswer: string
  logic: string
}

interface QuestionReviewProps {
  questions: Question[]
}

export default function QuestionReview({ questions }: QuestionReviewProps) {
  const correctCount = questions.filter((q) => q.status === "correct").length
  const incorrectCount = questions.filter((q) => q.status === "incorrect").length
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

  const toggleQuestion = (id: number) => {
    setExpandedQuestion(expandedQuestion === id ? null : id)
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="mb-6">
        <h3 className="text-xl font-light text-foreground mb-2">Detailed Question Analysis</h3>
        <p className="text-sm text-muted-foreground">
          {correctCount} correct, {incorrectCount} incorrect • {questions.length} total questions
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((question) => (
          <div key={question.id} className="border border-border rounded-lg overflow-hidden">
            {/* Question Header */}
            <div 
              className="p-4 bg-background cursor-pointer flex justify-between items-center"
              onClick={() => toggleQuestion(question.id)}
            >
              <div className="flex items-center gap-4">
                <span className="font-medium">Question {question.id}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-light ${
                  question.status === 'correct' 
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  {question.status.toUpperCase()}
                </span>
                <span className="text-sm text-muted-foreground">{question.category}</span>
              </div>
              <svg 
                className={`w-5 h-5 text-muted-foreground transition-transform ${
                  expandedQuestion === question.id ? 'rotate-180' : ''
                }`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Expanded Content */}
            {expandedQuestion === question.id && (
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Master Key (Q-Paper Analysis)</h4>
                  <p className="text-sm text-foreground bg-background p-3 rounded border border-border">
                    {question.masterKey}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Your Answer</h4>
                  <p className="text-sm text-foreground bg-background p-3 rounded border border-border">
                    {question.studentAnswer}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Master Key Logic</h4>
                  <p className="text-sm text-foreground bg-background p-3 rounded border border-border">
                    {question.logic}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
