import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'thanhvoitbacore@gmail.com' } })
  if (!user || !user.passwordHash) return console.log("NO HASH")
  
  console.log("HASH:", user.passwordHash)
  
  // Try comparing with common passwords just to see if we throw an error
  try {
    const valid = await bcrypt.compare("12345678", user.passwordHash);
    console.log("Is 12345678 valid?", valid)
  } catch(e) {
    console.log("BCRYPT COMPARE ERROR:", e)
  }
}main()
