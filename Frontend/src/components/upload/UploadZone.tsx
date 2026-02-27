import * as React from "react"
import { UploadCloud, File, X, CheckCircle2, AlertCircle } from "lucide-react"
import { useState, useCallback } from "react"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface UploadZoneProps {
  onUpload: (file: File, type: "current" | "previous") => void
  type: "current" | "previous"
  title: string
  description: string
}

export function UploadZone({ onUpload, type, title, description }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      setStatus("error")
      return
    }
    
    setFile(selectedFile)
    setStatus("uploading")
    
    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setStatus("success")
        onUpload(selectedFile, type)
      }
    }, 200)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const reset = () => {
    setFile(null)
    setUploadProgress(0)
    setStatus("idle")
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      {status === "idle" || status === "error" ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all",
            isDragging
              ? "border-blue-500 bg-blue-50"
              : status === "error"
              ? "border-red-300 bg-red-50"
              : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
          )}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          />
          <div className={cn("mb-4 flex h-16 w-16 items-center justify-center rounded-full", status === "error" ? "bg-red-100 text-red-600" : "bg-white text-blue-600 shadow-sm")}>
            {status === "error" ? <AlertCircle className="h-8 w-8" /> : <UploadCloud className="h-8 w-8" />}
          </div>
          <p className="mb-2 text-lg font-medium text-slate-900">
            {status === "error" ? "Invalid file type" : "Drag & drop your PDF here"}
          </p>
          <p className="text-sm text-slate-500">
            {status === "error" ? "Please upload a valid PDF file." : "or click to browse from your computer"}
          </p>
          {status === "error" && (
            <Button variant="outline" size="sm" className="mt-4 z-20" onClick={reset}>
              Try Again
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", status === "success" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600")}>
              {status === "success" ? <CheckCircle2 className="h-6 w-6" /> : <File className="h-6 w-6" />}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate font-medium text-slate-900">{file?.name}</p>
              <p className="text-sm text-slate-500">
                {status === "uploading" ? "Uploading and analyzing..." : "Upload complete"}
              </p>
            </div>
            {status === "success" && (
              <Button variant="ghost" size="icon" onClick={reset} className="text-slate-400 hover:text-slate-900">
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          {status === "uploading" && (
            <div className="mt-4 flex items-center gap-4">
              <Progress value={uploadProgress} className="h-2 flex-1" />
              <span className="text-sm font-medium text-slate-600 w-8 text-right">{uploadProgress}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
