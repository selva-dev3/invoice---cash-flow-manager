import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { InvoiceStatus } from "@prisma/client"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const originalInvoice = await prisma.invoice.findUnique({
      where: { id: params.id, userId },
      include: { items: true }
    })

    if (!originalInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const newInvoice = await prisma.$transaction(async (tx) => {
      const settings = await tx.userSettings.findUnique({
        where: { userId }
      })

      if (!settings) throw new Error("Settings not found")

      const invoiceNumber = `${settings.invoicePrefix}${settings.nextNumber.toString().padStart(4, '0')}`

      const duplicated = await tx.invoice.create({
        data: {
          userId,
          clientId: originalInvoice.clientId,
          invoiceNumber,
          status: InvoiceStatus.DRAFT,
          subtotal: originalInvoice.subtotal,
          taxRate: originalInvoice.taxRate,
          taxAmount: originalInvoice.taxAmount,
          total: originalInvoice.total,
          currency: originalInvoice.currency,
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to +30 days
          notes: originalInvoice.notes,
          items: {
            create: originalInvoice.items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount,
            }))
          }
        }
      })

      await tx.userSettings.update({
        where: { userId },
        data: { nextNumber: { increment: 1 } }
      })

      return duplicated
    })

    return NextResponse.json(newInvoice, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
