import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const invoiceId = searchParams.get("invoiceId")

  try {
    const payments = await prisma.payment.findMany({
      where: {
        invoice: {
          userId: session.user.id,
          id: invoiceId || undefined,
        }
      },
      include: {
        invoice: {
          select: {
            invoiceNumber: true,
            currency: true,
            client: { select: { name: true } }
          }
        }
      },
      orderBy: { paidAt: 'desc' },
    })

    return NextResponse.json(payments)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
