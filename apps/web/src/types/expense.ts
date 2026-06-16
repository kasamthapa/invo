export type ExpenseCategory =
  | 'DELIVERY'
  | 'PACKAGING'
  | 'RENT'
  | 'MARKETING'
  | 'SALARY'
  | 'OTHER'

export interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  expenseDate: string
  note: string | null
  createdAt: string
}

export interface CreateExpenseInput {
  amount: number
  category: ExpenseCategory
  expenseDate?: string
  note?: string
}
