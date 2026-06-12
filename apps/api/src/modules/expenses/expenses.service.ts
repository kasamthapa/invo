import { prisma } from '../../lib/prisma.js'
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseCategory,
  ExpenseResponse,
  ExpenseSummaryResponse,
} from './expenses.types.js'

function toExpenseResponse(e: {
  id: string
  amount: number
  category: string
  expenseDate: Date
  note: string | null
  createdAt: Date
}): ExpenseResponse {
  return {
    id: e.id,
    amount: e.amount,
    category: e.category as ExpenseCategory,
    expenseDate: e.expenseDate.toISOString(),
    note: e.note,
    createdAt: e.createdAt.toISOString(),
  }
}

export async function createExpense(
  storeId: string,
  createdById: string,
  input: CreateExpenseInput,
): Promise<ExpenseResponse> {
  const expense = await prisma.expense.create({
    data: {
      storeId,
      createdById,
      amount: input.amount,
      category: input.category,
      expenseDate: input.expenseDate ? new Date(input.expenseDate) : new Date(),
      note: input.note ?? null,
    },
  })
  return toExpenseResponse(expense)
}

export async function getExpenses(
  storeId: string,
  filters?: { category?: ExpenseCategory; from?: string; to?: string },
): Promise<ExpenseResponse[]> {
  const expenses = await prisma.expense.findMany({
    where: {
      storeId,
      deletedAt: null,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.from || filters?.to
        ? {
            expenseDate: {
              ...(filters.from && { gte: new Date(filters.from) }),
              ...(filters.to && { lte: new Date(filters.to) }),
            },
          }
        : {}),
    },
    orderBy: { expenseDate: 'desc' },
  })
  return expenses.map(toExpenseResponse)
}

export async function getExpense(storeId: string, expenseId: string): Promise<ExpenseResponse> {
  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, storeId, deletedAt: null },
  })
  if (!expense) throw new Error('NOT_FOUND')
  return toExpenseResponse(expense)
}

export async function updateExpense(
  storeId: string,
  expenseId: string,
  input: UpdateExpenseInput,
): Promise<ExpenseResponse> {
  const existing = await prisma.expense.findFirst({
    where: { id: expenseId, storeId, deletedAt: null },
  })
  if (!existing) throw new Error('NOT_FOUND')

  const updated = await prisma.expense.update({
    where: { id: expenseId },
    data: {
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.expenseDate !== undefined && { expenseDate: new Date(input.expenseDate) }),
      ...(input.note !== undefined && { note: input.note }),
    },
  })
  return toExpenseResponse(updated)
}

export async function deleteExpense(storeId: string, expenseId: string): Promise<void> {
  const existing = await prisma.expense.findFirst({
    where: { id: expenseId, storeId, deletedAt: null },
  })
  if (!existing) throw new Error('NOT_FOUND')

  await prisma.expense.update({
    where: { id: expenseId },
    data: { deletedAt: new Date() },
  })
}

export async function getExpenseSummary(
  storeId: string,
  from: string,
  to: string,
): Promise<ExpenseSummaryResponse> {
  const expenses = await prisma.expense.findMany({
    where: {
      storeId,
      deletedAt: null,
      expenseDate: { gte: new Date(from), lte: new Date(to) },
    },
    select: { amount: true, category: true },
  })

  const byCategory: Partial<Record<ExpenseCategory, number>> = {}
  let total = 0
  for (const e of expenses) {
    const cat = e.category as ExpenseCategory
    byCategory[cat] = (byCategory[cat] ?? 0) + e.amount
    total += e.amount
  }

  return { total, byCategory }
}
