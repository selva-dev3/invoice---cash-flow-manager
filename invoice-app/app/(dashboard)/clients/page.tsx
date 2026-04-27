import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/PageHeader"
import { ClientsTable } from "@/components/clients/ClientsTable"
import { ClientFormDialog } from "@/components/clients/ClientFormDialog"

export default async function ClientsPage() {
  const session = await auth()
  const userId = session?.user?.id as string

  const clients = await prisma.client.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { invoices: true }
      }
    }
  })

  // Format clients for the table
  const formattedClients = clients.map(client => ({
    ...client,
    totalInvoices: client._count.invoices,
  }))

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Clients" 
        description="Manage your client directory and their billing history"
        action={<ClientFormDialog mode="create" />}
      />
      <ClientsTable data={formattedClients} />
    </div>
  )
}
