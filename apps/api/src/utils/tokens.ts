import jwt, { type SignOptions } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { createHash } from 'crypto'

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

/**
 * Refresh tokens are stored hashed (like passwords) so a database leak
 * doesn't hand out usable sessions directly. Hashing is deterministic
 * (sha256, not bcrypt) so the presented token can still be looked up by
 * its hash — a refresh token is already high-entropy random data, so a
 * fast deterministic hash is safe here and lets us keep the unique index.
 */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
