"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/auth-context"
import StudentHeader from "@/components/dashboard/student-header"
import PerformanceOverview from "@/components/dashboard/performance-overview"
import QuestionReview, { Question } from "@/components/dashboard/question-review"
import { useEffect, useState } from "react"

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "student") {
      router.push("/signin")
    } else {
      setIsLoading(false)
    }
  }, [user, router])

  if (!user || user.role !== "student" || isLoading) {
    return null // Or a loading spinner
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Mock student performance data
  const performanceData = {
    finalScore: 3,
    totalQuestions: 6,
    percentage: 50,
    focusAreas: [
      "Identifying objects that slide",
      "Number combinations to reach target sum",
      "Solid shapes recognition",
    ],
  }

  const questionsData: Question[] = [
    {
      id: 1,
      status: "correct",
      category: "Motion",
      masterKey: "Objects that roll include balls and cylinders",
      studentAnswer: "Ball",
      logic: "Correct identification of rolling objects"
    },
    {
      id: 2,
      status: "incorrect",
      category: "Motion",
      masterKey: "Objects that slide include books and boxes",
      studentAnswer: "Ball",
      logic: "Student confused rolling with sliding. Balls roll, they do not slide."
    },
    {
      id: 3,
      status: "correct",
      category: "Arithmetic",
      masterKey: "2 + 4 = 6",
      studentAnswer: "2 + 4 = 6",
      logic: "Correct number combination"
    },
    {
      id: 4,
      status: "incorrect",
      category: "Arithmetic",
      masterKey: "3 + 3 = 6",
      studentAnswer: "2 + 5 = 6",
      logic: "While the sum is correct, the specific combination requested was 3 + 3"
    },
    {
      id: 5,
      status: "incorrect",
      category: "Geometry",
      masterKey: "Cube is a solid shape with 6 faces",
      studentAnswer: "Circle",
      logic: "Circle is a 2D shape, not a 3D solid shape. A cube is the correct answer."
    },
    {
      id: 6,
      status: "correct",
      category: "Geometry",
      masterKey: "Sphere is a solid shape",
      studentAnswer: "Sphere",
      logic: "Correct identification of a 3D solid shape"
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <StudentHeader user={user} onLogout={handleLogout} />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Performance Overview */}
          <PerformanceOverview data={performanceData} />

          {/* Question Review */}
          <QuestionReview questions={questionsData} />
        </div>
      </div>
    </main>
  )
}
