import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCustomer } from '../hooks/useCustomers'
import { formatNPR } from '../utils/money'
import { formatDate } from '../utils/money'

function payBadgeColor(status: string): string {
  if (status === 'PAID') return 'bg-emerald-500/20 text-emerald-400'
  if (status === 'COD_PENDING') return 'bg-blue-500/20 text-blue-400'
  return 'bg-amber-500/20 text-amber-400'
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: customer, isLoading, isError } = useCustomer(id ?? '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-6 text-center">
        <p className="text-zinc-400 text-sm">Customer not found.</p>
        <Link to="/app/customers" className="text-emerald-400 text-sm font-medium">
          ← Back to customers
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-10">
      <div className="flex items-center gap-3 px-4 pt-4 pb-5">
        <Link to="/app/customers" className="flex items-center gap-1 text-zinc-400 active:opacity-70">
          <ChevronLeft size={20} />
          <span className="text-sm">Customers</span>
        </Link>
      </div>

      {/* Profile */}
      <div className="px-4 mb-5">
        <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center mb-3">
          <span className="text-white text-xl font-bold">
            {customer.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
          </span>
        </div>
        <h1 className="text-white text-2xl font-bold">{customer.name}</h1>
        {customer.phone && <p className="text-zinc-400 text-sm mt-1">{customer.phone}</p>}
        {customer.address && <p className="text-zinc-500 text-sm mt-0.5">{customer.address}</p>}
        {customer.note && (
          <p className="text-zinc-600 text-xs mt-2 italic">"{customer.note}"</p>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 mb-5">
        <div className="flex gap-3">
          <div className="flex-1 bg-zinc-800 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Total orders</p>
            <p className="text-white text-xl font-bold">{customer.totalOrders}</p>
          </div>
          <div className="flex-1 bg-zinc-800 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Total spent</p>
            <p className="text-white text-xl font-bold">{formatNPR(customer.totalSpent)}</p>
          </div>
        </div>
      </div>

      {/* Recent bills */}
      {customer.recentBills.length > 0 && (
        <div className="px-4">
          <p className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Recent bills</p>
          <div className="space-y-2">
            {customer.recentBills.map((bill) => (
              <Link
                key={bill.id}
                to={`/app/bills/${bill.id}`}
                className="flex items-center justify-between bg-zinc-800 rounded-xl px-4 py-3 active:opacity-70"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium">Bill #{bill.billNumber}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${payBadgeColor(bill.paymentStatus)}`}>
                      {bill.paymentStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-xs mt-0.5">{formatDate(bill.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-semibold">{formatNPR(bill.total)}</p>
                  <ChevronRight size={14} className="text-zinc-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {customer.recentBills.length === 0 && (
        <div className="px-4">
          <p className="text-zinc-600 text-sm text-center py-6">No bills yet for this customer.</p>
        </div>
      )}
    </div>
  )
}
