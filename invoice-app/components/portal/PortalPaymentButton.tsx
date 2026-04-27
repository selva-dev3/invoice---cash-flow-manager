"use client"

import { useState } from "react"
import { CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface PortalPaymentButtonProps {
  portalToken: string
}

export function PortalPaymentButton({ portalToken }: PortalPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePay = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/portal/payments/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portalToken }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment session")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      toast.error("Unable to start payment. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      className="bg-brand-primary hover:bg-brand-primary/90 min-w-[120px]" 
      onClick={handlePay}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      Pay Now
    </Button>
  )
}
