import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface CashflowSummaryProps {
  forecast: any
}

export function CashflowSummary({ forecast }: CashflowSummaryProps) {
  const currentTotal = forecast?.summary?.current_total || 0
  const projected30 = forecast?.summary?.projected_30d || 0
  const projected90 = forecast?.summary?.projected_90d || 0
  
  const diff30 = projected30 - currentTotal
  const diff90 = projected90 - currentTotal

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(currentTotal)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Projected (30 Days)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold">{formatCurrency(projected30)}</div>
          <div className={`flex items-center text-xs font-semibold ${diff30 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {diff30 >= 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
            {formatCurrency(Math.abs(diff30))} {diff30 >= 0 ? 'increase' : 'decrease'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Projected (90 Days)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold">{formatCurrency(projected90)}</div>
          <div className={`flex items-center text-xs font-semibold ${diff90 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {diff90 >= 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
            {formatCurrency(Math.abs(diff90))} {diff90 >= 0 ? 'increase' : 'decrease'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
