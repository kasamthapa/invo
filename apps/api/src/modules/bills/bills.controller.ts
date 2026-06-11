import { Request, Response } from 'express'
import { z } from 'zod'
import { AuthRequest } from '../../middleware/authenticate.js'
import * as billsService from './bills.service.js'

const paymentMethodEnum = z.enum(['CASH', 'KHALTI', 'ESEWA', 'FONEPAY', 'BANK_TRANSFER', 'COD'])
const paymentStatusEnum = z.enum(['UNPAID', 'PAID', 'PARTIAL', 'COD_PENDING'])

const billItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().int().positive().optional(),
})

const createBillSchema = z.object({
  customerId: z.string().uuid().optional(),
  customerName: z.string().min(1).optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  items: z.array(billItemSchema).min(1),
  discount: z.number().int().min(0).default(0),
  notes: z.string().optional(),
  paymentMethod: paymentMethodEnum.optional(),
  paymentStatus: z.enum(['UNPAID', 'PAID', 'COD_PENDING']).optional(),
})

const updatePaymentSchema = z.object({
  paymentStatus: paymentStatusEnum,
  paymentMethod: paymentMethodEnum.optional(),
  paymentProofUrl: z.string().url().optional(),
})

function mapServiceError(err: unknown): { status: number; error: string } {
  if (err instanceof Error) {
    if (err.message.startsWith('INSUFFICIENT_STOCK:')) {
      const code = err.message.split(':')[1]
      return { status: 400, error: `Insufficient stock for variant: ${code}` }
    }
    switch (err.message) {
      case 'NO_ITEMS':       return { status: 400, error: 'At least one item required' }
      case 'VARIANT_NOT_FOUND': return { status: 404, error: 'Variant not found' }
      case 'INVALID_TOTAL':  return { status: 400, error: 'Discount cannot exceed subtotal' }
      case 'NOT_FOUND':      return { status: 404, error: 'Bill not found' }
      case 'BILL_VOIDED':    return { status: 409, error: 'Bill is already voided' }
      case 'ALREADY_VOIDED': return { status: 409, error: 'Bill is already voided' }
    }
  }
  return { status: 500, error: 'Internal server error' }
}

export async function createBill(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createBillSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation error', details: parsed.error.errors })
    return
  }
  try {
    const result = await billsService.createBill(req.user!.storeId, req.user!.userId, parsed.data)
    res.status(201).json(result)
  } catch (err) {
    const { status, error } = mapServiceError(err)
    if (status === 500) console.error('[createBill]', err)
    res.status(status).json({ error })
  }
}

export async function listBills(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await billsService.getBills(req.user!.storeId)
    res.status(200).json(result)
  } catch (err) {
    console.error('[listBills]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getBill(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await billsService.getBill(req.user!.storeId, req.params.id)
    res.status(200).json(result)
  } catch (err) {
    const { status, error } = mapServiceError(err)
    if (status === 500) console.error('[getBill]', err)
    res.status(status).json({ error })
  }
}

export async function getBillByToken(req: Request, res: Response): Promise<void> {
  try {
    const result = await billsService.getBillByToken(req.params.token)
    res.status(200).json(result)
  } catch (err) {
    const { status, error } = mapServiceError(err)
    if (status === 500) console.error('[getBillByToken]', err)
    res.status(status).json({ error })
  }
}

export async function updatePayment(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updatePaymentSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation error', details: parsed.error.errors })
    return
  }
  try {
    const result = await billsService.updatePayment(req.user!.storeId, req.params.id, parsed.data)
    res.status(200).json(result)
  } catch (err) {
    const { status, error } = mapServiceError(err)
    if (status === 500) console.error('[updatePayment]', err)
    res.status(status).json({ error })
  }
}

export async function voidBill(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await billsService.voidBill(req.user!.storeId, req.params.id, req.user!.userId)
    res.status(200).json(result)
  } catch (err) {
    const { status, error } = mapServiceError(err)
    if (status === 500) console.error('[voidBill]', err)
    res.status(status).json({ error })
  }
}
