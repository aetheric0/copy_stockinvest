import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET as string

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

interface TokenPayload {
  userId: string
  email: string
}

export function generateResetToken(payload: TokenPayload): string {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "4h" })
  } catch (error) {
    console.error("could not generate token", error)
    throw new Error("Failed to generate token")
  }
  
}

export function verifyResetToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    throw new Error("Invalid or expired token")
  }
}
