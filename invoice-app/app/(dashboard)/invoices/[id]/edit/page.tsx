import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { InvoiceForm } from "@/components/invoices/InvoiceForm"
import { Card, CardContent } from "@/components/ui/card"
import { InvoiceStatus } from "@prisma/client"

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const session = await auth()
  const userId = session?.user?.id as string

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id, userId },
    include: { items: true }
  })

  if (!invoice) {
    notFound()
  }

  if (invoice.status !== InvoiceStatus.DRAFT) {
    redirect(`/invoices/${invoice.id}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Edit Invoice ${invoice.invoiceNumber}`} 
        description="Update your draft invoice details"
      />
      
      <Card className="border-none shadow-md">
        <CardContent className="pt-6">
          <InvoiceForm mode="edit" initialData={invoice as any} />
        </CardContent>
      </Card>
    </div>
  )
}
