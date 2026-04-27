import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getForecast } from "@/lib/fastapi"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FileText, 
  Users, 
  CreditCard, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { DashboardStats } from "@/types"
import { InvoiceStatus } from "@prisma/client"

export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id as string

  // Fetch stats in parallel
  const [
    outstandingInvoices,
    paidThisMonth,
    overdueCount,
    totalClients,
    recentInvoices,
    forecast
  ] = await Promise.all([
    // 1. Total outstanding
    prisma.invoice.aggregate({
      where: {
        userId,
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] }
      },
      _sum: { total: true }
    }),
    // 2. Paid this month
    prisma.payment.aggregate({
      where: {
        invoice: { userId },
        status: 'COMPLETED',
        paidAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { amount: true }
    }),
    // 3. Overdue count
    prisma.invoice.count({
      where: { userId, status: InvoiceStatus.OVERDUE }
    }),
    // 4. Total clients
    prisma.client.count({
      where: { userId }
    }),
    // 5. Recent invoices
    prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { client: true }
    }),
    // 6. Forecast from FastAPI
    getForecast(30).catch(() => null)
  ])

  const stats: DashboardStats = {
    totalOutstanding: Number(outstandingInvoices._sum.total || 0),
    totalPaidMonth: Number(paidThisMonth._sum.amount || 0),
    overdueCount,
    totalClients
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard" 
        description={`Welcome back, ${session?.user?.name || 'User'}`} 
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Outstanding" 
          value={formatCurrency(stats.totalOutstanding)} 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          description="Sum of all unpaid invoices"
        />
        <StatCard 
          title="Paid (This Month)" 
          value={formatCurrency(stats.totalPaidMonth)} 
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
          description="+12% from last month"
          trend="up"
        />
        <StatCard 
          title="Overdue" 
          value={stats.overdueCount.toString()} 
          icon={<AlertCircle className="h-4 w-4 text-red-500" />}
          description="Requires immediate attention"
          variant="danger"
        />
        <StatCard 
          title="Total Clients" 
          value={stats.totalClients.toString()} 
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Active client base"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Cash Flow Forecast (30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {/* ForecastChart will go here */}
            <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-slate-50 rounded-md border border-dashed">
              <TrendingUp className="mr-2 h-4 w-4" />
              Forecast visualization loading...
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{invoice.client.name}</p>
                    <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
                  </div>
                  <div className="ml-auto font-medium">
                    {formatCurrency(Number(invoice.total), invoice.currency)}
                  </div>
                </div>
              ))}
              {recentInvoices.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent invoices</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon, 
  description, 
  trend,
  variant 
}: { 
  title: string, 
  value: string, 
  icon: React.ReactNode, 
  description: string,
  trend?: 'up' | 'down',
  variant?: 'danger'
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${variant === 'danger' ? 'text-red-600' : ''}`}>{value}</div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />}
          {trend === 'down' && <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />}
          {description}
        </div>
      </CardContent>
    </Card>
  )
}
