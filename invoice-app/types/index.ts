import { Prisma, InvoiceStatus, UserRole, PaymentMethod, PaymentStatus, ReminderType } from '@prisma/client'

// Inferred Prisma Types
export type User = Prisma.UserGetPayload<{
  include: { settings: true }
}>

export type Invoice = Prisma.InvoiceGetPayload<{
  include: { 
    items: true, 
    client: true, 
    payments: true 
  }
}>

export type Client = Prisma.ClientGetPayload<{}>

export type Expense = Prisma.ExpenseGetPayload<{}>

export type Payment = Prisma.PaymentGetPayload<{}>

// Form Values
export type InvoiceFormValues = {
  clientId: string
  currency: string
  issueDate: Date
  dueDate: Date
  taxRate: number
  notes?: string
  items: {
    description: string
    quantity: number
    unitPrice: number
  }[]
}

export type ClientFormValues = {
  name: string
  email: string
  phone?: string
  address?: string
  currency: string
}

export type ExpenseFormValues = {
  category: string
  description: string
  amount: number
  currency: string
  expenseDate: Date
  receiptUrl?: string
}

// Analytics & Forecasting
export type ForecastPoint = {
  ds: string
  yhat: number
  yhat_lower: number
  yhat_upper: number
}

export type ForecastData = {
  forecast: ForecastPoint[]
  summary: {
    current_total: number
    projected_30d: number
    projected_90d: number
  }
}

export type DashboardStats = {
  totalOutstanding: number
  totalPaidMonth: number
  overdueCount: number
  totalClients: number
}

// Re-export Enums for convenience
export { InvoiceStatus, UserRole, PaymentMethod, PaymentStatus, ReminderType }
