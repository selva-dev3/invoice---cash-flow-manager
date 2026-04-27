import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: session.user.id },
      orderBy: { expenseDate: 'desc' },
    })

    const totalThisMonth = expenses
      .filter(e => e.expenseDate >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
      .reduce((acc, e) => acc + Number(e.amount), 0)

    const categories = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
      return acc
    }, {} as Record<string, number>)

    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]

    return NextResponse.json({
      expenses,
      stats: {
        totalThisMonth,
        topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
        totalCount: expenses.length
      }
    })
  } catch (error) {
    console.error("Expenses fetch error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
