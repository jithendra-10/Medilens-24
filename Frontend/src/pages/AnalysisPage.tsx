import { useState } from "react"
import { ArrowLeft, Download, FileText, Share2, AlertCircle, Loader2 } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricCard, MetricStatus } from "@/components/dashboard/MetricCard"
import { TrendChart } from "@/components/charts/TrendChart"
import { AIExplanation } from "@/components/ai/AIExplanation"
import { LanguageSelector, languages } from "@/components/ai/LanguageSelector"
import { AudioPlayer } from "@/components/ai/AudioPlayer"
import { exportPdf } from "@/services/api"

// Helper to map backend status to MetricCard status
const mapStatus = (status: string): MetricStatus => {
  const s = status.toUpperCase();
  if (s.includes("NORMAL")) return "Normal";
  if (s.includes("BORDERLINE")) return "Borderline";
  if (s.includes("HIGH")) return "High";
  if (s.includes("LOW")) return "Low";
  if (s.includes("CRITICAL")) return "Critical";
  return "Other";
}

export default function AnalysisPage() {
  const [language, setLanguage] = useState("en")
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const location = useLocation()

  const analysisResult = location.state?.analysisResult

  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <AlertCircle className="h-12 w-12 text-slate-400" />
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900">No Analysis Data Found</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Please upload a lab report first to view the analysis results.
          </p>
        </div>
        <Button asChild>
          <Link to="/upload">Go to Upload</Link>
        </Button>
      </div>
    )
  }

  const { structured_data, dynamic_analysis } = analysisResult;
  const patientInfo = structured_data?.patient_info || {};
  const reportDate = patientInfo.date || "Unknown Date";

  // Group tests by domain and normalize names to prevent duplicates
  const domainGroups: Record<string, any[]> = {};
  if (dynamic_analysis?.detailed_analysis) {
    const seenParameters = new Set<string>();

    dynamic_analysis.detailed_analysis.forEach((item: any) => {
      // Create a normalized key (lowercase, strip whitespace and parentheses)
      const paramName = (item.parameter || "").toLowerCase().replace(/\([^)]*\)/g, "").replace(/\s+/g, "").trim();

      if (!seenParameters.has(paramName)) {
        seenParameters.add(paramName);
        const domain = item.domain || "Other";
        if (!domainGroups[domain]) domainGroups[domain] = [];
        domainGroups[domain].push(item);
      }
    });
  }

  const domains = Object.keys(domainGroups);
  const defaultDomain = domains.length > 0 ? domains[0] : "";

  // Group trends by domain (by looking up the test in the domainGroups)
  const domainTrends: Record<string, any[]> = {};
  if (analysisResult.trend && analysisResult.trend.trends) {
    analysisResult.trend.trends.forEach((t: any) => {
      // Find which domain this test belongs to based on the current detailed_analysis mapping
      const matchedDomain = domains.find(d =>
        domainGroups[d].some(item => item.parameter === t.test)
      );
      if (matchedDomain) {
        if (!domainTrends[matchedDomain]) domainTrends[matchedDomain] = [];
        domainTrends[matchedDomain].push(t);
      }
    });
  }

  // Priority item for AI Explanation
  const topPriority = dynamic_analysis?.priority_list?.[0];

  const handleExportPdf = async () => {
    try {
      setIsExporting(true)
      setExportError(null)

      const selectedLangObj = languages.find(l => l.value === language);
      // We extract the english canonical name (e.g. "Hindi") from the label string for the LLM
      const languageName = selectedLangObj ? selectedLangObj.label.split(' ')[0] : "English";
      const forceRegenerate = languageName.toLowerCase() !== "english";

      const blob = await exportPdf(analysisResult, languageName, forceRegenerate)

      // Create a blob URL and trigger the download
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `MediLens_Report_${reportDate}.pdf`)
      document.body.appendChild(link)
      link.click()

      // Cleanup
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export PDF:", error)
      setExportError("Failed to generate PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Detailed Analysis</h1>
            <p className="text-slate-500 mt-1">{reportDate} • {patientInfo.patient_name || "Guest"}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Button variant="outline" className="rounded-full border-slate-200">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-sm min-w-[140px]"
          >
            {isExporting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Download className="mr-2 h-4 w-4" /> Export PDF</>
            )}
          </Button>
        </div>
      </div>

      {exportError && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{exportError}</p>
        </div>
      )}

      <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200/50 flex items-start gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 text-xs font-bold mt-0.5">!</div>
        <p className="text-sm text-amber-800 leading-relaxed">
          <strong>Disclaimer:</strong> This tool is for educational purposes only and does not provide medical diagnosis. Always consult a healthcare professional for medical advice.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Health Report Overview</h3>
            <p className="text-sm text-slate-500">Risk Level: {dynamic_analysis?.analysis_summary?.overall_risk || "Assessing..."}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>
      </div>

      <AudioPlayer title={`Audio Explanation (${language.toUpperCase()})`} />

      {domains.length > 0 ? (
        <Tabs defaultValue={defaultDomain} className="w-full">
          <TabsList className="flex flex-wrap w-full md:w-auto mb-8 h-auto p-1 bg-slate-100 rounded-xl">
            {domains.map(d => (
              <TabsTrigger key={d} value={d} className="rounded-lg">{d}</TabsTrigger>
            ))}
          </TabsList>

          {domains.map(domain => (
            <TabsContent key={domain} value={domain} className="space-y-8 animate-in fade-in-50 duration-500">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {domainGroups[domain].map((item, idx) => (
                  <MetricCard
                    key={idx}
                    name={item.parameter}
                    value={item.value}
                    unit={item.unit}
                    referenceRange={item.reference_range || "N/A"}
                    status={mapStatus(item.status)}
                    trend={item.status.includes("HIGH") ? "up" : item.status.includes("LOW") ? "down" : "stable"}
                  />
                ))}
              </div>

              {/* Render Trend Charts if comparing against a previous report */}
              {domainTrends[domain] && domainTrends[domain].length > 0 && (
                <div className="mt-8 space-y-6">
                  <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" /> Comparative Trends
                  </h3>
                  <div className="w-full">
                    {/* Convert all trends in this domain into a single dataset for the BarChart */}
                    <TrendChart
                      title={`Trends in ${domain}`}
                      description="Comparing previous vs current results"
                      data={domainTrends[domain].map((trend: any) => ({
                        test: trend.test,
                        Previous: parseFloat(trend.previous_value) || 0,
                        Current: parseFloat(trend.current_value) || 0,
                        unit: trend.unit,
                        change_pct: trend.change_pct
                      }))}
                    />
                  </div>
                </div>
              )}

              {/* Show Priority Explanation if this domain contains the top priority item */}
              {topPriority && topPriority.domain === domain && (
                <div className="mt-8">
                  <AIExplanation
                    whatItMeans={`Your ${topPriority.parameter} is currently flagged as ${topPriority.status}. ${topPriority.reason}`}
                    whyItMatters={`This falls under the ${topPriority.domain} category. Significant deviations here may indicate underlying conditions affecting overall health.`}
                    trendExplanation={`Current Value: ${topPriority.value}.`}
                    lifestyleSuggestions={[
                      "Discuss these specific results with your primary care provider.",
                      "Consider follow-up tests if recommended by your doctor.",
                      "Maintain healthy lifestyle habits and avoid drastic changes without medical consultation."
                    ]}
                  />
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-slate-200 bg-slate-50 border-dashed">
          <p className="text-lg text-slate-500">No specific test panels could be extracted from this report.</p>
        </div>
      )}
    </div>
  )
}
