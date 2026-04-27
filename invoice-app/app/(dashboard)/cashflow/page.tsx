import { auth } from "@/lib/auth"
import { getForecast } from "@/lib/fastapi"
import { PageHeader } from "@/components/shared/PageHeader"
import { ForecastChart } from "@/components/cashflow/ForecastChart"
import { CashflowSummary } from "@/components/cashflow/CashflowSummary"
import { ExpenseBreakdown } from "@/components/cashflow/ExpenseBreakdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BrainCircuit, Info } from "lucide-react"

export default async function CashFlowPage() {
  const session = await auth()
  const userId = session?.user?.id as string

  let forecastData = null
  let error = null

  try {
    forecastData = await getForecast(90) // 90 days forecast
  } catch (e) {
    error = "Could not connect to the ML forecasting service. Using historical data only."
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Cash Flow Forecast" 
        description="ML-powered predictions for your business's financial future"
      />

      {error && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>90-Day Prediction</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Based on historical invoices and expenses</p>
              </div>
              <div className="flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
                <BrainCircuit className="h-3.5 w-3.5" />
                AI Powered
              </div>
            </CardHeader>
            <CardContent>
              <ForecastChart data={forecastData?.forecast || []} />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <CashflowSummary forecast={forecastData} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Forecasted vs Actuals</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Additional chart or detailed comparison */}
            <div className="h-[200px] bg-slate-50 rounded-md border border-dashed flex items-center justify-center text-muted-foreground">
              Comparison visualization
            </div>
          </CardContent>
        </Card>
        <ExpenseBreakdown />
      </div>
    </div>
  )
}
