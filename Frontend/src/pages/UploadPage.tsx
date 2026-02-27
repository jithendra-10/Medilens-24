import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { UploadZone } from "@/components/upload/UploadZone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Activity, ArrowRight, AlertCircle } from "lucide-react"
import { uploadReports } from "@/services/api"

export default function UploadPage() {
  const navigate = useNavigate()
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [previousFile, setPreviousFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = (file: File, type: "current" | "previous") => {
    if (type === "current") setCurrentFile(file)
    if (type === "previous") setPreviousFile(file)
  }

  const handleAnalyze = async () => {
    if (!currentFile) return;

    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await uploadReports(currentFile, previousFile)
      setIsAnalyzing(false)
      navigate("/analysis", { state: { analysisResult: result } })
    } catch (err: any) {
      console.error("Upload failed", err)
      setError(err.response?.data?.detail || "Failed to analyze reports. Please try again.")
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Upload Reports</h1>
        <p className="text-slate-500 mt-2 text-lg">Securely upload your lab reports for AI analysis.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <UploadZone
          type="current"
          title="Current Report"
          description="Upload your most recent lab report (PDF)"
          onUpload={handleUpload}
        />
        <UploadZone
          type="previous"
          title="Previous Report (Optional)"
          description="Upload an older report to track changes over time"
          onUpload={handleUpload}
        />
      </div>

      <Card className="border-slate-200 bg-slate-50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Your health data is processed securely and temporarily. We do not store your medical records permanently unless you explicitly save them to your account.
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-slate-200">
        <Button
          size="lg"
          className="rounded-full px-8 h-14 text-lg shadow-lg shadow-blue-600/20 w-full sm:w-auto"
          disabled={!currentFile || isAnalyzing}
          onClick={handleAnalyze}
        >
          {isAnalyzing ? (
            <>
              <Activity className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Reports...
            </>
          ) : (
            <>
              Analyze Reports <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
