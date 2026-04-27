import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { generatePortalUrl } from "@/lib/utils"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { invoiceId } = await req.json()

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId, userId: session.user.id },
      include: { 
        client: true,
        payments: true
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const totalPaid = invoice.payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((acc, p) => acc + Number(p.amount), 0)
    
    const balance = Number(invoice.total) - totalPaid

    if (balance <= 0) {
      return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 })
    }

    const portalUrl = generatePortalUrl(invoice.portalToken)

    // Create Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: invoice.currency.toLowerCase(),
            product_data: {
              name: `Invoice ${invoice.invoiceNumber}`,
              description: `Payment for invoice ${invoice.invoiceNumber}`,
            },
            unit_amount: Math.round(balance * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${portalUrl}?success=true`,
      cancel_url: `${portalUrl}?cancelled=true`,
      metadata: {
        invoiceId: invoice.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.error("Stripe session creation error:", error)
    return NextResponse.json({ error: "Failed to create payment link" }, { status: 500 })
  }
}
