import { Response } from 'express'
import { z } from 'zod'
import { AuthRequest } from '../../middleware/authenticate.js'
import * as customersService from './customers.service.js'

const createCustomerSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(9).max(15).optional(),
  address: z.string().optional(),
  note: z.string().optional(),
})

const updateCustomerSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().min(9).max(15).optional(),
  address: z.string().optional(),
  note: z.string().optional(),
})

function mapError(err: unknown, res: Response): void {
  if (err instanceof z.ZodError) {
    res.status(400).json({ error: 'Validation error', details: err.errors })
    return
  }
  if (err instanceof Error) {
    switch (err.message) {
      case 'PHONE_TAKEN':
        res.status(409).json({ error: 'A customer with this phone number already exists' })
        return
      case 'NOT_FOUND':
        res.status(404).json({ error: 'Customer not found' })
        return
    }
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}

export async function createCustomer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const input = createCustomerSchema.parse(req.body)
    const customer = await customersService.createCustomer(req.user!.storeId, input)
    res.status(201).json(customer)
  } catch (err) {
    mapError(err, res)
  }
}

export async function listCustomers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const customers = await customersService.getCustomers(req.user!.storeId)
    res.json(customers)
  } catch (err) {
    mapError(err, res)
  }
}

export async function searchCustomers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const q = z.string().min(1).parse(req.query['q'])
    const customers = await customersService.searchCustomers(req.user!.storeId, q)
    res.json(customers)
  } catch (err) {
    mapError(err, res)
  }
}

export async function getCustomer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const customer = await customersService.getCustomer(req.user!.storeId, req.params['id']!)
    res.json(customer)
  } catch (err) {
    mapError(err, res)
  }
}

export async function updateCustomer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const input = updateCustomerSchema.parse(req.body)
    const customer = await customersService.updateCustomer(
      req.user!.storeId,
      req.params['id']!,
      input,
    )
    res.json(customer)
  } catch (err) {
    mapError(err, res)
  }
}

export async function deleteCustomer(req: AuthRequest, res: Response): Promise<void> {
  try {
    await customersService.deleteCustomer(req.user!.storeId, req.params['id']!)
    res.status(204).end()
  } catch (err) {
    mapError(err, res)
  }
}
