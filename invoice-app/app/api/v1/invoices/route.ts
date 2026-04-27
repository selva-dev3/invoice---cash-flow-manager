import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { InvoiceStatus } from "@prisma/client"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const clientId = searchParams.get("clientId")
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
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

    return NextResponse.json(formattedInvoices)
  } catch (error) {
    console.error("Invoices fetch error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
