import jwt, { type SignOptions } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

export interface AccessTokenPayload {
  userId: string
  storeId: string
  role: 'OWNER' | 'STAFF'
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN ?? '15m') as SignOptions['expiresIn'],
  }
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, options)
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as AccessTokenPayload
}

export function generateRefreshToken(): string {
  return uuidv4()
}
