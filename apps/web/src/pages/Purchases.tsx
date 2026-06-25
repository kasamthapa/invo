import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, ShoppingCart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePurchases } from '../hooks/usePurchases'
import { formatNPR } from '../utils/money'
import { formatDate } from '../utils/money'

function OwnerGate() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 px-6 text-center">
      <p className="text-[var(--text-muted)] text-sm font-medium">Owner access required</p>
      <p className="text-[var(--text-muted)] text-xs">This section is only available to store owners.</p>
    </div>
  )
}

export default function Purchases() {
  const { user } = useAuth()
  const { data: purchases, isLoading, isError, refetch } = usePurchases()

  if (user?.role !== 'OWNER') return <OwnerGate />

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-10 bg-[var(--bg-app)] px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Link to="/app/more" className="text-[var(--text-muted)] active:opacity-70"><ChevronLeft size={20} /></Link>
          <div className="flex-1">
            <h1 className="text-[var(--text-primary)] font-semibold text-lg">Purchases</h1>
            {purchases && <p className="text-[var(--text-muted)] text-xs">{purchases.length} purchases</p>}
          </div>
          <Link
            to="/app/purchases/new"
            className="flex items-center gap-1 bg-[var(--accent)] text-[var(--text-primary)] text-xs font-medium px-3 py-1.5 rounded-lg active:opacity-80"
          >
            <Plus size={14} />New
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border-2 border-[var(--border-2)] border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center px-6">
          <p className="text-[var(--text-muted)] text-sm">Couldn't load purchases.</p>
          <button onClick={() => void refetch()} className="text-[var(--success)] text-sm font-medium">Tap to retry</button>
        </div>
      )}

      {!isLoading && !isError && (!purchases || purchases.length === 0) && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center px-6">
          <ShoppingCart size={40} className="text-[var(--text-placeholder)]" />
          <p className="text-[var(--text-muted)] text-sm">No purchases yet.</p>
          <Link
            to="/app/purchases/new"
            className="bg-[var(--accent)] text-[var(--text-primary)] text-sm font-medium px-5 py-2.5 rounded-xl active:opacity-80"
          >
            Record Purchase
          </Link>
        </div>
      )}

      {!isLoading && !isError && purchases && purchases.length > 0 && (
        <div className="divide-y divide-[var(--border)]">
          {purchases.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[var(--text-primary)] text-sm font-medium">
                    {formatDate(p.purchaseDate)}
                  </p>
                  <p className="text-[var(--text-primary)] text-sm font-semibold">{formatNPR(p.totalCost)}</p>
                </div>
                {p.supplierName && (
                  <p className="text-[var(--text-muted)] text-xs mt-0.5">{p.supplierName}</p>
                )}
                <p className="text-[var(--text-muted)] text-xs mt-0.5">
                  {p.items.length} {p.items.length === 1 ? 'item' : 'items'}
                  {p.note ? ` · ${p.note}` : ''}
                </p>
              </div>
              <ChevronRight size={16} className="text-[var(--text-muted)] flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
