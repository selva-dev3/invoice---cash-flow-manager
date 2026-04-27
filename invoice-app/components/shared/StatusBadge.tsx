import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  variant?: "success" | "warning" | "error" | "info" | "neutral"
  className?: string
}

export function StatusBadge({ status, variant = "neutral", className }: StatusBadgeProps) {
  const variants = {
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
    error: "bg-red-100 text-red-700 border-red-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  }

  return (
    <Badge 
      variant="outline" 
      className={cn("px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider", variants[variant], className)}
    >
      {status}
    </Badge>
  )
}
