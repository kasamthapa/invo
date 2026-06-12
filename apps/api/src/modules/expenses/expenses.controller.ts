import { Response } from 'express'
import { z } from 'zod'
import { AuthRequest } from '../../middleware/authenticate.js'
import * as expensesService from './expenses.service.js'

const EXPENSE_CATEGORIES = ['DELIVERY', 'PACKAGING', 'RENT', 'MARKETING', 'SALARY', 'OTHER'] as const

const createExpenseSchema = z.object({
  amount: z.number().int().positive(),
  category: z.enum(EXPENSE_CATEGORIES),
  expenseDate: z.string().datetime().optional(),
  note: z.string().optional(),
})

const updateExpenseSchema = z.object({
  amount: z.number().int().positive().optional(),
  category: z.enum(EXPENSE_CATEGORIES).optional(),
  expenseDate: z.string().datetime().optional(),
  note: z.string().optional(),
})

const summaryQuerySchema = z.object({
  from: z.string(),
  to: z.string(),
})

const listQuerySchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

function mapError(err: unknown, res: Response): void {
  if (err instanceof z.ZodError) {
    res.status(400).json({ error: 'Validation error', details: err.errors })
    return
  }
  if (err instanceof Error && err.message === 'NOT_FOUND') {
    res.status(404).json({ error: 'Expense not found' })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}

export async function createExpense(req: AuthRequest, res: Response): Promise<void> {
  try {
    const input = createExpenseSchema.parse(req.body)
    const expense = await expensesService.createExpense(req.user!.storeId, req.user!.userId, input)
    res.status(201).json(expense)
  } catch (err) {
    mapError(err, res)
  }
}

export async function listExpenses(req: AuthRequest, res: Response): Promise<void> {
  try {
    const filters = listQuerySchema.parse(req.query)
    const expenses = await expensesService.getExpenses(req.user!.storeId, filters)
    res.json(expenses)
  } catch (err) {
    mapError(err, res)
  }
}

export async function getExpenseSummary(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { from, to } = summaryQuerySchema.parse(req.query)
    const summary = await expensesService.getExpenseSummary(req.user!.storeId, from, to)
    res.json(summary)
  } catch (err) {
    mapError(err, res)
  }
}

export async function getExpense(req: AuthRequest, res: Response): Promise<void> {
  try {
    const expense = await expensesService.getExpense(req.user!.storeId, req.params['id']!)
    res.json(expense)
  } catch (err) {
    mapError(err, res)
  }
}

export async function updateExpense(req: AuthRequest, res: Response): Promise<void> {
  try {
    const input = updateExpenseSchema.parse(req.body)
    const expense = await expensesService.updateExpense(
      req.user!.storeId,
      req.params['id']!,
      input,
    )
    res.json(expense)
  } catch (err) {
    mapError(err, res)
  }
}

export async function deleteExpense(req: AuthRequest, res: Response): Promise<void> {
  try {
    await expensesService.deleteExpense(req.user!.storeId, req.params['id']!)
    res.status(204).end()
  } catch (err) {
    mapError(err, res)
  }
}
