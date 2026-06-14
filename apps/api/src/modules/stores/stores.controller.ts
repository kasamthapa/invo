import { Request, Response } from 'express'
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
