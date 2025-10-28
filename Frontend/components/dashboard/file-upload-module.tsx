"use client"

import { useState, useRef } from "react"
import { Upload, X, Check } from "lucide-react"

interface FileUploadModuleProps {
  onEvaluate: (files: { qp: File; answerKey?: File; studentAnswers: File[] }) => void
  isLoading: boolean
}

export default function FileUploadModule({ onEvaluate, isLoading }: FileUploadModuleProps) {
  const [files, setFiles] = useState<{
    qp: File | null
    answerKey: File | null
    studentAnswers: File[]
  }>({
    qp: null,
    answerKey: null,
    studentAnswers: [],
  })

  const qpInputRef = useRef<HTMLInputElement>(null)
  const answerKeyInputRef = useRef<HTMLInputElement>(null)
  const studentAnswersInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (type: "qp" | "answerKey" | "studentAnswers", selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    if (type === "qp") {
      setFiles((prev) => ({ ...prev, qp: selectedFiles[0] }))
    } else if (type === "answerKey") {
      setFiles((prev) => ({ ...prev, answerKey: selectedFiles[0] }))
    } else if (type === "studentAnswers") {
      setFiles((prev) => ({
        ...prev,
        studentAnswers: [...prev.studentAnswers, ...Array.from(selectedFiles)],
      }))
    }
  }

  const removeFile = (type: "qp" | "answerKey", index?: number) => {
    if (type === "qp") {
      setFiles((prev) => ({ ...prev, qp: null }))
    } else if (type === "answerKey") {
      setFiles((prev) => ({ ...prev, answerKey: null }))
    } else if (type === "studentAnswers" && index !== undefined) {
      setFiles((prev) => ({
        ...prev,
        studentAnswers: prev.studentAnswers.filter((_, i) => i !== index),
      }))
    }
  }

  const handleEvaluate = () => {
    if (files.qp && files.studentAnswers.length > 0) {
      onEvaluate(files)
    }
  }

  const isValid = files.qp && files.studentAnswers.length > 0

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-6">
      <div>
        <h2 className="text-xl font-light text-foreground mb-1">Input & Evaluation</h2>
        <p className="text-sm text-muted-foreground">Upload materials for evaluation</p>
      </div>

      {/* Master Question Paper */}
      <div className="space-y-3">
        <label className="block text-sm font-light text-foreground">
          Master Question Paper
          <span className="text-amber-500">*</span>
        </label>
        <div
          onClick={() => qpInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-amber-500/50 transition-colors"
        >
          {files.qp ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check size={20} className="text-amber-500" />
                <span className="text-sm text-foreground">{files.qp.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile("qp")
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload size={24} className="mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
            </div>
          )}
        </div>
        <input
          ref={qpInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => handleFileSelect("qp", e.target.files)}
          className="hidden"
        />
      </div>

      {/* Master Answer Key */}
      <div className="space-y-3">
        <label className="block text-sm font-light text-foreground">
          Master Answer Key
          <span className="text-muted-foreground text-xs ml-1">(Optional)</span>
        </label>
        <div
          onClick={() => answerKeyInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-amber-500/50 transition-colors"
        >
          {files.answerKey ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check size={20} className="text-amber-500" />
                <span className="text-sm text-foreground">{files.answerKey.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile("answerKey")
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload size={24} className="mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
            </div>
          )}
        </div>
        <input
          ref={answerKeyInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => handleFileSelect("answerKey", e.target.files)}
          className="hidden"
        />
      </div>

      {/* Student Answer Sheets */}
      <div className="space-y-3">
        <label className="block text-sm font-light text-foreground">
          Student Answer Sheet(s)
          <span className="text-amber-500">*</span>
        </label>
        <div
          onClick={() => studentAnswersInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-amber-500/50 transition-colors"
        >
          {files.studentAnswers.length > 0 ? (
            <div className="space-y-2">
              {files.studentAnswers.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-amber-500" />
                    <span className="text-foreground">{file.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile("studentAnswers", index)
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  studentAnswersInputRef.current?.click()
                }}
                className="text-xs text-amber-500 hover:text-amber-400 mt-2"
              >
                + Add more files
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload size={24} className="mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">Supports multiple files</p>
            </div>
          )}
        </div>
        <input
          ref={studentAnswersInputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          onChange={(e) => handleFileSelect("studentAnswers", e.target.files)}
          className="hidden"
        />
      </div>

      {/* Evaluation Button */}
      <button
        onClick={handleEvaluate}
        disabled={!isValid || isLoading}
        className="w-full py-3 rounded-lg bg-amber-500 text-slate-950 font-light hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Running Evaluation..." : "Run Evaluation & Prepare Report"}
      </button>
    </div>
  )
}
