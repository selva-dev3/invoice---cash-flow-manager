import { PageHeader } from "@/components/shared/PageHeader"
import { ClientsTable } from "@/components/clients/ClientsTable"
import { ClientFormDialog } from "@/components/clients/ClientFormDialog"

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Clients" 
        description="Manage your client directory and their billing history"
        action={<ClientFormDialog mode="create" />}
      />
      <ClientsTable />
    </div>
  )
}
