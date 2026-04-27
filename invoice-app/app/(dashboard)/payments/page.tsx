import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { CreditCard, ArrowUpRight, Clock } from "lucide-react"

export default async function PaymentsPage() {
  const session = await auth()
  const userId = session?.user?.id as string

  const payments = await prisma.payment.findMany({
    where: {
      invoice: { userId }
    },
    include: {
      invoice: {
        include: { client: { select: { name: true } } }
      }
    },
    orderBy: { paidAt: 'desc' },
  })

  const totalReceivedMonth = payments
    .filter(p => p.status === 'COMPLETED' && p.paidAt >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    .reduce((acc, p) => acc + Number(p.amount), 0)

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Payments" 
        description="Monitor your incoming cash and payment history"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received (This Month)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalReceivedMonth)}</div>
            <p className="text-xs text-muted-foreground mt-1">Verified bank & stripe payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All-time recorded payments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.invoice.invoiceNumber}</TableCell>
                  <TableCell>{payment.invoice.client.name}</TableCell>
                  <TableCell>
                    <span className="capitalize">{payment.method.toLowerCase().replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      payment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {payment.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(payment.paidAt)}</TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(Number(payment.amount), payment.invoice.currency)}
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
