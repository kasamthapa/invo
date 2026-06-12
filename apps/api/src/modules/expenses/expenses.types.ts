export type ExpenseCategory =
  | 'DELIVERY'
  | 'PACKAGING'
  | 'RENT'
  | 'MARKETING'
  | 'SALARY'
  | 'OTHER'

export interface CreateExpenseInput {
  amount: number
  category: ExpenseCategory
  expenseDate?: string
  note?: string
}

export interface UpdateExpenseInput {
  amount?: number
  category?: ExpenseCategory
  expenseDate?: string
  note?: string
}

export interface ExpenseResponse {
  id: string
  amount: number
  category: ExpenseCategory
  expenseDate: string
  note: string | null
  createdAt: string
}

export interface ExpenseSummaryResponse {
  total: number
  byCategory: Partial<Record<ExpenseCategory, number>>
}
