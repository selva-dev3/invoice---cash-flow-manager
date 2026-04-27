import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import axios from "axios"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const year = searchParams.get("year") || new Date().getFullYear().toString()

  try {
    const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"
    const response = await axios.get(`${FASTAPI_URL}/api/reports/tax-summary/`, {
      params: {
        userId: session.user.id,
        year: year
      }
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("Tax summary error:", error)
    return NextResponse.json({ error: "Failed to fetch tax summary" }, { status: 500 })
  }
}
