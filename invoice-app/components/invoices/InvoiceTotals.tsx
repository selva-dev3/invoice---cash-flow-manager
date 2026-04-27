import { formatCurrency } from "@/lib/utils"

interface InvoiceTotalsProps {
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  currency: string
}

export function InvoiceTotals({ subtotal, taxRate, taxAmount, total, currency }: InvoiceTotalsProps) {
  return (
    <div className="flex flex-col items-end space-y-3">
      <div className="flex justify-between w-64 text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
      </div>
      <div className="flex justify-between w-64 text-sm">
        <span className="text-muted-foreground">Tax ({taxRate}%)</span>
        <span className="font-medium">{formatCurrency(taxAmount, currency)}</span>
      </div>
      <div className="h-px bg-slate-200 w-64 my-1" />
      <div className="flex justify-between w-64 items-baseline">
        <span className="text-base font-bold">Total</span>
        <span className="text-2xl font-black text-brand-primary">{formatCurrency(total, currency)}</span>
      </div>
    </div>
  )
}
