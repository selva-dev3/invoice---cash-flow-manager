import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const expenseSchema = z.object({
  category: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  amount: z.number().min(0.01).optional(),
  currency: z.string().optional(),
  expenseDate: z.string().pipe(z.coerce.date()).optional(),
  receiptUrl: z.string().optional(),
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
    const data = expenseSchema.parse(body)

    const expense = await prisma.expense.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data,
    })

    return NextResponse.json(expense)
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
    await prisma.expense.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
