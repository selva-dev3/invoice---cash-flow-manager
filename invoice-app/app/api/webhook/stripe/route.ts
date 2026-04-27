import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { InvoiceStatus, PaymentMethod, PaymentStatus } from "@prisma/client"
import Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === "checkout.session.completed") {
    const invoiceId = session.metadata?.invoiceId

    if (!invoiceId) {
      return new NextResponse("Invoice ID not found in metadata", { status: 400 })
    }

    try {
      await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findUnique({
          where: { id: invoiceId },
          include: { payments: true }
        })

        if (!invoice) throw new Error("Invoice not found")

        const amountPaid = Number(session.amount_total) / 100 // Convert from cents

        // Create Payment record
        await tx.payment.create({
          data: {
            invoiceId,
            amount: amountPaid,
            method: PaymentMethod.STRIPE,
            status: PaymentStatus.COMPLETED,
            stripePaymentId: session.id,
            stripePaymentIntent: session.payment_intent as string,
            paidAt: new Date(),
          }
        })

        // Calculate new status
        const totalPaid = invoice.payments
          .filter(p => p.status === 'COMPLETED')
          .reduce((acc, p) => acc + Number(p.amount), 0) + amountPaid
        
        let newStatus = invoice.status
        if (totalPaid >= Number(invoice.total) - 0.01) {
          newStatus = InvoiceStatus.PAID
        } else if (totalPaid > 0) {
          newStatus = InvoiceStatus.PARTIALLY_PAID
        }

        await tx.invoice.update({
          where: { id: invoiceId },
          data: { status: newStatus }
        })
      })
    } catch (error) {
      console.error("Webhook processing error:", error)
      return new NextResponse("Internal Server Error", { status: 500 })
    }
  }

  return new NextResponse(null, { status: 200 })
}
