import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import axios from "axios"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id, userId: session.user.id }
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"
    
    const response = await axios.get(`${FASTAPI_URL}/api/pdf/invoice/${params.id}/`, {
      responseType: 'arraybuffer',
      headers: {
        'Authorization': `Bearer ${session.user.id}` // Passing userId as a simple mock for shared auth
      }
    })

    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`)

    return new NextResponse(response.data, {
      status: 200,
      headers
    })
  } catch (error) {
    console.error("PDF generation proxy error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
