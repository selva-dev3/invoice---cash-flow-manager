import { Badge } from "@/components/ui/badge"
import { InvoiceStatus } from "@prisma/client"
import { cn, getInvoiceStatusColor, getInvoiceStatusLabel } from "@/lib/utils"

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
  className?: string
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const colorClass = getInvoiceStatusColor(status)
  const label = getInvoiceStatusLabel(status)

  return (
    <Badge 
      variant="outline" 
      className={cn("px-2 py-0.5 font-semibold text-[10px] uppercase tracking-wider", colorClass, className)}
    >
      {label}
    </Badge>
  )
}
