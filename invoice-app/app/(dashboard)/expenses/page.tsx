import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Receipt, TrendingDown, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"

export default async function ExpensesPage() {
  const session = await auth()
  const userId = session?.user?.id as string

  const expenses = await prisma.expense.findMany({
    where: { userId },
    orderBy: { expenseDate: 'desc' },
  })

  const totalThisMonth = expenses
    .filter(e => e.expenseDate >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    .reduce((acc, e) => acc + Number(e.amount), 0)

  const topCategory = Object.entries(
    expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
      return acc
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Expenses" 
        description="Track your business spending and categorize your outflows"
        action={
          <Button className="bg-brand-primary hover:bg-brand-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Record Expense
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total (This Month)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalThisMonth)}</div>
            <p className="text-xs text-muted-foreground mt-1">Month-to-date spending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{topCategory ? topCategory[0] : 'None'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {topCategory ? `${formatCurrency(topCategory[1])} spent` : 'No expenses recorded'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total expenses tracked</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">{expense.description}</TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(Number(expense.amount), expense.currency)}
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No expenses found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
