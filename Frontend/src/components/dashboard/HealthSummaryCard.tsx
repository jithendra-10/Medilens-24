import { AlertCircle, CheckCircle2, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils/cn"

interface HealthSummaryCardProps {
  status: "Stable" | "Needs Monitoring" | "Consult Doctor"
  summary: string
  date: string
}

export function HealthSummaryCard({ status, summary, date }: HealthSummaryCardProps) {
  const config = {
    "Stable": {
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      title: "Overall Status: Mostly Stable"
    },
    "Needs Monitoring": {
      icon: Info,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      title: "Overall Status: Needs Monitoring"
    },
    "Consult Doctor": {
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      title: "Overall Status: Consult Doctor Soon"
    }
  }

  const activeConfig = config[status]
  const Icon = activeConfig.icon

  return (
    <Card className={cn("relative overflow-hidden border-0 shadow-2xl transition-all duration-500 rounded-[32px] group", activeConfig.border.replace('border-', 'shadow-').replace('200', '100'))}>
      <CardContent className={cn("p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-10", activeConfig.bg)}>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-1000">
          <Icon className="h-32 w-32 translate-x-12 -translate-y-12" />
        </div>

        <div className={cn("flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-white shadow-xl shadow-slate-200 animate-float", activeConfig.color)}>
          <Icon className="h-10 w-10" />
        </div>
        <div className="flex-1 space-y-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className={cn("text-2xl md:text-3xl font-black tracking-tight", activeConfig.color)}>
              {activeConfig.title}
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white/40 px-4 py-2 rounded-xl backdrop-blur-md border border-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-pulse"></span>
              LATEST: {date}
            </div>
          </div>
          <p className="text-slate-600 leading-relaxed max-w-4xl text-lg md:text-xl font-medium">
            {summary}
          </p>
          <div className="pt-4 flex gap-3">
            <Button variant="outline" className="rounded-xl border-white/60 bg-white/40 backdrop-blur-sm font-bold shadow-sm hover:bg-white text-slate-700">Detailed Report</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
