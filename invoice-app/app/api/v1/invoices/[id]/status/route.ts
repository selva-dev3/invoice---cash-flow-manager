import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { InvoiceStatus, PaymentMethod, PaymentStatus } from "@prisma/client"
import { z } from "zod"

const statusSchema = z.object({
  status: z.nativeEnum(InvoiceStatus),
})

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { status: newStatus } = statusSchema.parse(body)

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id, userId: session.user.id },
      include: { payments: true }
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const currentStatus = invoice.status

    // Validate status transitions
    const allowedTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
      [InvoiceStatus.DRAFT]: [InvoiceStatus.SENT],
      [InvoiceStatus.SENT]: [InvoiceStatus.CANCELLED, InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE],
      [InvoiceStatus.PARTIALLY_PAID]: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED],
      [InvoiceStatus.PAID]: [InvoiceStatus.CANCELLED], // PAID to CANCELLED implies a refund or correction
      [InvoiceStatus.OVERDUE]: [InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.CANCELLED],
      [InvoiceStatus.CANCELLED]: [], // Terminal state
    }

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${currentStatus} to ${newStatus}` },
        { status: 400 }
      )
    }

    // Special logic for PAID/CANCELLED transitions
    const updatedInvoice = await prisma.$transaction(async (tx) => {
      // If moving to PAID, ensure we have a payment record if one doesn't exist
      if (newStatus === InvoiceStatus.PAID && currentStatus !== InvoiceStatus.PARTIALLY_PAID) {
        const totalPaid = invoice.payments
          .filter(p => p.status === 'COMPLETED')
          .reduce((acc, p) => acc + Number(p.amount), 0)
        
        const remaining = Number(invoice.total) - totalPaid
        
        if (remaining > 0) {
          await tx.payment.create({
            data: {
              invoiceId: params.id,
              amount: remaining,
              method: PaymentMethod.BANK_TRANSFER,
              status: PaymentStatus.COMPLETED,
              paidAt: new Date(),
            }
          })
        }
      }

      return tx.invoice.update({
        where: { id: params.id },
        data: { status: newStatus },
      })
    })

    return NextResponse.json(updatedInvoice)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
