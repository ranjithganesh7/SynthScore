import { type NextRequest, NextResponse } from "next/server"

interface ReportData {
  studentName: string
  studentId: string
  totalScore: number
  totalQuestions: number
  percentage: number
  questions: Array<{
    id: number
    status: string
    masterKey: string
    studentAnswer: string
    logic: string
    category: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const body: ReportData = await request.json()

    // Validate input
    if (!body.studentName || !body.questions) {
      return NextResponse.json({ error: "Student name and questions data are required" }, { status: 400 })
    }

    // Generate PDF content (mock)
    // In production, use a library like jsPDF or pdfkit
    const reportContent = `
ASSESSMENT EVALUATION REPORT
============================

Student: ${body.studentName}
Student ID: ${body.studentId}
Score: ${body.totalScore}/${body.totalQuestions} (${body.percentage}%)

QUESTION ANALYSIS
${body.questions
  .map(
    (q) => `
Q${q.id}: ${q.status.toUpperCase()}
Category: ${q.category}
Master Key: ${q.masterKey}
Student Answer: ${q.studentAnswer}
Logic: ${q.logic}
`,
  )
  .join("\n")}
    `

    return new NextResponse(reportContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="report-${body.studentName}-${Date.now()}.txt"`,
      },
    })
  } catch (error) {
    console.error("Report download error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
