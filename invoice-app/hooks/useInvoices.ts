"use client"

import { useState, useEffect } from "react"
import { Invoice } from "@/types"
import { toast } from "sonner"

export function useInvoices(status?: string) {
  const [data, setData] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoices = async () => {
    setIsLoading(true)
    try {
      const url = status ? `/api/v1/invoices?status=${status}` : "/api/v1/invoices"
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch invoices")
      const json = await res.json()
      setData(json.data)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [status])

  return { data, isLoading, error, refresh: fetchInvoices }
}
