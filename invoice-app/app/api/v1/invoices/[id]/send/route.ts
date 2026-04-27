import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import axios from "axios"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"
    
    const response = await axios.post(`${FASTAPI_URL}/api/accounts/invoices/${params.id}/send/`)

    if (response.status !== 200) {
      return NextResponse.json({ 
        error: "Failed to send email via backend", 
        details: response.data 
      }, { status: 500 })
    }

    return NextResponse.json({ message: "Invoice sent successfully" })
  } catch (error: any) {
    console.error("Send proxy error:", error.response?.data || error.message)
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.response?.data || error.message 
    }, { status: 500 })
  }
}
