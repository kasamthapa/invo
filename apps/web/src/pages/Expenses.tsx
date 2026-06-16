import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Plus, X, Receipt } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useExpenses, useCreateExpense, useDeleteExpense } from '../hooks/useExpenses'
import { formatNPR } from '../utils/money'
import { formatDate } from '../utils/money'
import type { ExpenseCategory } from '../types/expense'

function OwnerGate() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 px-6 text-center">
      <p className="text-zinc-400 text-sm font-medium">Owner access required</p>
      <p className="text-zinc-600 text-xs">This section is only available to store owners.</p>
    </div>
  )
}

const CATEGORIES: { value: ExpenseCategory; label: string; color: string }[] = [
  { value: 'DELIVERY', label: 'Delivery', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'PACKAGING', label: 'Packaging', color: 'bg-amber-500/20 text-amber-400' },
  { value: 'RENT', label: 'Rent', color: 'bg-zinc-600/40 text-zinc-300' },
  { value: 'MARKETING', label: 'Marketing', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'SALARY', label: 'Salary', color: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'OTHER', label: 'Other', color: 'bg-zinc-600/40 text-zinc-400' },
]

function categoryStyle(cat: ExpenseCategory): string {
  return CATEGORIES.find((c) => c.value === cat)?.color ?? 'bg-zinc-700 text-zinc-400'
}

function categoryLabel(cat: ExpenseCategory): string {
  return CATEGORIES.find((c) => c.value === cat)?.label ?? cat
}

function AddExpenseSheet({ onClose }: { onClose: () => void }) {
  const create = useCreateExpense()
  const [amountNPR, setAmountNPR] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('OTHER')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]!)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    const amount = parseFloat(amountNPR)
    if (!amountNPR || isNaN(amount) || amount <= 0) {
      setError('Enter a valid amount.')
      return
    }
    setError(null)
    try {
      await create.mutateAsync({
        amount: Math.round(amount * 100),
        category,
        expenseDate: expenseDate ? new Date(expenseDate).toISOString() : undefined,
        note: note.trim() || undefined,
      })
      onClose()
    } catch {
      setError('Failed to add expense.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-zinc-900 rounded-t-2xl px-4 pt-5 pb-8 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white font-semibold text-base">Add Expense</h3>
          <button onClick={onClose} className="text-zinc-400 active:opacity-70"><X size={20} /></button>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>}

        <div>
          <label className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Amount (NPR) *</label>
          <input
            type="number"
            value={amountNPR}
            onChange={(e) => setAmountNPR(e.target.value)}
            placeholder="e.g. 500"
            min="0"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label className="text-zinc-500 text-xs uppercase tracking-wider block mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  category === c.value ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 active:opacity-70'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Date</label>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Bubble wrap from Bhatbhateni"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 outline-none focus:border-zinc-500"
          />
        </div>

        <button
          onClick={() => void handleSubmit()}
          disabled={create.isPending}
          className="w-full bg-emerald-500 text-white font-semibold py-3.5 rounded-xl active:opacity-80 disabled:opacity-50 mt-2"
        >
          {create.isPending ? 'Saving…' : 'Add Expense'}
        </button>
      </div>
    </div>
  )
}

export default function Expenses() {
  const { user } = useAuth()
  const { data: expenses, isLoading, isError, refetch } = useExpenses()
  const deleteExpense = useDeleteExpense()
  const [showAdd, setShowAdd] = useState(false)

  if (user?.role !== 'OWNER') return <OwnerGate />

  return (
    <div className="flex flex-col min-h-full">
      {showAdd && <AddExpenseSheet onClose={() => setShowAdd(false)} />}

      <div className="sticky top-0 z-10 bg-zinc-900 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Link to="/app/more" className="text-zinc-400 active:opacity-70"><ChevronLeft size={20} /></Link>
          <div className="flex-1">
            <h1 className="text-white font-semibold text-lg">Expenses</h1>
            {expenses && <p className="text-zinc-400 text-xs">{expenses.length} expenses</p>}
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 bg-emerald-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg active:opacity-80"
          >
            <Plus size={14} />Add
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center px-6">
          <p className="text-zinc-400 text-sm">Couldn't load expenses.</p>
          <button onClick={() => void refetch()} className="text-emerald-400 text-sm font-medium">Tap to retry</button>
        </div>
      )}

      {!isLoading && !isError && (!expenses || expenses.length === 0) && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center px-6">
          <Receipt size={40} className="text-zinc-700" />
          <p className="text-zinc-400 text-sm">No expenses recorded yet.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-emerald-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl active:opacity-80"
          >
            Add Expense
          </button>
        </div>
      )}

      {!isLoading && !isError && expenses && expenses.length > 0 && (
        <div className="divide-y divide-zinc-800/50">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryStyle(expense.category)}`}>
                    {categoryLabel(expense.category)}
                  </span>
                  <p className="text-white text-sm font-semibold">{formatNPR(expense.amount)}</p>
                </div>
                <p className="text-zinc-500 text-xs mt-0.5">
                  {expense.note ? `${expense.note} · ` : ''}
                  {formatDate(expense.expenseDate)}
                </p>
              </div>
              <button
                onClick={() => {
                  if (!confirm('Delete this expense?')) return
                  void deleteExpense.mutateAsync(expense.id)
                }}
                className="text-zinc-600 active:text-red-400 px-2 py-1 text-xs"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
