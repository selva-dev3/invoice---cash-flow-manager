import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ExpensesContent } from "@/components/expenses/ExpensesContent"

export default function ExpensesPage() {
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

      <ExpensesContent />
    </div>
  )
}
