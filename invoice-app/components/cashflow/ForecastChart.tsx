"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatCurrency, formatDateShort } from "@/lib/utils"

interface ForecastPoint {
  ds: string
  yhat: number
  yhat_lower: number
  yhat_upper: number
}

interface ForecastChartProps {
  data: ForecastPoint[]
}

export function ForecastChart({ data }: ForecastChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground border border-dashed rounded-md">
        Insufficient data for forecasting. Create more invoices and expenses to see predictions.
      </div>
    )
  }

  // Format data for Recharts
  const chartData = data.map(item => ({
    date: item.ds,
    amount: Math.round(item.yhat * 100) / 100,
    range: [item.yhat_lower, item.yhat_upper],
  }))

  return (
    <div className="h-[350px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDateShort} 
            stroke="#94a3b8" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="text-sm font-semibold mb-1">{formatDateShort(payload[0].payload.date)}</p>
                    <p className="text-sm text-brand-primary font-bold">
                      Predicted: {formatCurrency(payload[0].value as number)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Confidence Range: {formatCurrency(payload[0].payload.range[0])} - {formatCurrency(payload[0].payload.range[1])}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#6366f1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorAmount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
