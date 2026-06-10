import { Response, NextFunction } from 'express'
import { AuthRequest } from './authenticate.js'

export function requireOwner(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'OWNER') {
    res.status(403).json({ error: 'Owner access required' })
    return
  }
  next()
}
