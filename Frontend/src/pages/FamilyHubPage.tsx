import { Users, UserPlus, Heart, Shield, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function FamilyHubPage() {
    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest border border-indigo-200 shadow-sm transition-transform hover:scale-105 duration-300">
                        <Users className="h-3 w-3" /> Patient Management
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                        Family <span className="text-indigo-600">Hub</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium opacity-80">Manage health profiles for your family members.</p>
                </div>
                <Button size="lg" className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 group">
                    <UserPlus className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" /> Add Member
                </Button>
            </div>

            <div className="flex flex-col items-center justify-center py-32 text-center glass-panel rounded-[40px] border-dashed border-2 border-indigo-200/50 animate-in zoom-in-95 duration-1000">
                <div className="relative mb-10 group">
                    <div className="absolute inset-0 bg-indigo-400/20 blur-3xl rounded-full animate-pulse group-hover:bg-indigo-400/40 transition-colors"></div>
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-[32px] bg-white shadow-2xl shadow-indigo-500/10 text-slate-300 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 animate-float">
                        <Users className="h-14 w-14" />
                    </div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">No profiles yet</h3>
                <p className="text-slate-500 max-w-sm mt-4 mb-10 text-lg font-medium leading-relaxed opacity-80">
                    Create distinct health profiles to keep medical records organized per family member.
                </p>
                <div className="flex gap-4">
                    <Button size="lg" variant="outline" className="rounded-2xl h-16 px-10 border-indigo-100 bg-white/50 backdrop-blur-sm text-indigo-600 font-bold hover:bg-white shadow-sm transition-all hover:-translate-y-1">
                        Create Manually
                    </Button>
                    <Button size="lg" className="rounded-2xl h-16 px-10 bg-indigo-600 text-white font-black shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all">
                        Upload Member Report
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
                <Card className="border-0 bg-white/40 backdrop-blur-md rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-white/60">
                    <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                        <Heart className="h-6 w-6" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">Health Sharing</h4>
                    <p className="text-slate-500 font-medium">Securely share health insights with family members while maintaining data privacy.</p>
                </Card>
                <Card className="border-0 bg-white/40 backdrop-blur-md rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-white/60">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                        <Shield className="h-6 w-6" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">Secure Storage</h4>
                    <p className="text-slate-500 font-medium">All sensitive medical documents are encrypted and accessible only to authorized profiles.</p>
                </Card>
                <Card className="border-0 bg-white/40 backdrop-blur-md rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-white/60">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                        <Activity className="h-6 w-6" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">Trend Analysis</h4>
                    <p className="text-slate-500 font-medium">Monitor health progress across generations with integrated comparative reports.</p>
                </Card>
            </div>
        </div>
    )
}
