import { Request, Response } from 'express'
import { z } from 'zod'
import * as authService from './auth.service.js'

const registerSchema = z.object({
  storeName: z.string().min(2),
  storeSlug: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only'),
  ownerName: z.string().min(2),
  phone: z.string().min(9).max(15),
  password: z.string().min(8),
})

const loginSchema = z.object({
  phone: z.string(),
  password: z.string(),
  storeSlug: z.string(),
})

const refreshSchema = z.object({
  refreshToken: z.string(),
})

const logoutSchema = z.object({
  refreshToken: z.string(),
})

function mapServiceError(err: unknown): { status: number; error: string } {
  if (err instanceof Error) {
    switch (err.message) {
      case 'SLUG_TAKEN':
        return { status: 409, error: 'Store slug already taken' }
      case 'STORE_NOT_FOUND':
        return { status: 404, error: 'Store not found' }
      case 'INVALID_CREDENTIALS':
        return { status: 401, error: 'Invalid credentials' }
      case 'ACCOUNT_DISABLED':
        return { status: 403, error: 'Account is disabled' }
      case 'INVALID_REFRESH_TOKEN':
        return { status: 401, error: 'Invalid refresh token' }
      case 'REFRESH_TOKEN_EXPIRED':
        return { status: 401, error: 'Refresh token expired' }
    }
  }
  return { status: 500, error: 'Internal server error' }
}

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation error', details: parsed.error.errors })
    return
  }
  try {
    const result = await authService.register(parsed.data)
    res.status(201).json(result)
  } catch (err) {
    if (err instanceof Error && err.message !== 'SLUG_TAKEN') {
      console.error('[register]', err)
    }
    const { status, error } = mapServiceError(err)
    res.status(status).json({ error })
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation error', details: parsed.error.errors })
    return
  }
  try {
    const result = await authService.login(parsed.data)
    res.status(200).json(result)
  } catch (err) {
    const { status, error } = mapServiceError(err)
    if (status === 500) console.error('[login]', err)
    res.status(status).json({ error })
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const parsed = refreshSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation error', details: parsed.error.errors })
    return
  }
  try {
    const result = await authService.refresh(parsed.data.refreshToken)
    res.status(200).json(result)
  } catch (err) {
    const { status, error } = mapServiceError(err)
    if (status === 500) console.error('[refresh]', err)
    res.status(status).json({ error })
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const parsed = logoutSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation error', details: parsed.error.errors })
    return
  }
  try {
    await authService.logout(parsed.data.refreshToken)
    res.status(200).json({ message: 'Logged out' })
  } catch (err) {
    const { status, error } = mapServiceError(err)
    if (status === 500) console.error('[logout]', err)
    res.status(status).json({ error })
  }
}
