"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, CalendarIcon, Plus, Trash } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn, calculateInvoiceTotals, formatCurrency } from "@/lib/utils"
import { Invoice, Client } from "@/types"
import { InvoiceTotals } from "./InvoiceTotals"

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  currency: z.string().min(1),
  issueDate: z.date(),
  dueDate: z.date(),
  taxRate: z.number().min(0).max(100),
  notes: z.string().optional(),
  items: z.array(z.object({
    id: z.string().optional(),
    description: z.string().min(1, "Description required"),
    quantity: z.number().min(0.01, "Qty > 0"),
    unitPrice: z.number().min(0, "Price >= 0"),
  })).min(1, "At least one item required"),
})

interface InvoiceFormProps {
  mode: "create" | "edit"
  initialData?: Invoice
}

export function InvoiceForm({ mode, initialData }: InvoiceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const router = useRouter()

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: initialData?.clientId || "",
      currency: initialData?.currency || "USD",
      issueDate: initialData?.issueDate ? new Date(initialData.issueDate) : new Date(),
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      taxRate: initialData?.taxRate ? Number(initialData.taxRate) : 0,
      notes: initialData?.notes || "",
      items: initialData?.items ? initialData.items.map(i => ({
        id: i.id,
        description: i.description,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })) : [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  // Watch fields for live totals calculation
  const watchedItems = form.watch("items")
  const watchedTaxRate = form.watch("taxRate")
  const { subtotal, taxAmount, total } = calculateInvoiceTotals(watchedItems, watchedTaxRate)

  useEffect(() => {
    async function fetchClients() {
      const res = await fetch("/api/v1/clients")
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    }
    fetchClients()
  }, [])

  async function onSubmit(values: z.infer<typeof invoiceSchema>) {
    setIsLoading(true)
    try {
      const url = mode === "create" ? "/api/v1/invoices" : `/api/v1/invoices/${initialData?.id}`
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Invoice ${mode === "create" ? "created" : "updated"} successfully`)
        router.push(`/invoices/${data.id}`)
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Something went wrong")
      }
    } catch (error) {
      toast.error("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Issue Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="taxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Rate (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">Line Items</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-24">
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="Qty" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-32">
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="Price" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-32 pt-2 text-right font-medium">
                  {formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0), form.getValues("currency"))}
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Special instructions or thank you note..." 
                    className="resize-none h-32"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="bg-slate-50 p-6 rounded-lg border">
            <InvoiceTotals 
              subtotal={subtotal}
              taxRate={watchedTaxRate}
              taxAmount={taxAmount}
              total={total}
              currency={form.getValues("currency")}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            className="bg-brand-primary hover:bg-brand-primary/90 min-w-[120px]" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Invoice" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
