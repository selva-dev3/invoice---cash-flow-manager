import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const settingsSchema = z.object({
  companyName: z.string().min(1).optional(),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  paymentTerms: z.string().optional(),
  invoicePrefix: z.string().optional(),
  nextNumber: z.number().int().min(1).optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    })
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = settingsSchema.parse(body)

    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: data,
      create: {
        ...data,
        userId: session.user.id,
      } as any
    })

    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
