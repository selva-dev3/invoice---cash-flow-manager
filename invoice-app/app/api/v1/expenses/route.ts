import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const expenseSchema = z.object({
  category: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().min(0.01),
  currency: z.string().default("USD"),
  expenseDate: z.string().pipe(z.coerce.date()),
  receiptUrl: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  try {
    const expenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id,
        category: category || undefined,
        expenseDate: from || to ? {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        } : undefined,
      },
      orderBy: { expenseDate: 'desc' },
    })

    const categoryTotals = expenses.reduce((acc, exp) => {
      const amt = Number(exp.amount)
      acc[exp.category] = (acc[exp.category] || 0) + amt
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      data: expenses,
      summary: {
        total: expenses.reduce((acc, exp) => acc + Number(exp.amount), 0),
        byCategory: categoryTotals
      }
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
    const data = expenseSchema.parse(body)

    const expense = await prisma.expense.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
