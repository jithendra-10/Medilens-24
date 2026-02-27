import { MessageSquare, Sparkles, Send, Brain, ShieldAlert, BookOpen, Search, Lock, User, MoreHorizontal, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { cn } from "@/utils/cn"

export default function AIAssistantPage() {
    const [activeTab, setActiveTab] = useState<"general" | "contextual">("general")
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in-50 duration-700">
            {/* LEFT SIDEBAR: Context & Modes */}
            <div className="w-80 flex flex-col gap-6">
                {/* Mode Selector Card */}
                <button
                    onClick={() => setActiveTab("general")}
                    className={cn(
                        "w-full text-left p-6 rounded-[32px] transition-all duration-500 group relative overflow-hidden",
                        activeTab === "general"
                            ? "bg-blue-600 text-white shadow-2xl shadow-blue-500/30"
                            : "bg-white/60 backdrop-blur-md border border-white/60 text-slate-500 hover:bg-white"
                    )}
                >
                    <div className="relative z-10 flex items-center gap-4">
                        <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors shadow-lg",
                            activeTab === "general" ? "bg-white/20" : "bg-blue-50 text-blue-600"
                        )}>
                            <Bot className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-sm uppercase tracking-wider">General Assistant</h3>
                            <p className={cn("text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mt-0.5", activeTab === "general" ? "text-blue-100" : "text-slate-400")}>
                                Medical Knowledge
                            </p>
                        </div>
                    </div>
                    {activeTab === "general" && (
                        <div className="absolute top-0 right-0 p-4">
                            <div className="h-2 w-2 rounded-full bg-blue-200 animate-ping" />
                        </div>
                    )}
                </button>

                {/* Report Context Selector */}
                <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-md rounded-[40px] border border-white/60 shadow-xl shadow-slate-200/40 overflow-hidden">
                    <div className="p-6 border-b border-white/40">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report Context</h3>
                            <span className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">0</span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search reports..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 pl-10 pr-4 rounded-xl border-0 bg-white shadow-inner text-xs font-medium focus-visible:ring-1 focus-visible:ring-blue-500/20"
                            />
                        </div>
                    </div>
                    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center opacity-30">
                        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <Brain className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-loose">No Report<br />Selected</p>
                    </div>
                </div>
            </div>

            {/* RIGHT CHAT AREA */}
            <div className="flex-1 flex flex-col bg-[#2d3345] rounded-[48px] shadow-2xl shadow-indigo-900/20 overflow-hidden relative">
                {/* Chat Header */}
                <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-white font-black text-sm">General Medical Intelligence</h2>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Live</span>
                            </div>
                            <p className="text-slate-400 text-[10px] font-medium">MediLens AI Neural Engine v1.1</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                            <Lock className="h-3 w-3 text-emerald-400" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Encrypted</span>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                {/* Chat Messages */}
                <div className="flex-1 p-8 overflow-y-auto space-y-8 scrollbar-hide">
                    {/* AI Message */}
                    <div className="flex items-start gap-4 animate-in slide-in-from-left-4 duration-500">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 mt-1">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="max-w-[80%] p-6 rounded-[28px] rounded-tl-none bg-white/5 border border-white/10 backdrop-blur-sm">
                            <h4 className="text-blue-400 font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                General Medical Assistant
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            </h4>
                            <p className="text-slate-200 text-sm font-medium leading-loose">
                                Hi! I'm your Medical AI Assistant. Ask me any general medical question. Please note that I cannot diagnose conditions or prescribe medication.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chat Footer / Input */}
                <div className="p-8 space-y-6">
                    <div className="flex flex-wrap justify-center gap-3">
                        {["What are the symptoms of the flu?", "How much sleep do I need?", "What is a healthy blood pressure?", "How to lower cholesterol naturally?"].map((s, i) => (
                            <button
                                key={i}
                                className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-300"
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <div className="relative group max-w-4xl mx-auto w-full">
                        <Input
                            placeholder="Deep dive into your report..."
                            className="h-16 px-8 rounded-2xl border-0 bg-white/5 border border-white/5 text-white placeholder:text-slate-500 text-sm font-medium focus-visible:ring-1 focus-visible:ring-blue-500/30 transition-all group-hover:bg-white/10"
                        />
                        <Button
                            size="icon"
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-90 transition-all"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 opacity-40">
                            Medilens AI Neural Engine — Encrypted & Grounded
                        </p>
                    </div>
                </div>

                {/* Bottom Safety Banner */}
                <div className="absolute bottom-4 right-8 left-8 flex justify-center opacity-0 pointer-events-none transition-opacity hover:opacity-100">
                    <div className="px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center gap-2">
                        <ShieldAlert className="h-3 w-3 text-amber-500" />
                        <span className="text-[8px] font-black text-amber-500 uppercase tracking-[0.2em]">Research Only — No Diagnosis</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
