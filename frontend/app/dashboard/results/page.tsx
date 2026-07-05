"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import AudioPlayer from "@/components/AudioPlayer";
import ChatPanel from "@/components/ChatPanel";
import { FileText, ArrowLeft, Download, ShieldCheck, Info, Activity, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────────────
type CardExplanation = {
    parameter: string;
    one_liner: string;
    what_this_means: string;
    what_if_ignored?: string;
    urgency: "normal" | "watch" | "consult" | "urgent";
};

type HighlightEntry = {
    parameter: string; value: string; unit: string;
    status: string; reason: string; reference_range?: string;
};

type TrendEntry = {
    test: string;
    previous_value: number;
    current_value: number;
    unit: string;
    change_pct: number | null;
    direction: "increased" | "decreased" | "unchanged";
    current_status: string;
    previous_status: string;
    assessment: "Improved" | "Worsened" | "Stable";
};

type TrendData = {
    trends: TrendEntry[];
    summary: string;
};

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_THEME: Record<string, {
    orb: string; text: string; label: string; icon: any; shadow: string;
}> = {
    CRITICAL: { orb: "bg-danger", text: "text-danger", label: "Critical Priority", icon: AlertTriangle, shadow: "shadow-danger/40" },
    HIGH: { orb: "bg-warning", text: "text-warning", label: "Attention Needed", icon: AlertTriangle, shadow: "shadow-warning/40" },
    BORDERLINE: { orb: "bg-orange-400", text: "text-orange-400", label: "Mild Concern", icon: Info, shadow: "shadow-orange-400/40" },
    LOW: { orb: "bg-primary", text: "text-primary", label: "Low Levels", icon: ShieldCheck, shadow: "shadow-primary/40" },
    NORMAL: { orb: "bg-accent", text: "text-accent", label: "Healthy Status", icon: CheckCircle2, shadow: "shadow-accent/40" },
};

// ── Insight Card Component ─────────────────────────────────────────────────
function InsightCard({
    entry, card, trend
}: {
    entry: HighlightEntry;
    card?: CardExplanation;
    trend?: TrendEntry;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const status = entry.status?.toUpperCase() || "NORMAL";
    const theme = STATUS_THEME[status] ?? STATUS_THEME.NORMAL;

    return (
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            className={`liquid-glass p-6 rounded-[2rem] border-white/60 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group cursor-pointer relative overflow-hidden ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <theme.icon className={`w-12 h-12 ${theme.text}`} />
            </div>

            <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${theme.text} ${theme.shadow.replace('shadow-', 'bg-').replace('/40', '/10')} border-white/40`}>
                            {theme.label}
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors pt-2">
                            {entry.parameter}
                        </h3>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="flex items-baseline justify-end gap-1">
                            <span className="text-2xl font-black text-slate-900 leading-none">{entry.value}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{entry.unit}</span>
                        </div>
                        {trend && trend.change_pct !== null && (
                            <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold pb-1`}>
                                <span className={`flex items-center gap-0.5 ${trend.direction === 'increased' ? 'text-amber-600' : trend.direction === 'decreased' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {trend.direction === 'increased' ? '↑' : trend.direction === 'decreased' ? '↓' : '→'}
                                    {Math.abs(trend.change_pct)}%
                                </span>
                                {trend.assessment !== "Stable" && (
                                    <span className={`px-1.5 py-0.5 rounded uppercase tracking-wider text-[8px] ${trend.assessment === 'Improved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {trend.assessment}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Primary Human Insight */}
                <div className="space-y-3">
                    <p className="text-slate-600 leading-relaxed font-semibold italic border-l-2 border-primary/20 pl-3">
                        {card?.one_liner || entry.reason}
                    </p>
                </div>

                {/* Expanded Clinical Logic */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="pt-4 mt-4 border-t border-white/40 space-y-4">
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Clinical Context</h4>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                {card?.what_this_means || "Our AI analysis indicates this value is currently outside the optimal range. Consult your physician for a complete clinical correlation."}
                            </p>
                        </div>

                        {card?.what_if_ignored && (
                            <div className="p-4 rounded-2xl bg-white/40 border border-white/60">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Human Impact</h4>
                                <p className="text-sm text-slate-500 italic leading-relaxed">
                                    {card.what_if_ignored}
                                </p>
                            </div>
                        )}

                        {trend && (
                            <div className={`p-3 rounded-xl border ${trend.assessment === 'Improved' ? 'bg-emerald-50/50 border-emerald-100/50' : trend.assessment === 'Worsened' ? 'bg-rose-50/50 border-rose-100/50' : 'bg-blue-50/50 border-blue-100/50'}`}>
                                <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${trend.assessment === 'Improved' ? 'text-emerald-500' : trend.assessment === 'Worsened' ? 'text-rose-500' : 'text-blue-400'}`}>
                                    Historical Context {trend.assessment !== 'Stable' ? `(${trend.assessment})` : ''}
                                </h4>
                                <p className={`text-xs font-medium ${trend.assessment === 'Improved' ? 'text-emerald-700' : trend.assessment === 'Worsened' ? 'text-rose-700' : 'text-blue-700'}`}>
                                    Previously it was {trend.previous_value} {trend.unit} ({trend.previous_status}). {trend.direction === 'unchanged' ? 'Stable compared to last check.' : `This is a ${trend.direction} of ${Math.abs(trend.change_pct!)}%.`}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest pt-2">
                            <span className="text-slate-400">Ref: {entry.reference_range || "N/A"}</span>
                            <span className={theme.text}>{card?.urgency || 'monitoring'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pt-2">
                    <div className={`w-8 h-1 rounded-full bg-slate-200 group-hover:bg-primary/20 transition-all ${isExpanded ? 'w-12 bg-primary/40' : ''}`} />
                </div>
            </div>
        </div>
    );
}

// ── Main Dashboard ────────────────────────────────────────────────────────
export default function ResultsPage() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"insights" | "chat">("insights");
    const [isExporting, setIsExporting] = useState(false);
    const [exportLang, setExportLang] = useState("English");
    const [exportType, setExportType] = useState<"summary" | "detailed">("summary");

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
        const search = new URLSearchParams(window.location.search);
        const reportId = search.get("id");

        const fetchReport = async (id: string) => {
            try {
                const token = await getToken();
                // Your backend might return report directly or in a list
                const res = await fetch(`${apiUrl}/dashboard/reports`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const reports = await res.json();
                    const report = reports.find((r: any) => r.id.toString() === id);
                    if (report) {
                        const parsed = typeof report.structured_data_json === 'string'
                            ? JSON.parse(report.structured_data_json)
                            : report.structured_data_json;
                        setData(parsed);
                    }
                }
            } catch (e) {
                console.error("Fetch report by ID failed", e);
            }
        };

        if (reportId) {
            fetchReport(reportId);
        } else {
            const raw = localStorage.getItem("medilens_result");
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    setData(parsed);
                } catch {
                    localStorage.removeItem("medilens_result");
                }
            } else {
                const fetchLatest = async () => {
                    try {
                        const t = await getToken();
                        const res = await fetch(`${apiUrl}/dashboard/reports`, {
                            headers: { "Authorization": `Bearer ${t}` }
                        });
                        if (res.ok) {
                            const reports = await res.json();
                            if (reports.length > 0) {
                                const latest = reports[0];
                                const parsed = typeof latest.structured_data_json === 'string'
                                    ? JSON.parse(latest.structured_data_json)
                                    : latest.structured_data_json;
                                setData(parsed);
                            }
                        }
                    } catch (e) {
                        console.error("Fetch latest failed", e);
                    }
                };
                fetchLatest();
            }
        }
    }, []);

    if (!data) return (
        <div className="flex flex-col justify-center items-center min-h-[70vh] text-center space-y-6 fade-up">
            <div className="w-24 h-24 rounded-[2rem] liquid-glass flex items-center justify-center shadow-2xl">
                <FileText className="h-10 w-10 text-primary opacity-50" />
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">Awaiting Data</h2>
                <p className="text-slate-500 max-w-sm">Upload a medical report to unlock your high-fidelity humanized health insights.</p>
            </div>
            <Link href="/dashboard/upload">
                <Button className="rounded-full px-8 py-6 text-lg h-auto shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Start New Analysis
                </Button>
            </Link>
        </div>
    );

    const {
        patient_info = {}, dynamic_analysis = {}, card_explanations = [],
        overall_risk = "Stable", analytics = {}, alert = {}, confidence = {},
        tests = {}, language = "English",
    } = data;

    // ── Compute counters directly from tests object (analytics field can be empty from DB) ──
    const testEntries = Object.values(tests as Record<string, any>);
    const totalMarkers = testEntries.length || (analytics as any).total || 0;
    const abnormalFindings = testEntries.filter((t: any) =>
        ["High", "Low", "BORDERLINE", "CRITICAL"].includes(t.status)
    ).length || (analytics as any).abnormal || 0;
    const urgentCount = testEntries.filter((t: any) =>
        ["CRITICAL", "High"].includes(t.status)
    ).length || dynamic_analysis.analysis_summary?.critical_count || 0;

    const detailed = dynamic_analysis.detailed_analysis || [];
    const cardMap: Record<string, CardExplanation> = {};
    card_explanations.forEach((c: CardExplanation) => { cardMap[c.parameter] = c; });

    const abnormalEntries = detailed.filter((d: any) =>
        ["HIGH", "LOW", "BORDERLINE", "CRITICAL"].includes(d.status?.toUpperCase())
    );

    const assessmentTheme = STATUS_THEME[alert.alert_level?.toUpperCase()] || STATUS_THEME.NORMAL;

    const handleDownload = async () => {
        setIsExporting(true);
        try {
            const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api").replace(/\/$/, "");
            const token = await getToken();


            // Map the frontend data to the backend PDFRequest schema (see pdf_export.py)
            const payload = {
                patient_name: patient_info?.name
                    || patient_info?.["Patient Name"]
                    || patient_info?.patient_name
                    || "Unknown Patient",
                patient_age: patient_info?.age ? parseInt(patient_info.age.toString()) : 30,
                patient_gender: patient_info?.gender || patient_info?.["Gender"] || "Not specified",
                tests: tests || {},
                analytics: analytics || {},
                alert: alert || {},
                confidence: confidence || {},
                // Empty string forces backend RAG to regenerate explanation in the selected language
                explanation: "",
                priority_list: card_explanations || [],
                // Pass trend data for detailed PDF so bar chart renders
                trend: exportType === "detailed" ? (data.trend || null) : null,
                language: exportLang || language || "English",
                mode: "patient",
            };

            // Route to correct endpoint based on export type
            const endpoint = exportType === "summary" ? "/generate-summary-pdf" : "/generate-pdf";

            const res = await fetch(`${apiUrl}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error("PDF generation failed:", errorData);
                throw new Error(errorData.detail || "Failed to generate PDF");
            }

            const blob = await res.blob();
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = exportType === "summary"
                ? "MediLens_Health_Summary.pdf"
                : "MediLens_Detailed_Report.pdf";
            a.click();
            URL.revokeObjectURL(a.href);
        } catch (err: any) {
            console.error(err);
            window.alert(`Failed to export PDF: ${err.message || "Is backend active?"}`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen mesh-gradient-premium pb-20">
            {/* Header / Nav */}
            <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
                <Link href="/dashboard" className="group flex items-center gap-2 text-slate-400 hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Summary</span>
                </Link>
                <div className="flex items-center gap-3">
                    {/* PDF Type Selector */}
                    <select
                        value={exportType}
                        onChange={(e) => setExportType(e.target.value as "summary" | "detailed")}
                        className="h-10 px-4 rounded-full bg-white text-sm font-medium text-slate-700 border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        title="PDF Report Type"
                    >
                        <option value="summary">📋 Simple Summary</option>
                        <option value="detailed">📊 Detailed Report</option>
                    </select>

                    {/* Language Selector */}
                    <select
                        value={exportLang}
                        onChange={(e) => setExportLang(e.target.value)}
                        className="h-10 px-4 rounded-full bg-white text-sm font-medium text-slate-700 border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                        <option value="English">English</option>
                        <option value="Hindi">हिंदी (Hindi)</option>
                        <option value="Tamil">தமிழ் (Tamil)</option>
                        <option value="Telugu">తెలుగు (Telugu)</option>
                        <option value="Spanish">Español (Spanish)</option>
                    </select>
                    <Button
                        onClick={handleDownload}
                        disabled={isExporting}
                        className="rounded-full bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 h-10 px-6 gap-2"
                    >
                        {isExporting ? <div className="spinner" /> : <Download className="w-4 h-4" />}
                        <span className="text-sm">Export Insights</span>
                    </Button>
                    <Link href="/dashboard/upload">
                        <Button className="rounded-full h-10 px-6 shadow-lg shadow-primary/10">Analyze Another</Button>
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 space-y-12">

                {/* ── Visual Assessment Hero ────────────────────────────────────────── */}
                <section className="text-center space-y-6 fade-up">
                    <div className="relative inline-block">
                        <div className={`w-32 h-32 rounded-[2.5rem] mx-auto flex items-center justify-center orbit-glow float-sm ${assessmentTheme.orb} ${assessmentTheme.shadow} shadow-2xl transition-all duration-1000`}>
                            <assessmentTheme.icon className="w-12 h-12 text-white" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className={`text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 text-balance leading-tight`}>
                            Your health is {alert.alert_level === 'STABLE' ? 'remarkably stable' : 'showing focus areas'}.
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                            {alert.trigger_reason} prioritizing {abnormalEntries.length} key parameter(s) for your next consultation.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <div className="px-5 py-2.5 rounded-2xl liquid-glass border-slate-200/40 flex items-center gap-2">
                            <span className="text-xl font-bold text-primary">{totalMarkers}</span>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Markers</span>
                        </div>
                        <div className="px-5 py-2.5 rounded-2xl liquid-glass border-warning/10 flex items-center gap-2">
                            <span className="text-xl font-bold text-warning">{abnormalFindings}</span>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Findings</span>
                        </div>
                        <div className="px-5 py-2.5 rounded-2xl liquid-glass border-danger/10 flex items-center gap-2">
                            <span className="text-xl font-bold text-danger">{urgentCount}</span>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Urgent</span>
                        </div>
                    </div>

                    {/* Trend Summary Section */}
                    {data.trend && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-2xl mx-auto p-6 rounded-[2rem] liquid-glass border-primary/20 bg-primary/5 text-left space-y-3"
                        >
                            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                                <Activity className="w-4 h-4" />
                                Health Progress Tracking
                            </div>
                            <p className="text-slate-700 font-semibold leading-relaxed">
                                {data.trend.summary}
                            </p>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-2 border-t border-primary/10">
                                Comparing current results with your previous submission
                            </div>
                        </motion.div>
                    )}
                </section>

                {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
                <div className="flex justify-center">
                    <div className="p-1 rounded-2xl liquid-glass border-white/60 inline-flex items-center gap-1 shadow-sm">
                        <button
                            onClick={() => setActiveTab("insights")}
                            className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "insights" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            Insights
                        </button>
                        <button
                            onClick={() => setActiveTab("chat")}
                            className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "chat" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            Consult AI
                        </button>
                    </div>
                </div>

                {/* ── Content Area ──────────────────────────────────────────────────── */}
                <div className="fade-up">
                    {activeTab === "insights" ? (
                        <div className="space-y-6">
                            {/* Urgent Message */}
                            {alert.emergency_flag && (
                                <div className="p-5 rounded-[2rem] liquid-glass border-danger/10 flex items-center gap-4 text-danger-900 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-danger flex items-center justify-center shrink-0 shadow-lg shadow-danger/20 pulse">
                                        <AlertTriangle className="text-white w-5 h-5" />
                                    </div>
                                    <p className="font-bold text-sm leading-snug">
                                        Immediate medical attention recommended for critical markers.
                                    </p>
                                </div>
                            )}
                            {/* Audio Walkthrough */}
                            {card_explanations.length > 0 && (
                                <div className="mb-2">
                                    <AudioPlayer
                                        explanation={card_explanations
                                            .map((c: CardExplanation) => `${c.parameter}: ${c.what_this_means}`)
                                            .join(". ")}
                                        language={exportLang || language || "English"}
                                    />
                                </div>
                            )}

                            {/* Human-Kind Explanation Cards - RESPONSIVE GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {detailed
                                    .filter((d: any) => d.status !== "NON-NUMERIC")
                                    .sort((a: any, b: any) => {
                                        const urgencyMap: any = { CRITICAL: 0, HIGH: 1, BORDERLINE: 2, LOW: 3, NORMAL: 4 };
                                        return urgencyMap[a.status?.toUpperCase()] - urgencyMap[b.status?.toUpperCase()];
                                    })
                                    .map((entry: HighlightEntry) => {
                                        const trend = data.trend?.trends?.find((t: TrendEntry) => t.test === entry.parameter);
                                        return (
                                            <InsightCard
                                                key={entry.parameter}
                                                entry={entry}
                                                card={cardMap[entry.parameter]}
                                                trend={trend}
                                            />
                                        );
                                    })
                                }
                            </div>

                            {/* ── Comparative Bar Chart (shown when 2 PDFs analyzed) ── */}
                            {data.trend?.trends && data.trend.trends.length > 0 && (() => {
                                const chartData = data.trend.trends
                                    .filter((t: TrendEntry) => t.previous_value != null && t.current_value != null)
                                    .slice(0, 14)
                                    .map((t: TrendEntry) => ({
                                        name: t.test.length > 14 ? t.test.slice(0, 13) + "…" : t.test,
                                        Previous: Number(t.previous_value),
                                        Current: Number(t.current_value),
                                        unit: t.unit,
                                        assessment: t.assessment,
                                    }));
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="liquid-glass rounded-[2.5rem] p-8 border-white/60 shadow-xl mt-6"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 rounded-xl bg-primary/10">
                                                <Activity className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">Comparative Analysis</h3>
                                                <p className="text-sm text-slate-400">Previous vs Current report values</p>
                                            </div>
                                        </div>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }} barGap={4}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                                                    angle={-35}
                                                    textAnchor="end"
                                                    interval={0}
                                                />
                                                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: "1rem", border: "1px solid #e2e8f0", fontSize: 12 }}
                                                    formatter={(value: any, name: string, props: any) =>
                                                        [`${value} ${props.payload.unit || ""}`, name]
                                                    }
                                                />
                                                <Legend wrapperStyle={{ paddingTop: 8, fontSize: 12, fontWeight: 600 }} />
                                                <Bar dataKey="Previous" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                                                    <LabelList dataKey="Previous" position="top" style={{ fontSize: '10px', fill: '#3b82f6', fontWeight: 'bold' }} />
                                                </Bar>
                                                <Bar dataKey="Current" fill="#f97316" radius={[6, 6, 0, 0]}>
                                                    <LabelList dataKey="Current" position="top" style={{ fontSize: '10px', fill: '#f97316', fontWeight: 'bold' }} />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>

                                        {/* Legend: assessment badges */}
                                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                                            {data.trend.trends.slice(0, 14).map((t: TrendEntry) => (
                                                <span key={t.test} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${t.assessment === "Improved" ? "bg-accent/10 text-accent border-accent/20" :
                                                    t.assessment === "Worsened" ? "bg-danger/10 text-danger border-danger/20" :
                                                        "bg-slate-100 text-slate-500 border-slate-200"
                                                    }`}>
                                                    {t.assessment === "Improved" ? <TrendingDown className="w-3 h-3" /> :
                                                        t.assessment === "Worsened" ? <TrendingUp className="w-3 h-3" /> :
                                                            <Minus className="w-3 h-3" />}
                                                    {t.test.slice(0, 12)}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                );
                            })()}
                        </div>
                    ) : (
                        <div className="liquid-glass rounded-[3rem] p-4 shadow-2xl relative overflow-hidden h-[700px]">
                            <ChatPanel
                                tests={tests} analytics={analytics} alert={alert}
                                explanation={card_explanations.map((c: CardExplanation) => `${c.parameter}: ${c.what_this_means}`).join("\n")}
                                language={language} patient_info={patient_info}
                                panels={data.panels || []} dynamic_analysis={dynamic_analysis}
                            />
                        </div>
                    )}
                </div>

                {/* Verification Badge */}
                <div className="flex flex-col items-center justify-center py-12 gap-4 opacity-50">
                    <ShieldCheck className="w-12 h-12 text-accent" />
                    <div className="text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Analysis Intelligence Verified</p>
                        <p className="text-[10px] text-slate-400 mt-1">Llama 3.3 70B Neural Engine · Med-Spec 1.4</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
