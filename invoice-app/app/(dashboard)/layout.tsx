import { ReactNode } from "react"
import { Sidebar } from "@/components/shared/Sidebar"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-60 flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-60">
        <div className="container mx-auto py-8 px-4 md:px-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
