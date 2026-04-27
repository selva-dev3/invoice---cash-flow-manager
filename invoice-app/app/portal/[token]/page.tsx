import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatCurrency, formatDate } from "@/lib/utils"
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, CreditCard, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { InvoiceStatus } from "@prisma/client"

export default async function PublicPortalPage({ params }: { params: { token: string } }) {
  const invoice = await prisma.invoice.findUnique({
    where: { portalToken: params.token },
    include: {
      client: true,
      items: true,
      user: { include: { settings: true } },
      payments: { where: { status: 'COMPLETED' } }
    }
  })

  if (!invoice) {
    notFound()
  }

  const totalPaid = invoice.payments.reduce((acc, p) => acc + Number(p.amount), 0)
  const balance = Number(invoice.total) - totalPaid
  const isPaid = invoice.status === InvoiceStatus.PAID

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="text-muted-foreground">Issued on {formatDate(invoice.issueDate)}</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/api/v1/invoices/${invoice.id}/pdf`}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </a>
          </Button>
          {!isPaid && (
            <Button className="bg-brand-primary hover:bg-brand-primary/90" asChild>
              {/* This would normally point to a client-side component that calls the create-link API */}
              <Link href={`/portal/${params.token}/pay`}>
                <CreditCard className="mr-2 h-4 w-4" /> Pay Now
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-3 font-medium">Description</th>
                    <th className="text-center py-3 font-medium">Qty</th>
                    <th className="text-right py-3 font-medium">Price</th>
                    <th className="text-right py-3 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4">{item.description}</td>
                      <td className="py-4 text-center">{Number(item.quantity)}</td>
                      <td className="py-4 text-right">{formatCurrency(Number(item.unitPrice), invoice.currency)}</td>
                      <td className="py-4 text-right">{formatCurrency(Number(item.amount), invoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-8 space-y-3 border-t pt-6 max-w-xs ml-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(Number(invoice.subtotal), invoice.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax ({Number(invoice.taxRate)}%)</span>
                  <span>{formatCurrency(Number(invoice.taxAmount), invoice.currency)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-bold text-brand-primary">{formatCurrency(Number(invoice.total), invoice.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {isPaid && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-center gap-4 text-green-800">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-bold text-lg">This invoice is fully paid</p>
                <p className="text-sm">Thank you for your payment. A receipt has been sent to your email.</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">From</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="font-bold">{invoice.user.settings?.companyName || invoice.user.name}</p>
              {invoice.user.settings?.address && (
                <p className="text-muted-foreground whitespace-pre-line">{invoice.user.settings.address}</p>
              )}
              <p className="text-muted-foreground">{invoice.user.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bill To</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="font-bold">{invoice.client.name}</p>
              {invoice.client.address && (
                <p className="text-muted-foreground whitespace-pre-line">{invoice.client.address}</p>
              )}
              <p className="text-muted-foreground">{invoice.client.email}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
