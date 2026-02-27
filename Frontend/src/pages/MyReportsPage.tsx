import { useEffect, useState } from "react"
import { FileText, Search, Filter, UploadCloud, Calendar, Activity, Loader2, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils/cn"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import api from "../services/api"

export default function MyReportsPage() {
    const [reports, setReports] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await api.get('/dashboard/reports')
                setReports(res.data)
            } catch (err) {
                console.error("Failed to fetch reports:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchReports()
    }, [])

    const handleDelete = async (reportId: number) => {
        if (!window.confirm("Are you sure you want to delete this report?")) return;

        try {
            await api.delete(`/dashboard/reports/${reportId}`)
            setReports(prev => prev.filter(r => r.id !== reportId))
        } catch (err) {
            console.error("Failed to delete report:", err)
            alert("Failed to delete report.")
        }
    }

    const getRiskBadge = (risk: string) => {
        switch (risk) {
            case "Stable": return "bg-emerald-100 text-emerald-800"
            case "Mild Concern": return "bg-amber-100 text-amber-800"
            case "High Risk": return "bg-orange-100 text-orange-800"
            case "Critical": return "bg-red-100 text-red-800"
            default: return "bg-slate-100 text-slate-800"
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-200 shadow-sm shadow-blue-500/10 transition-transform hover:scale-105 duration-300">
                        <Calendar className="h-3 w-3" /> Historical Data
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                        Medical <span className="text-blue-600">History</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium opacity-80">A complete timeline of your analyzed medical reports.</p>
                </div>
                <Button size="lg" asChild className="rounded-2xl h-14 px-8 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 group">
                    <Link to="/upload" className="flex items-center font-bold">
                        <UploadCloud className="mr-2 h-5 w-5 group-hover:animate-bounce" /> Upload New Report
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-center px-1">
                <div className="relative w-full lg:flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                        placeholder="Search by report name or keyword..."
                        className="pl-12 h-14 rounded-2xl border-0 bg-white/60 backdrop-blur-md shadow-xl shadow-slate-200/50 focus-visible:ring-2 focus-visible:ring-blue-600/20 text-base font-medium placeholder:text-slate-400"
                    />
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                    <Button variant="outline" className="flex-1 lg:flex-none h-14 px-6 rounded-2xl border-white bg-white/60 backdrop-blur-md shadow-lg shadow-slate-200/50 text-slate-600 font-bold hover:bg-white transition-all">
                        <Filter className="mr-2 h-4 w-4" /> Filter By Date
                    </Button>
                    <Button variant="outline" className="flex-1 lg:flex-none h-14 px-6 rounded-2xl border-white bg-white/60 backdrop-blur-md shadow-lg shadow-slate-200/50 text-slate-600 font-bold hover:bg-white transition-all">
                        All Domains
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                {reports.length > 0 ? (
                    reports.map((report, i) => (
                        <Card key={report.id} className="relative border-0 shadow-2xl shadow-slate-200/40 hover:shadow-blue-500/10 transition-all duration-300 rounded-[32px] overflow-hidden group hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                            <CardContent className="p-0">
                                <div className="flex flex-col lg:flex-row items-center justify-between p-8 md:p-10 gap-8">

                                    <div className="flex items-center gap-6 w-full lg:w-auto">
                                        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner group-hover:rotate-6 group-hover:scale-110">
                                            <FileText className="h-8 w-8" />
                                            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></div>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{report.type}</h3>
                                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 mt-2">
                                                <span className="flex items-center gap-1.5 uppercase tracking-widest"><Calendar className="h-4 w-4 text-slate-300" /> {new Date(report.date).toLocaleDateString()}</span>
                                                <span className="hidden sm:inline opacity-30">|</span>
                                                <span className="flex items-center gap-1.5 uppercase tracking-widest">MD-24-0012</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 w-full lg:w-auto mt-2 lg:mt-0 p-6 lg:p-0 rounded-3xl lg:rounded-none bg-slate-50/50 lg:bg-transparent border border-white/60 lg:border-0 shadow-inner lg:shadow-none">
                                        <div className="flex flex-col gap-1 items-start lg:items-end px-2">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Status</span>
                                            <Badge variant="secondary" className="px-3 py-1 bg-white border border-slate-100 text-slate-700 font-bold rounded-lg shadow-sm">
                                                {report.status}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-col gap-1 items-start lg:items-end px-2 border-l border-slate-200/50">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Severity</span>
                                            <Badge variant="outline" className={cn("border-0 font-black text-xs uppercase tracking-tighter px-3 py-1 rounded-lg shadow-sm", getRiskBadge(report.risk))}>
                                                <Activity className="mr-1.5 h-3.5 w-3.5" /> {report.risk}
                                            </Badge>
                                        </div>

                                        <div className="flex-1 lg:hidden"></div> {/* Spacer for mobile */}

                                        <Button variant="outline" asChild className="h-12 lg:h-14 px-8 rounded-2xl border-white bg-white font-black text-blue-600 hover:text-white hover:bg-blue-600 shadow-sm transition-all duration-300 ml-4">
                                            <Link to="/reports">VIEW SUMMARY</Link>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(report.id)}
                                            className="h-12 w-12 rounded-2xl text-slate-300 hover:text-red-600 hover:bg-red-50 hover:shadow-red-500/10 transition-all duration-300 border border-transparent hover:border-red-100"
                                            title="Delete Permanent"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center glass-panel rounded-[40px] border-dashed border-2 border-blue-200/50 animate-in zoom-in-95 duration-1000">
                        <div className="relative mb-10 group">
                            <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full animate-pulse group-hover:bg-blue-400/40 transition-colors"></div>
                            <div className="relative flex h-28 w-28 items-center justify-center rounded-[32px] bg-white shadow-2xl shadow-blue-500/10 text-slate-300 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 animate-float">
                                <FileText className="h-14 w-14" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Empty Archive</h3>
                        <p className="text-slate-500 max-w-sm mt-4 mb-10 text-lg font-medium leading-relaxed opacity-80">
                            Your medical timeline is waiting for its first record. Upload a report to begin your journey.
                        </p>
                        <Button size="lg" asChild className="rounded-2xl h-16 px-12 bg-blue-600 text-white font-black shadow-2xl shadow-blue-500/40 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all">
                            <Link to="/upload" className="flex items-center gap-2">
                                <UploadCloud className="h-6 w-6" /> Start First Analysis
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
