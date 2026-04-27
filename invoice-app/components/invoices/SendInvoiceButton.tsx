"use client"

import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSendInvoice } from "@/hooks/use-api"

interface SendInvoiceButtonProps {
  invoiceId: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showText?: boolean
}

export function SendInvoiceButton({ 
  invoiceId, 
  variant = "default", 
  size = "sm",
  className,
  showText = true
}: SendInvoiceButtonProps) {
  const { mutate: handleSend, isPending } = useSendInvoice()

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={() => handleSend(invoiceId)} 
      disabled={isPending}
      className={className}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      {showText && (isPending ? "Sending..." : "Send")}
    </Button>
  )
}
