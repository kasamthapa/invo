import { Request, Response } from 'express'
import { z } from 'zod'
import type { AuthRequest } from '../../middleware/authenticate.js'
import * as storesService from './stores.service.js'

export async function getPublicCatalog(req: Request, res: Response): Promise<void> {
  try {
    const catalog = await storesService.getPublicCatalog(req.params['slug']!)
    res.json(catalog)
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'Store not found' })
      return
    }
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(2).max(200).optional(),
})

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updateProfileSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation error', details: parsed.error.errors })
    return
  }
  try {
    const store = await storesService.updateStoreProfile(req.user!.storeId, parsed.data)
    res.json(store)
  } catch (err) {
    console.error('[updateProfile]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
