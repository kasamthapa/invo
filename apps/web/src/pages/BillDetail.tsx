import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Copy, ExternalLink } from 'lucide-react'
import { useBill, useVoidBill } from '../hooks/useBills'
import { formatNPR } from '../utils/money'
import { formatDate } from '../utils/money'

function StatusBadge({ label, color }: { label: string; color: string }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{label}</span>
}

export default function BillDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: bill, isLoading, isError } = useBill(id ?? '')
  const voidBill = useVoidBill()
  const [copied, setCopied] = useState(false)
  const [confirming, setConfirming] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !bill) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-6 text-center">
        <p className="text-zinc-400 text-sm">Bill not found.</p>
        <Link to="/app/bills" className="text-emerald-400 text-sm font-medium">
          ← Back to bills
        </Link>
      </div>
    )
  }

  const publicUrl = `${window.location.origin}/bill/${bill.publicToken}`
  const voided = bill.status === 'VOIDED'

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  async function handleVoid() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    setConfirming(false)
    if (!bill) return
    await voidBill.mutateAsync(bill.id)
  }

  const payBadgeColor =
    bill.paymentStatus === 'PAID'
      ? 'bg-emerald-500/20 text-emerald-400'
      : bill.paymentStatus === 'COD_PENDING'
      ? 'bg-blue-500/20 text-blue-400'
      : 'bg-amber-500/20 text-amber-400'

  return (
    <div className="pb-10">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <Link to="/app/bills" className="flex items-center gap-1 text-zinc-400 active:opacity-70">
          <ChevronLeft size={20} />
          <span className="text-sm">Bills</span>
        </Link>
        <div className="flex gap-1.5">
          <StatusBadge label={bill.paymentStatus.replace('_', ' ')} color={payBadgeColor} />
          {voided ? (
            <StatusBadge label="VOIDED" color="bg-red-500/20 text-red-400" />
          ) : (
            <StatusBadge label="ACTIVE" color="bg-zinc-700 text-zinc-400" />
          )}
        </div>
      </div>

      {/* Bill header */}
      <div className="px-4 mb-5">
        <h1 className={`text-white font-bold text-2xl ${voided ? 'line-through opacity-60' : ''}`}>
          Bill #{bill.billNumber}
        </h1>
        <p className="text-zinc-400 text-sm mt-0.5">{formatDate(bill.createdAt)}</p>
        {(bill.customerName || bill.customerPhone) && (
          <p className="text-zinc-300 text-sm mt-1">
            {[bill.customerName, bill.customerPhone].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="px-4 mb-5">
        <p className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Items</p>
        <div className="bg-zinc-800 rounded-xl divide-y divide-zinc-700">
          {bill.items.map((item) => {
            const attrs = Object.values(item.attributesSnap).join(' / ')
            return (
              <div key={item.id} className="px-4 py-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-white text-sm font-medium">{item.productNameSnap}</p>
                    {attrs && <p className="text-zinc-400 text-xs mt-0.5">{attrs}</p>}
                    <p className="text-zinc-500 text-xs mt-0.5">{item.productCodeSnap}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white text-sm font-semibold">{formatNPR(item.lineTotal)}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {formatNPR(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Totals */}
      <div className="px-4 mb-5 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Subtotal</span>
          <span className="text-white">{formatNPR(bill.subtotal)}</span>
        </div>
        {bill.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Discount</span>
            <span className="text-red-400">-{formatNPR(bill.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold pt-1 border-t border-zinc-800">
          <span className="text-white">Total</span>
          <span className="text-white">{formatNPR(bill.total)}</span>
        </div>
      </div>

      {/* Payment */}
      {bill.paymentMethod && (
        <div className="px-4 mb-5">
          <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Payment</p>
          <p className="text-zinc-300 text-sm">{bill.paymentMethod.replace('_', ' ')}</p>
        </div>
      )}

      {/* Notes */}
      {bill.notes && (
        <div className="px-4 mb-5">
          <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Notes</p>
          <p className="text-zinc-300 text-sm">{bill.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 space-y-3">
        <button
          onClick={() => void handleCopy()}
          className="w-full flex items-center justify-center gap-2 bg-zinc-800 text-white text-sm font-medium py-3 rounded-xl active:opacity-80"
        >
          <Copy size={16} />
          {copied ? 'Copied!' : 'Copy bill link'}
        </button>

        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-zinc-800 text-white text-sm font-medium py-3 rounded-xl active:opacity-80"
        >
          <ExternalLink size={16} />
          View public bill
        </a>

        {!voided && (
          <button
            onClick={() => void handleVoid()}
            disabled={voidBill.isPending}
            className={`w-full py-3 rounded-xl text-sm font-medium active:opacity-80 disabled:opacity-50 ${
              confirming
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 text-red-400 border border-red-900/40'
            }`}
          >
            {voidBill.isPending
              ? 'Voiding…'
              : confirming
              ? 'Tap again to confirm void'
              : 'Void Bill'}
          </button>
        )}

        {confirming && (
          <button
            onClick={() => setConfirming(false)}
            className="w-full text-zinc-500 text-sm active:opacity-70"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
