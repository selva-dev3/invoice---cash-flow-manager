import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge"
import { Mail, Phone, MapPin, CreditCard, FileText } from "lucide-react"

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const userId = session?.user?.id as string

  const client = await prisma.client.findUnique({
    where: { id: params.id, userId },
    include: {
      invoices: {
        orderBy: { createdAt: 'desc' },
      }
    }
  })

  if (!client) {
    notFound()
  }

  const totalBilled = client.invoices.reduce((acc, inv) => acc + Number(inv.total), 0)
  const totalPaid = client.invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((acc, inv) => acc + Number(inv.total), 0)

  return (
    <div className="space-y-6">
      <PageHeader 
        title={client.name} 
        description={`Client since ${formatDate(client.createdAt)}`}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="whitespace-pre-line">{client.address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBilled, client.currency)}</div>
              <p className="text-xs text-muted-foreground mt-1">Across {client.invoices.length} invoices</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid, client.currency)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {client.invoices.length > 0 
                  ? `${Math.round((totalPaid / totalBilled) * 100)}% collection rate` 
                  : 'No invoices yet'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Invoice #</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Issue Date</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {client.invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{invoice.invoiceNumber}</td>
                    <td className="p-4 align-middle">{formatDate(invoice.issueDate)}</td>
                    <td className="p-4 align-middle">
                      <InvoiceStatusBadge status={invoice.status} />
                    </td>
                    <td className="p-4 align-middle text-right">
                      {formatCurrency(Number(invoice.total), invoice.currency)}
                    </td>
                  </tr>
                ))}
                {client.invoices.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">No invoices found for this client.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
