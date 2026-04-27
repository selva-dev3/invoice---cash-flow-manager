"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Copy, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface DuplicateButtonProps {
  invoiceId: string
}

export function DuplicateButton({ invoiceId }: DuplicateButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDuplicate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/v1/invoices/${invoiceId}/duplicate`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to duplicate invoice")
      }

      const newInvoice = await response.json()
      toast.success("Invoice duplicated successfully!")
      router.push(`/invoices/${newInvoice.id}/edit`)
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleDuplicate} 
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Copy className="mr-2 h-4 w-4" />
      )}
      Duplicate
    </Button>
  )
}
