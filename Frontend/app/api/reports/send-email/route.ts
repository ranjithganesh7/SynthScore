import { type NextRequest, NextResponse } from "next/server"

interface SendEmailRequest {
  parentEmail: string
  studentName: string
  score: number
  totalQuestions: number
  percentage: number
  focusAreas: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailRequest = await request.json()

    // Validate input
    if (!body.parentEmail || !body.studentName) {
      return NextResponse.json({ error: "Parent email and student name are required" }, { status: 400 })
    }

    // Mock email sending
    // In production, this would integrate with an email service like SendGrid, Resend, etc.
    console.log("Sending email to:", body.parentEmail)
    console.log("Student:", body.studentName)
    console.log("Score:", `${body.score}/${body.totalQuestions} (${body.percentage}%)`)

    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 })
  } catch (error) {
    console.error("Email sending error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
