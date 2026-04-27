import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/PageHeader"
import { InvoiceTable } from "@/components/invoices/InvoiceTable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { InvoiceStatus } from "@prisma/client"

export default async function InvoicesPage({
  searchParams
}: {
  searchParams: { status?: string, clientId?: string, from?: string, to?: string }
}) {
  const session = await auth()
  const userId = session?.user?.id as string

  const { status, clientId, from, to } = searchParams

  const invoices = await prisma.invoice.findMany({
    where: {
      userId,
      status: status ? (status.toUpperCase() as InvoiceStatus) : undefined,
      clientId: clientId || undefined,
      issueDate: from || to ? {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      } : undefined,
    },
    include: {
      client: { select: { name: true } },
      payments: { select: { amount: true, status: true } }
    },
    orderBy: { createdAt: 'desc' },
  })

  const formattedInvoices = invoices.map(invoice => {
    const totalPaid = invoice.payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((acc, p) => acc + Number(p.amount), 0)
    
    return {
      ...invoice,
      clientName: invoice.client.name,
      totalPaid,
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Invoices" 
        description="Create and manage invoices for your clients"
        action={
          <Button asChild className="bg-brand-primary hover:bg-brand-primary/90">
            <Link href="/invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        }
      />
      
      {/* InvoiceFilters component could be added here */}

      <InvoiceTable data={formattedInvoices as any} />
    </div>
  )
}
