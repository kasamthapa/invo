import { Link } from 'react-router-dom'
import { AlertTriangle, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDashboard } from '../hooks/useDashboard'
import { formatNPR } from '../utils/money'
import RevenueSparkline from '../components/RevenueSparkline'
import type { ReactNode } from 'react'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getNepalGreeting(): string {
  const now = new Date()
  const nepalMs = now.getTime() + (5 * 60 + 45) * 60 * 1000
  const nepalHour = new Date(nepalMs).getUTCHours()
  if (nepalHour < 12) return 'Good morning'
  if (nepalHour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getNepalDateString(): string {
  const now = new Date()
  const nepalMs = now.getTime() + (5 * 60 + 45) * 60 * 1000
  return new Date(nepalMs).toLocaleDateString('en-NP', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function payBadgeColor(status: string): string {
  if (status === 'PAID') return 'bg-emerald-500/20 text-emerald-400'
  if (status === 'COD_PENDING') return 'bg-blue-500/20 text-blue-400'
  if (status === 'UNPAID') return 'bg-amber-500/20 text-amber-400'
  return 'bg-zinc-700 text-zinc-400'
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <p className="text-zinc-400 text-xs uppercase tracking-wider mb-3">{children}</p>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 bg-zinc-800 rounded-xl p-4">
      <p className="text-zinc-500 text-xs mb-1">{label}</p>
      <p className="text-white text-xl font-bold">{value}</p>
    </div>
  )
}

function SkeletonDashboard() {
  return (
    <div className="px-4 pt-6 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-6 bg-zinc-800 rounded w-2/3" />
        <div className="h-4 bg-zinc-800 rounded w-1/3" />
        <div className="h-3 bg-zinc-800 rounded w-1/2" />
      </div>
      <div className="flex gap-3">
        <div className="flex-1 h-20 bg-zinc-800 rounded-xl" />
        <div className="flex-1 h-20 bg-zinc-800 rounded-xl" />
      </div>
      <div className="flex gap-3">
        <div className="flex-1 h-20 bg-zinc-800 rounded-xl" />
        <div className="flex-1 h-20 bg-zinc-800 rounded-xl" />
      </div>
      <div className="h-24 bg-zinc-800 rounded-xl" />
      <div className="space-y-2">
        <div className="h-16 bg-zinc-800 rounded-xl" />
        <div className="h-16 bg-zinc-800 rounded-xl" />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, store } = useAuth()
  const { data, isLoading, isError, refetch } = useDashboard()

  if (isLoading) return <SkeletonDashboard />

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-6">
        <p className="text-zinc-400 text-sm">Couldn't load dashboard.</p>
        <button
          onClick={() => void refetch()}
          className="text-emerald-400 text-sm font-medium active:opacity-70"
        >
          Tap to retry
        </button>
      </div>
    )
  }

  const hasMonthData = data?.monthRevenue !== undefined
  const hasAlerts =
    (data?.unpaidBillCount ?? 0) > 0 || (data?.codPendingCount ?? 0) > 0
  const hasLowStock = (data?.lowStockAlerts?.length ?? 0) > 0
  const visibleAlerts = data?.lowStockAlerts?.slice(0, 5) ?? []
  const extraAlerts = (data?.lowStockAlerts?.length ?? 0) - 5

  return (
    <div className="pb-8">
      {/* ── Greeting ── */}
      <div className="px-4 pt-6 pb-5">
        <h2 className="text-white text-2xl font-bold">
          {getNepalGreeting()}, {user?.name?.split(' ')[0] ?? 'Seller'} 👋
        </h2>
        <p className="text-zinc-400 text-sm mt-0.5">{store?.name}</p>
        <p className="text-zinc-600 text-xs mt-1">{getNepalDateString()}</p>
      </div>

      {/* ── Today ── */}
      <div className="px-4 mb-6">
        <SectionHeading>Today</SectionHeading>
        <div className="flex gap-3">
          <StatCard label="Revenue" value={formatNPR(data?.todayRevenue ?? 0)} />
          <StatCard label="Bills" value={String(data?.todayBillCount ?? 0)} />
        </div>
        {(data?.todayBillCount ?? 0) > 0 && (
          <p className="text-zinc-500 text-xs mt-2">
            Avg order: {formatNPR(data?.todayAvgOrderValue ?? 0)}
          </p>
        )}
      </div>

      {/* ── This month (OWNER only) ── */}
      {hasMonthData && (
        <div className="px-4 mb-6">
          <SectionHeading>This month</SectionHeading>
          <div className="flex gap-3 mb-3">
            <StatCard label="Revenue" value={formatNPR(data!.monthRevenue!)} />
            <StatCard label="Expenses" value={formatNPR(data!.monthExpenses ?? 0)} />
          </div>
          <div className="bg-zinc-800 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Profit</p>
            <p
              className={`text-xl font-bold mb-3 ${
                (data!.monthProfit ?? 0) > 0
                  ? 'text-emerald-400'
                  : (data!.monthProfit ?? 0) < 0
                  ? 'text-red-400'
                  : 'text-zinc-400'
              }`}
            >
              {formatNPR(data!.monthProfit ?? 0)}
            </p>
            {data!.last7Days && data!.last7Days.length > 0 && (
              <RevenueSparkline data={data!.last7Days} />
            )}
          </div>
        </div>
      )}

      {/* ── Alerts ── */}
      {hasAlerts && (
        <div className="px-4 mb-6">
          <SectionHeading>Needs attention</SectionHeading>
          <div className="space-y-2">
            {(data?.unpaidBillCount ?? 0) > 0 && (
              <Link
                to="/app/bills"
                className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 active:opacity-70"
              >
                <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-amber-300 text-sm font-medium">
                    {data!.unpaidBillCount} unpaid{' '}
                    {data!.unpaidBillCount === 1 ? 'bill' : 'bills'}
                  </p>
                  {data!.unpaidTotal !== undefined && (
                    <p className="text-amber-500 text-xs">{formatNPR(data!.unpaidTotal)}</p>
                  )}
                </div>
              </Link>
            )}
            {(data?.codPendingCount ?? 0) > 0 && (
              <Link
                to="/app/bills"
                className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 active:opacity-70"
              >
                <Package size={16} className="text-blue-400 flex-shrink-0" />
                <p className="text-blue-300 text-sm font-medium">
                  {data!.codPendingCount} COD{' '}
                  {data!.codPendingCount === 1 ? 'delivery' : 'deliveries'} pending
                </p>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Low stock ── */}
      {hasLowStock && (
        <div className="px-4 mb-6">
          <SectionHeading>Low stock</SectionHeading>
          <div className="space-y-2">
            {visibleAlerts.map((alert) => (
              <div
                key={alert.variantId}
                className="bg-zinc-800 rounded-xl px-4 py-3"
              >
                <p className="text-white text-sm font-medium">{alert.productName}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-zinc-500 text-xs">{alert.variantCode}</p>
                  <p className="text-amber-400 text-xs font-medium">
                    {alert.currentQty} left ⚠
                  </p>
                </div>
              </div>
            ))}
            {extraAlerts > 0 && (
              <Link
                to="/app/products"
                className="block text-center text-zinc-400 text-xs py-2 active:opacity-70"
              >
                + {extraAlerts} more low-stock items
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Recent bills ── */}
      {(data?.recentBills?.length ?? 0) > 0 && (
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <SectionHeading>Recent bills</SectionHeading>
            <Link to="/app/bills" className="text-emerald-400 text-xs active:opacity-70 -mt-3">
              See all →
            </Link>
          </div>
          <div className="space-y-2">
            {data!.recentBills.slice(0, 5).map((bill) => {
              const voided = bill.status === 'VOIDED'
              return (
                <Link
                  key={bill.id}
                  to={`/app/bills/${bill.id}`}
                  className={`flex items-center justify-between bg-zinc-800 rounded-xl px-4 py-3 active:opacity-70 ${voided ? 'opacity-50' : ''}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-white text-sm font-medium ${voided ? 'line-through' : ''}`}>
                        Bill #{bill.billNumber}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${payBadgeColor(bill.paymentStatus)}`}>
                        {bill.paymentStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-xs mt-0.5 truncate">
                      {bill.customerName ? `${bill.customerName} · ` : ''}
                      {new Date(bill.createdAt).toLocaleDateString('en-NP', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <p className="text-white text-sm font-semibold flex-shrink-0 ml-3">
                    {formatNPR(bill.total)}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Quick actions ── */}
      <div className="px-4">
        <SectionHeading>Quick actions</SectionHeading>
        <div className="flex gap-3">
          <Link
            to="/app/bill/new"
            className="flex-1 bg-emerald-500 text-white text-sm font-semibold py-3.5 rounded-xl text-center active:opacity-80"
          >
            + New Bill
          </Link>
          <Link
            to="/app/products/new"
            className="flex-1 bg-zinc-800 text-white text-sm font-semibold py-3.5 rounded-xl text-center active:opacity-80"
          >
            + Add Product
          </Link>
        </div>
      </div>
    </div>
  )
}
