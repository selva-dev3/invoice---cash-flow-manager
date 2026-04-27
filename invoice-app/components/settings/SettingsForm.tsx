"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const settingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  paymentTerms: z.string().optional(),
  invoicePrefix: z.string().min(1, "Prefix is required").max(5),
  nextNumber: z.number().int().min(1),
})

interface SettingsFormProps {
  initialData: z.infer<typeof settingsSchema> | null
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData || {
      companyName: "",
      taxNumber: "",
      address: "",
      paymentTerms: "Due on receipt",
      invoicePrefix: "INV-",
      nextNumber: 1,
    },
  })

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast.success("Settings updated successfully")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update settings")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="taxNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax ID / VAT Number</FormLabel>
                <FormControl>
                  <Input placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="invoicePrefix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Prefix</FormLabel>
                <FormControl>
                  <Input placeholder="INV-" {...field} />
                </FormControl>
                <FormDescription>e.g. INV-</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Address</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="123 Business St&#10;City, Country" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentTerms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Payment Terms</FormLabel>
              <FormControl>
                <Input placeholder="Net 30, Due on receipt, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next Invoice Number</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value) || 1)} 
                />
              </FormControl>
              <FormDescription>The number for your next created invoice</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full bg-brand-primary hover:bg-brand-primary/90" type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </form>
    </Form>
  )
}
