import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { InvoiceStatus } from "@prisma/client"
import { getForecast } from "@/lib/fastapi"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const [
      outstandingInvoices,
      paidThisMonth,
      overdueCount,
      totalClients,
      recentInvoices,
      forecast
    ] = await Promise.all([
      // 1. Total outstanding
      prisma.invoice.aggregate({
        where: {
          userId,
          status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] }
        },
        _sum: { total: true }
      }),
      // 2. Paid this month
      prisma.payment.aggregate({
        where: {
          invoice: { userId },
          status: 'COMPLETED',
          paidAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { amount: true }
      }),
      // 3. Overdue count
      prisma.invoice.count({
        where: { userId, status: InvoiceStatus.OVERDUE }
      }),
      // 4. Total clients
      prisma.client.count({
        where: { userId }
      }),
      // 5. Recent invoices
      prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { client: true }
      }),
      // 6. Forecast from FastAPI
      getForecast(30).catch(() => null)
    ])

    return NextResponse.json({
      stats: {
        totalOutstanding: Number(outstandingInvoices._sum.total || 0),
        totalPaidMonth: Number(paidThisMonth._sum.amount || 0),
        overdueCount,
        totalClients
      },
      recentInvoices,
      forecast
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
