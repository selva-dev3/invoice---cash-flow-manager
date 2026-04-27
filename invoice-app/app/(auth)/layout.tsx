import { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              I
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              Invoice<span className="text-brand-primary">Flow</span>
            </span>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
