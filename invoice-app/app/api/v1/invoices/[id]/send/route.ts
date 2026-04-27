import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { InvoiceStatus } from "@prisma/client"
import { Resend } from "resend"
import { generatePortalUrl } from "@/lib/utils"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id, userId: session.user.id },
      include: { 
        client: true,
        user: { include: { settings: true } }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const portalUrl = generatePortalUrl(invoice.portalToken)

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `${invoice.user.settings?.companyName || 'InvoiceFlow'} <invoices@resend.dev>`,
      to: [invoice.client.email],
      subject: `Invoice ${invoice.invoiceNumber} from ${invoice.user.settings?.companyName || invoice.user.name}`,
      html: `
        <h1>Invoice ${invoice.invoiceNumber}</h1>
        <p>Hello ${invoice.client.name},</p>
        <p>${invoice.user.settings?.companyName || 'We'} have sent you a new invoice for ${invoice.currency} ${invoice.total}.</p>
        <p>You can view and pay your invoice at the following link:</p>
        <a href="${portalUrl}" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View & Pay Invoice</a>
        <br/><br/>
        <p>Due date: ${invoice.dueDate.toLocaleDateString()}</p>
        <p>Thank you!</p>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    // Update status to SENT if it was DRAFT
    if (invoice.status === InvoiceStatus.DRAFT) {
      await prisma.invoice.update({
        where: { id: params.id },
        data: { status: InvoiceStatus.SENT }
      })
    }

    return NextResponse.json({ message: "Invoice sent successfully", emailId: data?.id })
  } catch (error) {
    console.error("Send error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
