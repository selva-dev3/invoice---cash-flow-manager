import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Testing DB connection...')
  try {
    const email = 'debug_' + Date.now() + '@example.com'
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    console.log('Creating user...')
    const user = await prisma.user.create({
      data: {
        name: 'Debug User',
        email: email,
        passwordHash: hashedPassword,
        settings: {
          create: {
            nextNumber: 1,
            paymentTerms: 'Net 30',
            invoicePrefix: 'INV-',
          },
        },
      },
    })
    console.log('User created successfully:', user.id)
  } catch (error) {
    console.error('Error during DB test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
