import { auth } from "@/lib/auth"
import { PageHeader } from "@/components/shared/PageHeader"
import { DashboardContent } from "@/components/dashboard/DashboardContent"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard" 
        description={`Welcome back, ${session?.user?.name || 'User'}`} 
      />

      <DashboardContent />
    </div>
  )
}
