import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { InvoiceStatus } from "@prisma/client"

const invoiceSchema = z.object({
  clientId: z.string(),
  currency: z.string(),
  issueDate: z.string().pipe(z.coerce.date()),
  dueDate: z.string().pipe(z.coerce.date()),
  taxRate: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
  })).min(1),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") as InvoiceStatus | null
  const clientId = searchParams.get("clientId")
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const skip = (page - 1) * limit

  try {
    const where = {
      userId: session.user.id,
      status: status || undefined,
      clientId: clientId || undefined,
      issueDate: from || to ? {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      } : undefined,
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: { 
          client: { select: { name: true } },
          payments: { select: { amount: true, status: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ])

    const data = invoices.map(invoice => {
      const totalPaid = invoice.payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((acc, p) => acc + Number(p.amount), 0)
      
      return {
        ...invoice,
        clientName: invoice.client.name,
        totalPaid,
      }
    })

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validatedData = invoiceSchema.parse(body)

    // Calculate totals
    const subtotal = validatedData.items.reduce((acc, item) => 
      acc + (item.quantity * item.unitPrice), 0
    )
    const taxAmount = subtotal * (validatedData.taxRate / 100)
    const total = subtotal + taxAmount

    // Get and increment invoice number in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const settings = await tx.userSettings.findUnique({
        where: { userId: session.user.id }
      })

      if (!settings) {
        throw new Error("User settings not found")
      }

      const invoiceNumber = `${settings.invoicePrefix}${settings.nextNumber.toString().padStart(4, '0')}`

      const invoice = await tx.invoice.create({
        data: {
          userId: session.user.id,
          clientId: validatedData.clientId,
          invoiceNumber,
          status: InvoiceStatus.DRAFT,
          subtotal,
          taxRate: validatedData.taxRate,
          taxAmount,
          total,
          currency: validatedData.currency,
          issueDate: validatedData.issueDate,
          dueDate: validatedData.dueDate,
          notes: validatedData.notes,
          items: {
            create: validatedData.items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.quantity * item.unitPrice,
            }))
          }
        }
      })

      await tx.userSettings.update({
        where: { userId: session.user.id },
        data: { nextNumber: { increment: 1 } }
      })

      return invoice
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Invoice creation error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
