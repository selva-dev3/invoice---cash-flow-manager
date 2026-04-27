import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"
import { InvoiceStatus } from "@prisma/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "dd MMM yyyy")
}

export function formatRelativeDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatDateShort(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "MMM dd")
}

export function getInvoiceStatusColor(status: InvoiceStatus) {
  switch (status) {
    case InvoiceStatus.DRAFT:
      return "bg-slate-100 text-slate-700 border-slate-200"
    case InvoiceStatus.SENT:
      return "bg-blue-100 text-blue-700 border-blue-200"
    case InvoiceStatus.PAID:
      return "bg-green-100 text-green-700 border-green-200"
    case InvoiceStatus.PARTIALLY_PAID:
      return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case InvoiceStatus.OVERDUE:
      return "bg-red-100 text-red-700 border-red-200"
    case InvoiceStatus.CANCELLED:
      return "bg-gray-100 text-gray-700 border-gray-200"
    default:
      return "bg-slate-100 text-slate-700 border-slate-200"
  }
}

export function getInvoiceStatusLabel(status: InvoiceStatus) {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export function generatePortalUrl(token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  return `${baseUrl}/portal/${token}`
}

export function calculateInvoiceTotals(
  items: { quantity: number; unitPrice: number }[],
  taxRate: number = 0
) {
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  return {
    subtotal: Number(subtotal.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
  }
}

export function getCurrencySymbol(currency: string) {
  switch (currency) {
    case "USD":
      return "$"
    case "EUR":
      return "€"
    case "GBP":
      return "£"
    case "INR":
      return "₹"
    case "AED":
      return "د.إ"
    default:
      return "$"
  }
}
