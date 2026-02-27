import { Sparkles, Info, TrendingUp, HeartPulse } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AIExplanationProps {
  whatItMeans: string
  whyItMatters: string
  trendExplanation: string
  lifestyleSuggestions: string[]
}

export function AIExplanation({
  whatItMeans,
  whyItMatters,
  trendExplanation,
  lifestyleSuggestions,
}: AIExplanationProps) {
  return (
    <Card className="border-blue-100 bg-gradient-to-br from-blue-50/50 to-white shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-blue-100 blur-3xl opacity-50"></div>
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg font-semibold text-slate-900">AI Health Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        <div className="space-y-2">
          <h4 className="flex items-center gap-2 font-semibold text-slate-900">
            <Info className="h-4 w-4 text-blue-600" />
            What this means
          </h4>
          <p className="text-slate-600 leading-relaxed">{whatItMeans}</p>
        </div>

        <div className="space-y-2">
          <h4 className="flex items-center gap-2 font-semibold text-slate-900">
            <HeartPulse className="h-4 w-4 text-rose-500" />
            Why it matters
          </h4>
          <p className="text-slate-600 leading-relaxed">{whyItMatters}</p>
        </div>

        <div className="space-y-2">
          <h4 className="flex items-center gap-2 font-semibold text-slate-900">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Trend Analysis
          </h4>
          <p className="text-slate-600 leading-relaxed">{trendExplanation}</p>
        </div>

        <div className="space-y-3 rounded-xl bg-white p-5 border border-slate-100 shadow-sm">
          <h4 className="font-semibold text-slate-900">Lifestyle Suggestions</h4>
          <ul className="space-y-2">
            {lifestyleSuggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
