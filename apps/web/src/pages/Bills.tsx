import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Receipt } from 'lucide-react'
import { useBills } from '../hooks/useBills'
import { formatNPR } from '../utils/money'
import { formatDate } from '../utils/money'
import type { Bill } from '../types/bill'

function statusBadge(bill: Bill) {
  const badges: React.ReactNode[] = []

  const payColor =
    bill.paymentStatus === 'PAID'
      ? 'bg-[var(--success-light)] text-[var(--success)]'
      : bill.paymentStatus === 'COD_PENDING'
      ? 'bg-blue-500/20 text-blue-400'
      : 'bg-amber-500/20 text-amber-400'

  badges.push(
    <span key="pay" className={`text-xs px-2 py-0.5 rounded-full font-medium ${payColor}`}>
      {bill.paymentStatus.replace('_', ' ')}
    </span>,
  )

  if (bill.status === 'VOIDED') {
    badges.push(
      <span key="void" className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-500/20 text-red-400">
        VOIDED
      </span>,
    )
  } else {
    badges.push(
      <span key="active" className="text-xs px-2 py-0.5 rounded-full font-medium bg-[var(--border-2)] text-[var(--text-muted)]">
        ACTIVE
      </span>,
    )
  }

  return badges
}

function BillRow({ bill }: { bill: Bill }) {
  const voided = bill.status === 'VOIDED'
  return (
    <Link
      to={`/app/bills/${bill.id}`}
      className={`flex items-center gap-3 px-4 py-3 active:bg-[var(--bg-hover)] ${voided ? 'opacity-60' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-[var(--text-primary)] text-sm font-medium ${voided ? 'line-through' : ''}`}>
            Bill #{bill.billNumber}
          </p>
          <div className="flex gap-1.5">{statusBadge(bill)}</div>
        </div>
        {(bill.customerName || bill.customerPhone) && (
          <p className="text-[var(--text-muted)] text-xs mt-0.5 truncate">
            {[bill.customerName, bill.customerPhone].filter(Boolean).join(' · ')}
          </p>
        )}
        <p className="text-[var(--text-secondary)] text-xs mt-0.5">
          {formatNPR(bill.total)} · {formatDate(bill.createdAt)}
        </p>
      </div>
      <ChevronRight size={16} className="text-[var(--text-muted)] flex-shrink-0" />
    </Link>
  )
}

export default function Bills() {
  const { data: bills, isLoading, isError, refetch } = useBills()

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-10 bg-[var(--bg-app)] px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Link to="/app/more" className="flex items-center gap-1 text-[var(--text-muted)] active:opacity-70">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-[var(--text-primary)] font-semibold text-lg">Bills</h1>
            {bills && <p className="text-[var(--text-muted)] text-xs">{bills.length} bills</p>}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border-2 border-[var(--border-2)] border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center px-6">
          <p className="text-[var(--text-muted)] text-sm">Couldn't load bills.</p>
          <button onClick={() => void refetch()} className="text-[var(--success)] text-sm font-medium">
            Tap to retry
          </button>
        </div>
      )}

      {!isLoading && !isError && bills?.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center px-6">
          <Receipt size={40} className="text-[var(--text-placeholder)]" />
          <p className="text-[var(--text-muted)] text-sm">No bills yet.</p>
          <Link
            to="/app/bill/new"
            className="bg-[var(--accent)] text-[var(--text-primary)] text-sm font-medium px-5 py-2.5 rounded-xl active:opacity-80"
          >
            Create First Bill
          </Link>
        </div>
      )}

      {!isLoading && !isError && bills && bills.length > 0 && (
        <div className="divide-y divide-[var(--border)]">
          {bills.map((bill) => (
            <BillRow key={bill.id} bill={bill} />
          ))}
        </div>
      )}
    </div>
  )
}
