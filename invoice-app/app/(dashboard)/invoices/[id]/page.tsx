import { InvoiceDetailContent } from "@/components/invoices/InvoiceDetailContent"

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  return <InvoiceDetailContent invoiceId={params.id} />
}
