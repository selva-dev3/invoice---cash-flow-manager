import * as z from "zod"

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Price cannot be negative"),
})

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  currency: z.string().min(1, "Currency is required"),
  issueDate: z.date({
    required_error: "Issue date is required",
  }),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  taxRate: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
})

export type InvoiceFormValues = z.infer<typeof invoiceSchema>
