import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { InvoiceStatus, PaymentStatus, PaymentMethod } from "@prisma/client"
import { z } from "zod"

const recordSchema = z.object({
  invoiceId: z.string(),
  amount: z.number().min(0.01),
  method: z.nativeEnum(PaymentMethod),
  paidAt: z.string().pipe(z.coerce.date()),
  notes: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = recordSchema.parse(body)

    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId, userId: session.user.id },
      include: { payments: true }
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const totalPaid = invoice.payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((acc, p) => acc + Number(p.amount), 0)
    
    const balance = Number(invoice.total) - totalPaid

    if (data.amount > balance + 0.01) { // 0.01 for rounding issues
      return NextResponse.json({ error: "Amount exceeds remaining balance" }, { status: 400 })
    }

    const updatedInvoice = await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          invoiceId: data.invoiceId,
          amount: data.amount,
          method: data.method,
          status: PaymentStatus.COMPLETED,
          paidAt: data.paidAt,
        }
      })

      const newTotalPaid = totalPaid + data.amount
      let newStatus = invoice.status

      if (newTotalPaid >= Number(invoice.total) - 0.01) {
        newStatus = InvoiceStatus.PAID
      } else if (newTotalPaid > 0) {
        newStatus = InvoiceStatus.PARTIALLY_PAID
      }

      return tx.invoice.update({
        where: { id: data.invoiceId },
        data: { status: newStatus }
      })
    })

    return NextResponse.json(updatedInvoice, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
