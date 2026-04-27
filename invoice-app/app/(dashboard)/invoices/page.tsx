import { PageHeader } from "@/components/shared/PageHeader"
import { InvoiceTable } from "@/components/invoices/InvoiceTable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function InvoicesPage() {
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
      
      <InvoiceTable />
    </div>
  )
}
