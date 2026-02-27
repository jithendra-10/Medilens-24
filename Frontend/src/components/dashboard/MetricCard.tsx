import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/utils/cn"

export type MetricStatus = "Normal" | "Borderline" | "High" | "Low" | "Critical" | "Other"
export type TrendDirection = "up" | "down" | "stable"

interface MetricCardProps {
  key?: string | number
  name: string
  value: string | number
  unit: string
  referenceRange: string
  status: MetricStatus
  trend: TrendDirection
  percentChange?: number
}

export function MetricCard({
  name,
  value,
  unit,
  referenceRange,
  status,
  trend,
  percentChange,
}: MetricCardProps) {
  const statusConfig: Record<string, { color: string; indicator: string }> = {
    Normal: { color: "bg-emerald-100 text-emerald-800", indicator: "bg-emerald-500" },
    Borderline: { color: "bg-amber-100 text-amber-800", indicator: "bg-amber-500" },
    High: { color: "bg-red-100 text-red-800", indicator: "bg-red-500" },
    Low: { color: "bg-blue-100 text-blue-800", indicator: "bg-blue-500" },
    Critical: { color: "bg-purple-100 text-purple-900 border-purple-200", indicator: "bg-purple-600" },
    Other: { color: "bg-slate-100 text-slate-800", indicator: "bg-slate-400" },
  }

  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus
  const trendColor = trend === "stable" ? "text-slate-500" : trend === "up" && (status === "High" || status === "Critical") ? "text-red-500" : trend === "down" && (status === "Low" || status === "Critical") ? "text-red-500" : "text-emerald-500"

  const safeConfig = statusConfig[status] || statusConfig.Other;

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 border-0 bg-white group rounded-[32px]">
      <div className={cn("absolute top-0 left-0 h-full w-1.5 opacity-80", safeConfig.indicator)} />
      <CardHeader className="pb-3 pt-6 flex flex-row items-start justify-between space-y-0 px-6">
        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">{name}</CardTitle>
        <Badge variant="outline" className={cn("border-0 font-black text-[10px] uppercase tracking-tighter px-2 py-0.5 rounded-lg", safeConfig.color)}>
          {status}
        </Badge>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-4xl font-black tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors">{value}</span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{unit}</span>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Ref: <span className="text-slate-900">{referenceRange}</span>
          </div>
          {percentChange !== undefined && (
            <div className={cn("flex items-center text-xs font-black px-2 py-1 rounded-lg bg-slate-50", trendColor)}>
              <TrendIcon className="mr-0.5 h-3 w-3" />
              {percentChange}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
