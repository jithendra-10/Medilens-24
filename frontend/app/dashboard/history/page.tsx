"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { FileText, Calendar, ArrowRight, Activity, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

type ReportHistoryItem = {
    id: string;
    patientName: string;
    reportDate: string | null;
    overallRisk: string;
    totalTests: number;
    abnormalTests: number;
    createdAt: string;
};

function HistoryContent() {
    const searchParams = useSearchParams();
    const profileId = searchParams.get("profileId");
    const { getToken, isLoaded } = useAuth();

    const [reports, setReports] = useState<ReportHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoaded) return; // wait for Clerk
        const fetchHistory = async () => {
            const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api").replace(/\/$/, "");
            const token = await getToken();
            if (!token) {
                console.warn("No auth token — skipping history fetch");
                setIsLoading(false);
                return;
            }
            const url = profileId
                ? `${apiUrl}/dashboard/reports?profileId=${profileId}`
                : `${apiUrl}/dashboard/reports`;

            console.log(`Fetching history from: ${url}`);

            const fetchWithRetry = async (url: string, options: any, retries = 3, backoff = 800) => {
                for (let i = 0; i < retries; i++) {
                    try {
                        const res = await fetch(url, options);
                        if (res.ok) return res;
                        if (res.status === 401) throw new Error("Unauthorized");
                        console.warn(`Fetch attempt ${i + 1} failed with status: ${res.status}`);
                    } catch (e: any) {
                        console.error(`Fetch attempt ${i + 1} error:`, e);
                        if (i === retries - 1) throw e;
                        await new Promise(r => setTimeout(r, backoff * (i + 1)));
                    }
                }
            };

            try {
                const res = await fetchWithRetry(url, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (res?.ok) {
                    const data = await res.json();
                    const mapped = data.map((r: any) => {
                        let structured: any = {};
                        try {
                            structured = r.structured_data_json
                                ? JSON.parse(r.structured_data_json)
                                : {};
                        } catch { }
                        const info = structured.patient_info || {};
                        return {
                            id: r.id,
                            patientName:
                                info["Patient Name"] ||
                                info.name ||
                                info.patient_name ||
                                r.type ||
                                "Lab Report",
                            reportDate: info["Report Date"] || info.report_date || null,
                            overallRisk: r.risk || "Stable",
                            totalTests: r.metrics?.length ?? 0,
                            abnormalTests: r.metrics?.filter((m: any) => m.status !== "Normal").length ?? 0,
                            createdAt: r.created_at,
                        };
                    });
                    setReports(mapped);
                }
            } catch (err) {
                console.error("Fetch history failed after retries:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileId, isLoaded]);

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api").replace(/\/$/, "");
            const token = await getToken();
            const res = await fetch(`${apiUrl}/dashboard/reports/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (res.ok) {
                setReports(prev => prev.filter(r => r.id !== id));
            } else {
                const err = await res.json().catch(() => ({}));
                alert(err.detail || "Failed to delete report.");
            }
        } catch (e) {
            console.error("Delete failed", e);
            alert("Failed to delete report. Please try again.");
        } finally {
            setDeletingId(null);
            setConfirmDeleteId(null);
        }
    };

    const filteredReports = reports.filter(r =>
        r.patientName.toLowerCase().includes(filter.toLowerCase()) ||
        (r.reportDate || "").includes(filter)
    );

    return (
        <div className="min-h-screen pb-20 fade-up">
            <div className="max-w-7xl mx-auto px-6 pt-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-primary/10">
                                <Activity className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900">Medical History</h1>
                        </div>
                        <p className="text-slate-500 max-w-md">
                            {profileId ? "Showing all reports for this family member." : "A complete timeline of your analyzed medical reports."}
                        </p>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or date..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="h-12 pl-11 pr-6 rounded-full bg-white/60 border border-slate-200/50 w-full md:w-80 focus:w-full md:focus:w-96 transition-all focus:ring-4 focus:ring-primary/5 outline-none font-medium"
                        />
                    </div>
                </div>

                {/* Reports List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
                        ))}
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 rounded-[3rem] border border-slate-100 border-dashed">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-100 flex items-center justify-center mb-6">
                            <FileText className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No reports found</h3>
                        <p className="text-slate-500 max-w-xs mb-8">
                            {filter ? "Try a different search term or clear the filter." : "Start by uploading your first lab report for analysis."}
                        </p>
                        <Link href="/dashboard/upload">
                            <Button className="rounded-full px-8">Upload New Report</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredReports.map((report) => (
                                <motion.div
                                    key={report.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="liquid-glass group overflow-hidden"
                                >
                                    {/* Confirm delete banner */}
                                    <AnimatePresence>
                                        {confirmDeleteId === report.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="bg-red-50 border-b border-red-100 px-8 py-3 flex items-center justify-between"
                                            >
                                                <span className="text-sm font-medium text-red-700">
                                                    Are you sure you want to delete this report? This cannot be undone.
                                                </span>
                                                <div className="flex gap-2 ml-4 shrink-0">
                                                    <button
                                                        onClick={() => setConfirmDeleteId(null)}
                                                        className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(report.id)}
                                                        disabled={deletingId === report.id}
                                                        className="px-4 py-1.5 rounded-full text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
                                                    >
                                                        {deletingId === report.id ? "Deleting…" : "Yes, Delete"}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 sm:p-8 gap-6">
                                        {/* Left: info — clickable */}
                                        <Link
                                            href={`/dashboard/results?id=${report.id}`}
                                            className="flex items-center gap-6 flex-1 min-w-0"
                                        >
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-50 text-primary shrink-0 transition-transform group-hover:scale-110">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors mb-1 truncate">
                                                    {report.patientName}
                                                </h3>
                                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5 font-sans">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {report.reportDate ? new Date(report.reportDate).toLocaleDateString() : new Date(report.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <span className="flex items-center gap-1.5">
                                                        <Activity className="w-3.5 h-3.5" />
                                                        {report.totalTests} Markers
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Right: risk badge + actions */}
                                        <div className="flex items-center justify-between md:justify-end gap-4">
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status</div>
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${report.overallRisk.includes('Critical') ? 'bg-danger/10 text-danger border-danger/20' :
                                                    report.overallRisk.includes('High') ? 'bg-warning/10 text-warning border-warning/20' :
                                                        'bg-accent/10 text-accent border-accent/20'
                                                    }`}>
                                                    {report.overallRisk}
                                                </div>
                                            </div>

                                            {/* Delete button */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setConfirmDeleteId(prev => prev === report.id ? null : report.id);
                                                }}
                                                title="Delete report"
                                                className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            {/* View button */}
                                            <Link href={`/dashboard/results?id=${report.id}`}>
                                                <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                                    <ArrowRight className="w-5 h-5" />
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function HistoryPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center text-slate-400">Loading history...</div>}>
            <HistoryContent />
        </Suspense>
    );
}
