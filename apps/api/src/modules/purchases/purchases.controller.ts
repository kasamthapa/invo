import { Response } from 'express'
import { z } from 'zod'
import { AuthRequest } from '../../middleware/authenticate.js'
import * as purchasesService from './purchases.service.js'

const purchaseItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1),
  costPrice: z.number().int().positive(),
})

const createPurchaseSchema = z.object({
  supplierId: z.string().uuid().optional(),
  purchaseDate: z.string().datetime().optional(),
  items: z.array(purchaseItemSchema).min(1),
  note: z.string().optional(),
})

function mapError(err: unknown, res: Response): void {
  if (err instanceof z.ZodError) {
    res.status(400).json({ error: 'Validation error', details: err.errors })
    return
  }
  if (err instanceof Error) {
    switch (err.message) {
      case 'NO_ITEMS':
        res.status(400).json({ error: 'At least one item is required' })
        return
      case 'SUPPLIER_NOT_FOUND':
        res.status(404).json({ error: 'Supplier not found' })
        return
      case 'VARIANT_NOT_FOUND':
        res.status(404).json({ error: 'Variant not found' })
        return
      case 'NOT_FOUND':
        res.status(404).json({ error: 'Purchase not found' })
        return
    }
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}

export async function createPurchase(req: AuthRequest, res: Response): Promise<void> {
  try {
    const input = createPurchaseSchema.parse(req.body)
    const purchase = await purchasesService.createPurchase(
      req.user!.storeId,
      req.user!.userId,
      input,
    )
    res.status(201).json(purchase)
  } catch (err) {
    mapError(err, res)
  }
}

export async function listPurchases(req: AuthRequest, res: Response): Promise<void> {
  try {
    const purchases = await purchasesService.getPurchases(req.user!.storeId)
    res.json(purchases)
  } catch (err) {
    mapError(err, res)
  }
}

export async function getPurchase(req: AuthRequest, res: Response): Promise<void> {
  try {
    const purchase = await purchasesService.getPurchase(req.user!.storeId, req.params['id']!)
    res.json(purchase)
  } catch (err) {
    mapError(err, res)
  }
}

export async function deletePurchase(req: AuthRequest, res: Response): Promise<void> {
  try {
    await purchasesService.deletePurchase(
      req.user!.storeId,
      req.params['id']!,
      req.user!.userId,
    )
    res.status(204).end()
  } catch (err) {
    mapError(err, res)
  }
}
