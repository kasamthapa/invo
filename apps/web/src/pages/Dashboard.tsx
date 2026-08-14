import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Package,
  Wallet,
  Receipt,
  TrendingUp,
  TrendingDown,
  Minus,
  Layers,
} from 'lucide-react'
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
  if (status === 'PAID') return 'bg-[var(--success-light)] text-[var(--success)]'
  if (status === 'COD_PENDING') return 'bg-blue-500/20 text-blue-400'
  if (status === 'UNPAID') return 'bg-amber-500/20 text-amber-400'
  return 'bg-[var(--border-2)] text-[var(--text-muted)]'
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <p className="text-[var(--text-secondary)] text-xs uppercase tracking-wider mb-3">{children}</p>
  )
}

type StatTone = 'accent' | 'success' | 'muted'

const TONE_STYLES: Record<StatTone, string> = {
  accent: 'bg-[var(--accent-light)] text-[var(--accent)]',
  success: 'bg-[var(--success-light)] text-[var(--success)]',
  muted: 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)]',
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'muted',
}: {
  label: string
  value: string
  icon?: React.ElementType
  tone?: StatTone
}) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[var(--text-muted)] text-xs">{label}</p>
        {Icon && (
          <span className={`flex items-center justify-center h-7 w-7 rounded-md flex-shrink-0 ${TONE_STYLES[tone]}`}>
            <Icon size={14} strokeWidth={2} />
          </span>
        )}
      </div>
      <p className="text-[var(--text-primary)] text-xl font-bold tabular-nums">{value}</p>
    </div>
  )
}

