import { LucideIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyStateProps {
  title: string
  description: string
  icon: LucideIcon
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  actionHref
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-slate-50/50">
      <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-500 mt-2 max-w-xs">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild className="mt-6 bg-brand-primary hover:bg-brand-primary/90">
          <Link href={actionHref}>
            <Plus className="mr-2 h-4 w-4" />
            {actionLabel}
          </Link>
        </Button>
      )}
    </div>
  )
}
