import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/tokens.js'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    storeId: string
    role: 'OWNER' | 'STAFF'
  }
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' })
    return
  }
  const token = authHeader.split(' ')[1]
  try {
    const payload = verifyAccessToken(token)
    req.user = {
      userId: payload.userId,
      storeId: payload.storeId,
      role: payload.role,
    }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired access token' })
  }
}
