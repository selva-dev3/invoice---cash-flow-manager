import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { InvoiceStatus } from "@prisma/client"

const updateInvoiceSchema = z.object({
  clientId: z.string().optional(),
  currency: z.string().optional(),
  issueDate: z.string().pipe(z.coerce.date()).optional(),
  dueDate: z.string().pipe(z.coerce.date()).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    id: z.string().optional(),
    description: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
  })).optional(),
})

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        client: true,
        items: true,
        payments: {
          orderBy: { paidAt: 'desc' },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

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
    const validatedData = updateInvoiceSchema.parse(body)

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: params.id, userId: session.user.id },
      include: { items: true }
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    if (existingInvoice.status !== InvoiceStatus.DRAFT) {
      return NextResponse.json({ error: "Only draft invoices can be edited" }, { status: 400 })
    }

    // Recalculate totals if items or tax rate changed
    let subtotal = Number(existingInvoice.subtotal)
    let taxRate = Number(existingInvoice.taxRate)
    
    if (validatedData.taxRate !== undefined) taxRate = validatedData.taxRate
    
    const result = await prisma.$transaction(async (tx) => {
      // Handle item updates
      if (validatedData.items) {
        // Delete items not in the new list (if they have IDs)
        const newItemIds = validatedData.items.map(item => item.id).filter(Boolean)
        await tx.invoiceItem.deleteMany({
          where: {
            invoiceId: params.id,
            id: { notIn: newItemIds as string[] }
          }
        })

        // Upsert items
        for (const item of validatedData.items) {
          if (item.id) {
            await tx.invoiceItem.update({
              where: { id: item.id },
              data: {
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.quantity * item.unitPrice,
              }
            })
          } else {
            await tx.invoiceItem.create({
              data: {
                invoiceId: params.id,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.quantity * item.unitPrice,
              }
            })
          }
        }

        // Get new subtotal
        const items = await tx.invoiceItem.findMany({ where: { invoiceId: params.id } })
        subtotal = items.reduce((acc, item) => acc + Number(item.amount), 0)
      }

      const taxAmount = subtotal * (taxRate / 100)
      const total = subtotal + taxAmount

      return tx.invoice.update({
        where: { id: params.id },
        data: {
          clientId: validatedData.clientId,
          currency: validatedData.currency,
          issueDate: validatedData.issueDate,
          dueDate: validatedData.dueDate,
          taxRate,
          subtotal,
          taxAmount,
          total,
          notes: validatedData.notes,
        },
        include: { items: true }
      })
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id, userId: session.user.id }
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      return NextResponse.json({ error: "Only draft invoices can be deleted" }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.invoiceItem.deleteMany({ where: { invoiceId: params.id } }),
      prisma.invoice.delete({ where: { id: params.id } })
    ])

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
