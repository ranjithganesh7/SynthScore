"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/auth-context"
import { FileText } from "lucide-react"
import StaffHeader from "@/components/dashboard/staff-header"
import FileUploadModule from "@/components/dashboard/file-upload-module"
import EvaluationReport from "@/components/dashboard/evaluation-report"

export default function StaffDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [evaluationData, setEvaluationData] = useState(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "staff") {
      router.push("/signin")
    } else {
      setIsLoading(false)
    }
  }, [user, router])

  if (!user || user.role !== "staff" || isLoading) {
    return null // Or a loading spinner
  }

  const handleEvaluation = async (files: { qp: File; answerKey?: File; studentAnswers: File[] }) => {
    setIsEvaluating(true)
    try {
      // Simulate API call to backend evaluation service
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock evaluation data
      const mockData = {
        studentName: "John Smith",
        studentId: "STU-001",
        totalScore: 3,
        totalQuestions: 6,
        percentage: 50,
        communicationStatus: "Appreciation Sent (50.0%)",
        parentEmail: `Dear Parent,

We are pleased to share the assessment results for your child. Your child scored 3 out of 6 (50.0%) on the recent evaluation.

Key Areas of Strength:
- Identifying objects that roll
- Basic number combinations

Areas for Improvement:
- Identifying objects that slide
- Number combinations to reach target sum
- Solid shapes recognition

We recommend focusing on these areas for continued learning.

Best regards,
Assessment Team`,
        questions: [
          {
            id: 1,
            status: "correct",
            masterKey: "Objects that roll include balls and cylinders",
            studentAnswer: "Ball",
            logic: "Correct identification of rolling objects",
            category: "Motion",
          },
          {
            id: 2,
            status: "incorrect",
            masterKey: "Objects that slide include books and boxes",
            studentAnswer: "Ball",
            logic: "Student confused rolling with sliding. Balls roll, they do not slide.",
            category: "Motion",
          },
          {
            id: 3,
            status: "correct",
            masterKey: "2 + 4 = 6",
            studentAnswer: "2 + 4 = 6",
            logic: "Correct number combination",
            category: "Arithmetic",
          },
          {
            id: 4,
            status: "incorrect",
            masterKey: "3 + 3 = 6",
            studentAnswer: "2 + 5 = 6",
            logic: "While the sum is correct, the specific combination requested was 3 + 3",
            category: "Arithmetic",
          },
          {
            id: 5,
            status: "incorrect",
            masterKey: "Cube is a solid shape with 6 faces",
            studentAnswer: "Circle",
            logic: "Circle is a 2D shape, not a 3D solid shape. A cube is the correct answer.",
            category: "Geometry",
          },
          {
            id: 6,
            status: "correct",
            masterKey: "Sphere is a solid shape",
            studentAnswer: "Sphere",
            logic: "Correct identification of a 3D solid shape",
            category: "Geometry",
          },
        ],
      }

      setEvaluationData(mockData)
    } catch (error) {
      console.error("Evaluation failed:", error)
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-background">
      <StaffHeader user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload Module */}
          <div className="lg:col-span-1">
            <FileUploadModule onEvaluate={handleEvaluation} isLoading={isEvaluating} />
          </div>

          {/* Right Column - Report Display */}
          <div className="lg:col-span-2">
            {evaluationData ? (
              <EvaluationReport data={evaluationData} />
            ) : (
              <div className="bg-card rounded-lg border border-border p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-light text-foreground mb-2">No Evaluation Yet</h3>
                <p className="text-muted-foreground text-sm">Upload files and run evaluation to see results here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
