"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { CreditCard, Loader2, CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { PaymentMethod } from "@prisma/client"

const paymentSchema = z.object({
  amount: z.number().min(0.01),
  method: z.nativeEnum(PaymentMethod),
  paidAt: z.date(),
  notes: z.string().optional(),
})

interface PaymentRecordDialogProps {
  invoiceId: string
  maxAmount: number
  currency: string
}

export function PaymentRecordDialog({ invoiceId, maxAmount, currency }: PaymentRecordDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: maxAmount,
      method: PaymentMethod.BANK_TRANSFER,
      paidAt: new Date(),
      notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof paymentSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/v1/payments/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          ...values,
        }),
      })

      if (response.ok) {
        toast.success("Payment recorded successfully")
        setOpen(false)
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to record payment")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-green-600 hover:bg-green-700">
          <CreditCard className="mr-2 h-4 w-4" /> Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Manually record a payment received from your client.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount Received ({currency})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      max={maxAmount}
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
                      <SelectItem value={PaymentMethod.STRIPE}>Stripe</SelectItem>
                      <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                      <SelectItem value={PaymentMethod.CHEQUE}>Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paidAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Payment Date</FormLabel>
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
            <Button className="w-full bg-green-600 hover:bg-green-700" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Payment
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
