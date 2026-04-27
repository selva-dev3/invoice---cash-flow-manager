"use client"

import { PageHeader } from "@/components/shared/PageHeader"
import { InvoiceForm } from "@/components/invoices/InvoiceForm"
import { Card, CardContent } from "@/components/ui/card"

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="New Invoice" 
        description="Create a new draft invoice"
      />
      
      <Card className="border-none shadow-md">
        <CardContent className="pt-6">
          <InvoiceForm mode="create" />
        </CardContent>
      </Card>
    </div>
  )
}
