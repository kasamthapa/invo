import { Response } from 'express'
import { z } from 'zod'
import { AuthRequest } from '../../middleware/authenticate.js'
import * as productsService from './products.service.js'

const variantSchema = z.object({
  attributes: z.record(z.string()),
  price: z.number().int().positive().optional(),
  lowStockAt: z.number().int().min(0).optional(),
  openingStock: z.number().int().min(0).default(0),
})

const createProductSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string().optional(),
  basePrice: z.number().int().positive(),
  visible: z.boolean().default(true),
  variants: z.array(variantSchema).min(1),
})

const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  basePrice: z.number().int().positive().optional(),
  visible: z.boolean().optional(),
})

const createVariantSchema = variantSchema

const updateVariantSchema = z.object({
  price: z.number().int().positive().optional(),
  lowStockAt: z.number().int().min(0).optional(),
  attributes: z.record(z.string()).optional(),
})

function mapServiceError(err: unknown): { status: number; error: string } {
  if (err instanceof Error) {
    switch (err.message) {
      case 'AT_LEAST_ONE_VARIANT': return { status: 400, error: 'At least one variant required' }
      case 'CODE_TAKEN':           return { status: 409, error: 'Product code already taken' }
      case 'DUPLICATE_VARIANT':    return { status: 409, error: 'Duplicate variant attributes' }
      case 'NOT_FOUND':            return { status: 404, error: 'Not found' }
      case 'LAST_VARIANT':         return { status: 400, error: 'Cannot delete the last variant' }
      case 'INVALID_FILE_TYPE':    return { status: 400, error: 'Only jpeg, png, webp images allowed' }
    }
  }
  return { status: 500, error: 'Internal server error' }
}

export async function createProduct(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createProductSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation error', details: parsed.error.errors })
    return
  }
  try {
    const result = await productsService.createProduct(
      req.user!.storeId,
      req.user!.userId,
      parsed.data
    )
    res.status(201).json(result)
  } catch (err) {
    const { status, error } = mapServiceError(err)
    if (status === 500) console.error('[createProduct]', err)
    res.status(status).json({ error })
  }
}

export async function listProducts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await productsService.getProducts(req.user!.storeId)
    res.status(200).json(result)
  } catch (err) {
    console.error('[listProducts]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await productsService.getProduct(req.user!.storeId, req.params.id)
    res.status(200).json(result)
  } catch (err) {
    const { status, error } = mapServiceError(err)
    if (status === 500) console.error('[getProduct]', err)
    res.status(status).json({ error })
  }
}

export async function updateProduct(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updateProductSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation error', details: parsed.error.errors })
    return
  }
  try {
    const result = await productsService.updateProduct(
      req.user!.storeId,
      req.params.id,
      parsed.data
    )
    res.status(200).json(result)
  } catch (err) {
    const { status, error } = mapServiceError(err)
    if (status === 500) console.error('[updateProduct]', err)
    res.status(status).json({ error })
  }
}

export async function deleteProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    await productsService.deleteProduct(req.user!.storeId, req.params.id)
    res.status(204).end()
  } catch (err) {
    const { status, error } = mapServiceError(err)
    if (status === 500) console.error('[deleteProduct]', err)
    res.status(status).json({ error })
  }
}

export async function addVariant(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createVariantSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation error', details: parsed.error.errors })
    return
  }
  try {
    const result = await productsService.addVariant(
      req.user!.storeId,
      req.params.id,
      req.user!.userId,
      parsed.data
    )
    res.status(201).json(result)
  } catch (err) {
    const { status, error } = mapServiceError(err)
    if (status === 500) console.error('[addVariant]', err)
    res.status(status).json({ error })
  }
}

export async function updateVariant(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updateVariantSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation error', details: parsed.error.errors })
    return
  }
  try {
    const result = await productsService.updateVariant(
      req.user!.storeId,
      req.params.id,
      req.params.variantId,
      parsed.data
    )
    res.status(200).json(result)
  } catch (err) {
    const { status, error } = mapServiceError(err)
    if (status === 500) console.error('[updateVariant]', err)
    res.status(status).json({ error })
  }
}

export async function deleteVariant(req: AuthRequest, res: Response): Promise<void> {
  try {
    await productsService.deleteVariant(
      req.user!.storeId,
      req.params.id,
      req.params.variantId
    )
    res.status(204).end()
  } catch (err) {
    const { status, error } = mapServiceError(err)
    if (status === 500) console.error('[deleteVariant]', err)
    res.status(status).json({ error })
  }
}

export async function uploadImages(req: AuthRequest, res: Response): Promise<void> {
  const files = req.files as Express.Multer.File[] | undefined
  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No images provided' })
    return
  }
  const variantId = typeof req.query.variantId === 'string' ? req.query.variantId : undefined
  try {
    const result = await productsService.uploadImages(
      req.user!.storeId,
      req.params.id,
      files,
      variantId
    )
    res.status(200).json(result)
  } catch (err) {
    const { status, error } = mapServiceError(err)
    if (status === 500) console.error('[uploadImages]', err)
    res.status(status).json({ error })
  }
}
