import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const clients = await prisma.client.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { invoices: true }
        }
      }
    })

    const formattedClients = clients.map(client => ({
      ...client,
      totalInvoices: client._count.invoices,
    }))

    return NextResponse.json(formattedClients)
  } catch (error) {
    console.error("Clients fetch error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
