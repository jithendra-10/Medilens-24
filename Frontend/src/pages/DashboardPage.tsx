import { useEffect, useState } from "react"
import { ArrowRight, FileText, UploadCloud, Loader2, Activity } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HealthSummaryCard } from "@/components/dashboard/HealthSummaryCard"
import { MetricCard } from "@/components/dashboard/MetricCard"
import api from "../services/api"

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, reportsRes] = await Promise.all([
          api.get("/dashboard/metrics"),
          api.get("/dashboard/reports")
        ])
        setMetrics(metricsRes.data)
        setReports(reportsRes.data)
      } catch (err) {
        console.error("Failed to load dashboard data", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const hasReports = reports.length > 0

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!hasReports) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-[40px] animate-in fade-in duration-1000">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-600/10 text-blue-600 mb-8 animate-float">
          <UploadCloud className="h-12 w-12" />
        </div>
        <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">Ready to start?</h2>
        <p className="text-xl text-slate-600 max-w-md mx-auto mb-10 leading-relaxed">
          Upload your first lab report and let our AI transform complex data into clear health insights.
        </p>
        <Button size="lg" asChild className="rounded-2xl px-10 h-16 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all hover:scale-105">
          <Link to="/upload">
            <UploadCloud className="mr-3 h-6 w-6" />
            Upload Your Report
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 p-8 md:p-12 text-white shadow-2xl shadow-blue-900/20">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-blue-400/20 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-indigo-400/20 blur-[100px] rounded-full"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-[0.2em] uppercase text-blue-100">
              <Activity className="h-3.5 w-3.5" /> Digital Medical Archive
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Welcome back, <br />
              <span className="text-blue-200">User!</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-50/80 leading-relaxed font-medium">
              Your health journey is evolving. We've added 4 new AI insights based on your latest bloodwork.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" asChild className="rounded-2xl h-14 px-8 bg-white text-blue-700 hover:bg-blue-50 hover:shadow-lg transition-all font-bold">
                <Link to="/upload">
                  <UploadCloud className="mr-2 h-5 w-5" /> New Analysis
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="rounded-2xl h-14 px-8 text-white hover:bg-white/10 backdrop-blur-sm border border-white/20 font-bold">
                Check History
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            {[
              { label: "Reports Analyzed", value: reports.length },
              { label: "Health Insights", value: 12 },
              { label: "Family Tracked", value: 3 },
              { label: "AI Quality", value: "98%" }
            ].map((stat, i) => (
              <div key={i} className="glass-card p-5 rounded-3xl flex flex-col justify-center gap-1 group hover:scale-105 transition-transform duration-300">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-200/60">{stat.label}</span>
                <span className="text-2xl font-black">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Insights Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase tracking-wider">Active Insights</h2>
          <span className="text-sm font-bold text-slate-400">Total metrics: {metrics.length}</span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.slice(0, 4).map((metric, i) => (
            <MetricCard
              key={i}
              name={metric.name}
              value={metric.value || 0}
              unit={metric.unit || ""}
              referenceRange={metric.ref_range || ""}
              status={metric.status}
              trend={metric.trend || "stable"}
              percentChange={metric.percent_change || 0}
            />
          ))}
        </div>
      </section>

      {/* Health Summary */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase tracking-wider">Clinical Correlation</h2>
          <Button variant="ghost" asChild className="text-blue-600 hover:bg-blue-50 font-bold rounded-xl px-4">
            <Link to="/reports" className="flex items-center gap-2">Full Summary <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>

        <HealthSummaryCard
          status="Needs Monitoring"
          summary="Your overall health markers are mostly stable, but your LDL Cholesterol is slightly elevated compared to your last report. We recommend reviewing the detailed analysis below."
          date="Oct 24, 2023"
        />
      </section>

      <div className="grid gap-8 md:grid-cols-5">
        <Card className="md:col-span-3 border-0 bg-white shadow-2xl shadow-slate-200/50 rounded-[32px] overflow-hidden">
          <CardHeader className="px-8 pt-8">
            <CardTitle className="text-2xl font-black">Archive History</CardTitle>
            <CardDescription className="text-slate-400 font-medium">Your recently processed medical documents.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-4">
            {reports.slice(0, 3).map((report, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl border border-slate-50 bg-slate-50/50 p-5 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className="flex items-center gap-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{report.type}</p>
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 mt-0.5">
                      <span>{new Date(report.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="text-emerald-500">PROCESSED</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild className="rounded-xl font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <Link to="/reports">View Detail</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-0 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white rounded-[32px] shadow-2xl shadow-indigo-900/20 overflow-hidden group">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 blur-[60px] rounded-full group-hover:bg-white/20 transition-colors duration-500"></div>
          <CardHeader className="px-8 pt-8">
            <CardTitle className="text-white text-2xl font-black">Family Access</CardTitle>
            <CardDescription className="text-indigo-100 font-medium opacity-80 italic">Bridge the communication gap.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center px-8 pb-8 text-center space-y-8">
            <div className="flex -space-x-5 animate-float">
              <div className="h-20 w-20 rounded-3xl border-4 border-indigo-500 bg-white/20 backdrop-blur-lg flex items-center justify-center text-4xl shadow-xl">👵</div>
              <div className="h-20 w-20 rounded-3xl border-4 border-indigo-500 bg-white/20 backdrop-blur-lg flex items-center justify-center text-4xl shadow-xl z-10 translate-y-3">👴</div>
              <div className="h-20 w-20 rounded-3xl border-4 border-indigo-500 bg-white/20 backdrop-blur-lg flex items-center justify-center text-4xl shadow-xl z-20">👩</div>
            </div>
            <p className="text-indigo-50 text-base font-medium leading-relaxed">
              Instantly translate your health metrics into a simple, multi-language guide for your family members.
            </p>
            <Button variant="secondary" size="lg" className="w-full rounded-2xl h-14 font-black bg-white text-indigo-700 hover:bg-indigo-50 shadow-xl transition-all hover:scale-105 active:scale-95">
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
