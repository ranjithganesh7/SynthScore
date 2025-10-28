"use client"

import { CheckCircle, XCircle, Download } from "lucide-react"
import { jsPDF } from "jspdf"
import { useCallback } from "react"

interface Question {
  id: number
  status: "correct" | "incorrect"
  masterKey: string
  studentAnswer: string
  logic: string
  category: string
}

interface EvaluationData {
  studentName: string
  studentId: string
  totalScore: number
  totalQuestions: number
  percentage: number
  communicationStatus: string
  parentEmail: string
  questions: Question[]
}

interface EvaluationReportProps {
  data: EvaluationData
}

export default function EvaluationReport({ data }: EvaluationReportProps) {
  const correctCount = data.questions.filter((q) => q.status === "correct").length
  const incorrectCount = data.questions.filter((q) => q.status === "incorrect").length

  const generatePDF = useCallback(() => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15
    const lineHeight = 7
    let yPos = 20

    // Set document properties
    doc.setProperties({
      title: `Evaluation Report - ${data.studentName}`,
      subject: 'Student Evaluation Report',
      author: 'SynthScore',
      creator: 'SynthScore',
    });

    // Add header
    doc.setFontSize(20)
    doc.setTextColor(40, 40, 40)
    doc.text('Evaluation Report', margin, yPos)
    yPos += 10

    // Student info
    doc.setFontSize(12)
    doc.text(`Student: ${data.studentName} (${data.studentId})`, margin, yPos)
    yPos += 7
    doc.text(`Score: ${data.totalScore} / ${data.totalQuestions} (${data.percentage.toFixed(1)}%)`, margin, yPos)
    yPos += 10

    // Summary section
    doc.setFontSize(14)
    doc.text('Summary', margin, yPos)
    yPos += 10

    // Correct/Incorrect counts
    doc.setFillColor(220, 252, 231) // green-100
    doc.rect(margin, yPos, 85, 20, 'F')
    doc.setTextColor(22, 163, 74) // green-600
    doc.text(`✓ ${correctCount} Correct`, margin + 5, yPos + 5)
    
    doc.setFillColor(254, 226, 226) // red-100
    doc.rect(margin + 90, yPos, 85, 20, 'F')
    doc.setTextColor(220, 38, 38) // red-600
    doc.text(`✗ ${incorrectCount} Incorrect`, margin + 95, yPos + 5)
    
    yPos += 30

    // Detailed questions
    doc.setFontSize(14)
    doc.setTextColor(40, 40, 40)
    doc.text('Detailed Analysis', margin, yPos)
    yPos += 10

    // Questions
    data.questions.forEach((q, index) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      // Question header
      doc.setFontSize(12)
      doc.setDrawColor(200, 200, 200)
      doc.rect(margin, yPos, pageWidth - 2 * margin, 1, 'F')
      yPos += 5
      
      doc.setFont('helvetica', 'bold')
      doc.text(`Question ${q.id}`, margin, yPos)
      doc.setFont('helvetica', 'normal')
      
      // Set text color based on answer status
      if (q.status === 'correct') {
        doc.setTextColor(22, 163, 74) // green-600
      } else {
        doc.setTextColor(220, 38, 38) // red-600
      }
      doc.text(q.status.toUpperCase(), pageWidth - margin - 20, yPos, { align: 'right' })
      doc.setTextColor(40, 40, 40) // Reset to default text color
      yPos += 7

      // Question details
      doc.setFontSize(10)
      doc.text(`Category: ${q.category}`, margin, yPos)
      yPos += 5

      doc.text('Master Key:', margin, yPos)
      yPos += 5
      doc.text(q.masterKey, margin + 5, yPos, { maxWidth: pageWidth - 2 * margin - 5 })
      yPos += lineHeight

      doc.text('Student Answer:', margin, yPos)
      yPos += 5
      doc.text(q.studentAnswer || 'No answer provided', margin + 5, yPos, { maxWidth: pageWidth - 2 * margin - 5 })
      yPos += lineHeight

      doc.text('Logic:', margin, yPos)
      yPos += 5
      const splitText = doc.splitTextToSize(q.logic, pageWidth - 2 * margin - 5)
      doc.text(splitText, margin + 5, yPos, { maxWidth: pageWidth - 2 * margin - 5 })
      yPos += splitText.length * lineHeight + 10
    })

    // Save the PDF
    doc.save(`evaluation-report-${data.studentName.replace(/\s+/g, '-').toLowerCase()}.pdf`)
  }, [data, correctCount, incorrectCount])

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-light text-foreground mb-6">Evaluation Summary</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-background rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Student</p>
            <p className="text-lg font-light text-foreground">{data.studentName}</p>
            <p className="text-xs text-muted-foreground">{data.studentId}</p>
          </div>

          <div className="bg-background rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Final Score</p>
            <p className="text-2xl font-light text-amber-500">
              {data.totalScore} / {data.totalQuestions}
            </p>
            <p className="text-xs text-muted-foreground">{data.percentage.toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <CheckCircle size={20} className="text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Correct</p>
              <p className="text-lg font-light text-green-500">{correctCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-red-500/10 rounded-lg p-4 border border-red-500/20">
            <XCircle size={20} className="text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">Incorrect</p>
              <p className="text-lg font-light text-red-500">{incorrectCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Question Analysis */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-light text-foreground mb-6">Detailed Question Analysis</h3>

        <div className="space-y-6">
          {data.questions.map((question) => (
            <div key={question.id} className="border border-border rounded-lg p-6 bg-background">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-light text-foreground">Question {question.id}</h4>
                <div className="flex items-center gap-2">
                  {question.status === "correct" ? (
                    <>
                      <CheckCircle size={18} className="text-green-500" />
                      <span className="text-sm font-light text-green-500">CORRECT</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={18} className="text-red-500" />
                      <span className="text-sm font-light text-red-500">INCORRECT</span>
                    </>
                  )}
                </div>
              </div>

              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-light border border-amber-500/20">
                  {question.category}
                </span>
              </div>

              {/* Question Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
                    Master Key (Q-Paper Analysis)
                  </p>
                  <div className="bg-card rounded p-3 border border-border">
                    <p className="text-sm text-foreground font-light">{question.masterKey}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Extracted Student Answer</p>
                  <div className="bg-card rounded p-3 border border-border">
                    <p className="text-sm text-foreground font-light">{question.studentAnswer}</p>
                  </div>
                </div>
              </div>

              {/* Master Key Logic */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Master Key Logic</p>
                <div
                  className={`rounded p-4 border ${
                    question.status === "correct"
                      ? "bg-green-500/5 border-green-500/20"
                      : "bg-red-500/5 border-red-500/20"
                  }`}
                >
                  <p className="text-sm text-foreground font-light leading-relaxed">{question.logic}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="flex gap-3">
        <button 
          onClick={generatePDF}
          className="w-full py-3 flex items-center justify-center gap-2 rounded-lg bg-amber-500 text-slate-950 font-light hover:bg-amber-400 transition-colors"
        >
          <Download size={18} />
          Download Report (PDF)
        </button>
      </div>
    </div>
  )
}
