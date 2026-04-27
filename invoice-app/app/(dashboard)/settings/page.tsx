import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SettingsForm } from "@/components/settings/SettingsForm"
import { Button } from "@/components/ui/button"

export default async function SettingsPage() {
  const session = await auth()
  const userId = session?.user?.id as string

  const settings = await prisma.userSettings.findUnique({
    where: { userId }
  })

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings" 
        description="Configure your company profile and invoice preferences"
      />

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>
              This information will appear on your generated invoices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm initialData={settings as any} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription & Billing</CardTitle>
            <CardDescription>
              Manage your InvoiceFlow plan and billing details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
              <div>
                <p className="font-bold">Free Plan</p>
                <p className="text-sm text-muted-foreground">Up to 5 invoices per month</p>
              </div>
              <Button variant="outline" size="sm">Upgrade</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
