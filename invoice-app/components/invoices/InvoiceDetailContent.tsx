"use client"

import { useInvoice } from "@/hooks/use-api"
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge"
import { InvoiceTotals } from "@/components/invoices/InvoiceTotals"
import { PaymentRecordDialog } from "@/components/invoices/PaymentRecordDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Download, 
  Send, 
  Edit, 
  Copy, 
  Trash, 
  CreditCard, 
  Clock,
  ExternalLink,
  Loader2
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { InvoiceStatus } from "@prisma/client"
import { DuplicateButton } from "@/components/invoices/DuplicateButton"
import { SendInvoiceButton } from "@/components/invoices/SendInvoiceButton"

export function InvoiceDetailContent({ invoiceId }: { invoiceId: string }) {
  const { data: invoice, isLoading, error } = useInvoice(invoiceId)

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="flex h-[400px] items-center justify-center text-red-500">
        Error loading invoice details.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{invoice.invoiceNumber}</h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="text-muted-foreground mt-1">Issued to {invoice.client.name} on {formatDate(invoice.issueDate)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {invoice.status === InvoiceStatus.DRAFT && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/invoices/${invoice.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/v1/invoices/${invoice.id}/pdf`}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </a>
          </Button>
          <DuplicateButton invoiceId={invoice.id} />
          {(invoice.status === InvoiceStatus.DRAFT || invoice.status === InvoiceStatus.SENT) && (
            <SendInvoiceButton 
              invoiceId={invoice.id} 
              className="bg-brand-primary hover:bg-brand-primary/90" 
            />
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Description</th>
                    <th className="h-12 px-4 text-center font-medium text-muted-foreground">Qty</th>
                    <th className="h-12 px-4 text-right font-medium text-muted-foreground">Price</th>
                    <th className="h-12 px-4 text-right font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item: any) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-4 align-middle">{item.description}</td>
                      <td className="p-4 align-middle text-center">{Number(item.quantity)}</td>
                      <td className="p-4 align-middle text-right">{formatCurrency(Number(item.unitPrice), invoice.currency)}</td>
                      <td className="p-4 align-middle text-right">{formatCurrency(Number(item.amount), invoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <InvoiceTotals 
                subtotal={Number(invoice.subtotal)}
                taxRate={Number(invoice.taxRate)}
                taxAmount={Number(invoice.taxAmount)}
                total={Number(invoice.total)}
                currency={invoice.currency}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold">{invoice.client.name}</p>
                <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
              </div>
              <div className="pt-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Due Date</p>
                <p className="text-sm flex items-center gap-2 mt-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(invoice.dueDate)}
                </p>
              </div>
              <div className="pt-2">
                <Button variant="ghost" size="sm" className="p-0 text-brand-primary h-auto" asChild>
                  <Link href={`/portal/${invoice.portalToken}`} target="_blank">
                    <ExternalLink className="mr-2 h-3.5 w-3.5" /> View Portal
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Payment</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Balance Due</span>
                <span className="text-lg font-bold text-red-600">{formatCurrency(invoice.balance, invoice.currency)}</span>
              </div>
              {invoice.balance > 0 && (
                <PaymentRecordDialog 
                  invoiceId={invoice.id} 
                  maxAmount={invoice.balance} 
                  currency={invoice.currency} 
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoice.payments.map((payment: any) => (
              <div key={payment.id} className="flex items-center justify-between text-sm border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="font-medium">{payment.method.replace('_', ' ')}</p>
                  <p className="text-muted-foreground text-xs">{formatDate(payment.paidAt)}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold">{formatCurrency(Number(payment.amount), invoice.currency)}</p>
                  <p className={`text-xs uppercase font-semibold ${payment.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {payment.status}
                  </p>
                </div>
              </div>
            ))}
            {invoice.payments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No payments recorded yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
