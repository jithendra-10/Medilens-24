import React from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TrendDataPoint {
  test: string
  Previous: number
  Current: number
  unit?: string
  change_pct?: number
}

interface TrendChartProps {
  key?: React.Key
  title: string
  description: string
  data: TrendDataPoint[]
}

export function TrendChart({ title, description, data }: TrendChartProps) {
  // Guard against empty data
  if (!data || data.length === 0) return null;

  return (
    <Card className="col-span-1 lg:col-span-2 border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="test"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={20}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload as TrendDataPoint;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg min-w-[200px]">
                        <p className="mb-2 text-sm font-bold text-slate-800 border-b pb-2">{label}</p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-1.5 font-medium text-slate-500">
                              <div className="w-2.5 h-2.5 rounded-sm bg-slate-300"></div> Previous
                            </span>
                            <span className="font-bold">{dataPoint.Previous} <span className="text-xs font-normal text-slate-400">{dataPoint.unit}</span></span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-1.5 font-medium text-slate-500">
                              <div className="w-2.5 h-2.5 rounded-sm bg-blue-600"></div> Current
                            </span>
                            <span className="font-bold text-blue-700">{dataPoint.Current} <span className="text-xs font-normal text-slate-400">{dataPoint.unit}</span></span>
                          </div>
                          {dataPoint.change_pct !== undefined && dataPoint.change_pct !== null && (
                            <div className="mt-2 text-xs font-medium text-right text-slate-500 pt-1 border-t">
                              Change: <span className={dataPoint.change_pct > 0 ? "text-amber-600" : dataPoint.change_pct < 0 ? "text-emerald-600" : ""}>
                                {dataPoint.change_pct > 0 ? '+' : ''}{dataPoint.change_pct}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar dataKey="Previous" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Current" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
