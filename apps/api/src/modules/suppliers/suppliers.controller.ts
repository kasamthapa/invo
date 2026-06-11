import { Response } from 'express'
import { z } from 'zod'
import { AuthRequest } from '../../middleware/authenticate.js'
import * as suppliersService from './suppliers.service.js'

const createSupplierSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().optional(),
  note: z.string().optional(),
})

const updateSupplierSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().optional(),
  note: z.string().optional(),
})

function mapError(err: unknown, res: Response): void {
  if (err instanceof z.ZodError) {
    res.status(400).json({ error: 'Validation error', details: err.errors })
    return
  }
  if (err instanceof Error) {
    if (err.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'Supplier not found' })
      return
    }
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}

export async function createSupplier(req: AuthRequest, res: Response): Promise<void> {
  try {
    const input = createSupplierSchema.parse(req.body)
    const supplier = await suppliersService.createSupplier(req.user!.storeId, input)
    res.status(201).json(supplier)
  } catch (err) {
    mapError(err, res)
  }
}

export async function listSuppliers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const suppliers = await suppliersService.getSuppliers(req.user!.storeId)
    res.json(suppliers)
  } catch (err) {
    mapError(err, res)
  }
}

export async function getSupplier(req: AuthRequest, res: Response): Promise<void> {
  try {
    const supplier = await suppliersService.getSupplier(req.user!.storeId, req.params['id']!)
    res.json(supplier)
  } catch (err) {
    mapError(err, res)
  }
}

export async function updateSupplier(req: AuthRequest, res: Response): Promise<void> {
  try {
    const input = updateSupplierSchema.parse(req.body)
    const supplier = await suppliersService.updateSupplier(
      req.user!.storeId,
      req.params['id']!,
      input,
    )
    res.json(supplier)
  } catch (err) {
    mapError(err, res)
  }
}

export async function deleteSupplier(req: AuthRequest, res: Response): Promise<void> {
  try {
    await suppliersService.deleteSupplier(req.user!.storeId, req.params['id']!)
    res.status(204).end()
  } catch (err) {
    mapError(err, res)
  }
}