function SkeletonDashboard() {
  return (
    <div className="pt-2 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-6 bg-[var(--bg-surface)] rounded w-2/3" />
        <div className="h-4 bg-[var(--bg-surface)] rounded w-1/3" />
        <div className="h-3 bg-[var(--bg-surface)] rounded w-1/2" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="h-20 bg-[var(--bg-surface)] rounded-xl" />
        <div className="h-20 bg-[var(--bg-surface)] rounded-xl" />
        <div className="h-20 bg-[var(--bg-surface)] rounded-xl" />
        <div className="h-20 bg-[var(--bg-surface)] rounded-xl" />
      </div>
      <div className="h-24 bg-[var(--bg-surface)] rounded-xl" />
      <div className="space-y-2">
        <div className="h-16 bg-[var(--bg-surface)] rounded-xl" />
        <div className="h-16 bg-[var(--bg-surface)] rounded-xl" />
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
        <p className="text-[var(--text-muted)] text-sm">Couldn't load dashboard.</p>
        <button
          onClick={() => void refetch()}
          className="text-[var(--success)] text-sm font-medium active:opacity-70"
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
    <div className="pb-8 space-y-6">
      {/* ── Greeting ── */}
      <div className="pt-2 pb-1">
        <h2 className="text-[var(--text-primary)] text-2xl font-bold">
          {getNepalGreeting()}, {user?.name?.split(' ')[0] ?? 'Seller'} 👋
        </h2>
        <p className="text-[var(--text-secondary)] text-sm mt-0.5">{store?.name}</p>
        <p className="text-[var(--text-muted)] text-xs mt-1">{getNepalDateString()}</p>
      </div>

      {/* ── Today ── */}
      <div>
        <SectionHeading>Today</SectionHeading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Revenue" value={formatNPR(data?.todayRevenue ?? 0)} icon={Wallet} tone="accent" />
          <StatCard label="Bills" value={String(data?.todayBillCount ?? 0)} icon={Receipt} tone="muted" />
          {(data?.todayBillCount ?? 0) > 0 && (
            <StatCard label="Avg Order" value={formatNPR(data?.todayAvgOrderValue ?? 0)} icon={TrendingUp} tone="success" />
          )}
          <StatCard label="Products" value={String(data?.totalProducts ?? 0)} icon={Package} tone="muted" />
        </div>
      </div>

      {/* ── This month (OWNER only) ── */}
      {hasMonthData && (
        <div>
          <SectionHeading>This month</SectionHeading>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            <StatCard label="Revenue" value={formatNPR(data!.monthRevenue!)} icon={Wallet} tone="accent" />
            <StatCard label="Expenses" value={formatNPR(data!.monthExpenses ?? 0)} icon={Layers} tone="muted" />
            <div className="col-span-2 md:col-span-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[var(--text-muted)] text-xs">Profit</p>
                <span
                  className={`flex items-center justify-center h-7 w-7 rounded-md flex-shrink-0 ${
                    (data!.monthProfit ?? 0) > 0
                      ? 'bg-[var(--success-light)] text-[var(--success)]'
                      : (data!.monthProfit ?? 0) < 0
                      ? 'bg-[var(--danger-light)] text-[var(--danger)]'
                      : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)]'
                  }`}
                >
                  {(data!.monthProfit ?? 0) > 0 ? (
                    <TrendingUp size={14} strokeWidth={2} />
                  ) : (data!.monthProfit ?? 0) < 0 ? (
                    <TrendingDown size={14} strokeWidth={2} />
                  ) : (
                    <Minus size={14} strokeWidth={2} />
                  )}
                </span>
              </div>
              <p
                className={`text-xl font-bold tabular-nums ${
                  (data!.monthProfit ?? 0) > 0
                    ? 'text-[var(--success)]'
                    : (data!.monthProfit ?? 0) < 0
                    ? 'text-[var(--danger)]'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                {formatNPR(data!.monthProfit ?? 0)}
              </p>
              {data!.last7Days && data!.last7Days.length > 0 && (
                <div className="mt-3">
                  <RevenueSparkline data={data!.last7Days} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Alerts ── */}
      {hasAlerts && (
        <div>
          <SectionHeading>Needs attention</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(data?.unpaidBillCount ?? 0) > 0 && (
              <Link
                to="/app/bills"
                className="flex items-center gap-3 bg-[var(--warning-light)] border border-[var(--warning)]/20 rounded-xl px-4 py-3 active:opacity-70 hover:brightness-95 transition-all"
              >
                <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-[var(--warning)]/15 text-[var(--warning)] flex-shrink-0">
                  <AlertTriangle size={15} strokeWidth={2} />
                </span>
                <div className="flex-1">
                  <p className="text-[var(--warning)] text-sm font-medium">
                    {data!.unpaidBillCount} unpaid{' '}
                    {data!.unpaidBillCount === 1 ? 'bill' : 'bills'}
                  </p>
                  {data!.unpaidTotal !== undefined && (
                    <p className="text-[var(--warning)]/80 text-xs">{formatNPR(data!.unpaidTotal)}</p>
                  )}
                </div>
              </Link>
            )}
            {(data?.codPendingCount ?? 0) > 0 && (
              <Link
                to="/app/bills"
                className="flex items-center gap-3 bg-[var(--info-light)] border border-[var(--info)]/20 rounded-xl px-4 py-3 active:opacity-70 hover:brightness-95 transition-all"
              >
                <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-[var(--info)]/15 text-[var(--info)] flex-shrink-0">
                  <Package size={15} strokeWidth={2} />
                </span>
                <p className="text-[var(--info)] text-sm font-medium">
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
        <div>
          <SectionHeading>Low stock</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {visibleAlerts.map((alert) => (
              <div
                key={alert.variantId}
                className="flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3"
              >
                <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-[var(--warning-light)] text-[var(--warning)] flex-shrink-0">
                  <Package size={15} strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[var(--text-primary)] text-sm font-medium truncate">{alert.productName}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[var(--text-muted)] text-xs">{alert.variantCode}</p>
                    <p className="text-[var(--warning)] text-xs font-medium flex-shrink-0">
                      {alert.currentQty} left
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {extraAlerts > 0 && (
            <Link
              to="/app/products"
              className="block text-center text-[var(--text-secondary)] text-xs py-2 active:opacity-70 mt-1"
            >
              + {extraAlerts} more low-stock items
            </Link>
          )}
        </div>
      )}

      {/* ── Recent bills ── */}
      {(data?.recentBills?.length ?? 0) > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <SectionHeading>Recent bills</SectionHeading>
            <Link to="/app/bills" className="text-[var(--accent)] text-xs active:opacity-70 hover:underline -mt-3">
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
                  className={`flex items-center justify-between bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3 active:opacity-70 hover:bg-[var(--bg-surface-2)] transition-colors ${voided ? 'opacity-50' : ''}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-[var(--text-primary)] text-sm font-medium ${voided ? 'line-through' : ''}`}>
                        Bill #{bill.billNumber}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${payBadgeColor(bill.paymentStatus)}`}>
                        {bill.paymentStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[var(--text-muted)] text-xs mt-0.5 truncate">
                      {bill.customerName ? `${bill.customerName} · ` : ''}
                      {new Date(bill.createdAt).toLocaleDateString('en-NP', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <p className="text-[var(--text-primary)] text-sm font-semibold flex-shrink-0 ml-3">
                    {formatNPR(bill.total)}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Quick actions ── */}
      <div>
        <SectionHeading>Quick actions</SectionHeading>
        <div className="flex gap-3">
          <Link
            to="/app/bill/new"
            className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] text-sm font-semibold py-3.5 rounded-lg text-center active:opacity-80 transition-colors"
          >
            + New Bill
          </Link>
          <Link
            to="/app/products/new"
            className="flex-1 bg-[var(--bg-surface)] border border-[var(--border)] hover:bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-sm font-semibold py-3.5 rounded-lg text-center active:opacity-80 transition-colors"
          >
            + Add Product
          </Link>
        </div>
      </div>
    </div>
  )
}
