import * as z from "zod"

export const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().min(3, "Currency must be 3 characters (e.g. USD)").default("USD"),
})

export type ClientFormValues = z.infer<typeof clientSchema>
