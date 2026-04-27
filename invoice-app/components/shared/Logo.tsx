import Link from "next/link"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-primary/20">
        I
      </div>
      <span className="text-xl font-bold text-slate-900 tracking-tight">
        Invoice<span className="text-brand-primary">Flow</span>
      </span>
    </Link>
  )
}
