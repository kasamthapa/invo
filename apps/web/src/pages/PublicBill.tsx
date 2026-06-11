import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import config from '../config'
import type { Bill } from '../types/bill'
import { formatNPR, formatDate } from '../utils/money'

const STATUS_BADGE: Record<string, string> = {
  PAID: 'bg-green-900 text-green-300 border border-green-700',
  UNPAID: 'bg-yellow-900 text-yellow-300 border border-yellow-700',
  COD_PENDING: 'bg-blue-900 text-blue-300 border border-blue-700',
  PARTIAL: 'bg-orange-900 text-orange-300 border border-orange-700',
}

function PaymentBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE[status] ?? 'bg-zinc-700 text-zinc-300'
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${cls}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

function Spinner() {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="text-zinc-400 text-sm">Loading bill…</div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-zinc-400 text-lg">{message}</p>
        <p className="text-zinc-600 text-sm mt-2">The link may be invalid or expired.</p>
      </div>
    </div>
  )
}

export default function PublicBill() {
  const { token } = useParams<{ token: string }>()
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Bill not found or link has expired')
      setLoading(false)
      return
    }
    fetch(`${config.apiUrl}/bills/public/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error('not_found')
        return res.json() as Promise<Bill>
      })
      .then((data) => {
        setBill(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Bill not found or link has expired')
        setLoading(false)
      })
  }, [token])

  if (loading) return <Spinner />
  if (error || !bill) return <ErrorState message={error ?? 'Bill not found or link has expired'} />

  const isVoided = bill.status === 'VOIDED'

  return (
    <div className="min-h-screen bg-zinc-900 py-8 px-4">
      <div className="max-w-[480px] mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">INVO</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Invoice / Bill</p>
        </div>

        {/* Card */}
        <div className="relative bg-zinc-800 rounded-xl overflow-hidden shadow-lg">

          {/* VOIDED overlay */}
          {isVoided && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <span
                className="text-red-500 text-5xl font-black border-4 border-red-500 px-4 py-1 rounded opacity-60 rotate-[-15deg] select-none"
              >
                VOIDED
              </span>
            </div>
          )}

          {/* Bill header */}
          <div className="p-5 border-b border-zinc-700">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold text-lg">
                Bill #{String(bill.billNumber).padStart(3, '0')}
              </span>
              <span className="text-zinc-400 text-sm">{formatDate(bill.createdAt)}</span>
            </div>
          </div>

          {/* Customer */}
          {(bill.customerName || bill.customerPhone || bill.customerAddress) && (
            <div className="p-5 border-b border-zinc-700">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Customer</p>
              {bill.customerName && (
                <p className="text-white font-medium">{bill.customerName}</p>
              )}
              {bill.customerPhone && (
                <p className="text-zinc-300 text-sm mt-0.5">{bill.customerPhone}</p>
              )}
              {bill.customerAddress && (
                <p className="text-zinc-400 text-sm mt-0.5">{bill.customerAddress}</p>
              )}
            </div>
          )}

          {/* Items */}
          <div className="p-5 border-b border-zinc-700">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Items</p>
            <div className="space-y-4">
              {bill.items.map((item) => {
                const attrs = Object.entries(item.attributesSnap)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' · ')
                return (
                  <div key={item.id} className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm leading-snug">
                        {item.productNameSnap}
                      </p>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        {item.productCodeSnap}
                        {attrs && <> · {attrs}</>}
                      </p>
                      <p className="text-zinc-400 text-xs mt-1">
                        {item.quantity} × {formatNPR(item.unitPrice)}
                      </p>
                    </div>
                    <span className="text-zinc-200 text-sm font-medium whitespace-nowrap">
                      {formatNPR(item.lineTotal)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="p-5 border-b border-zinc-700 space-y-2">
            <div className="flex justify-between text-sm text-zinc-300">
              <span>Subtotal</span>
              <span>{formatNPR(bill.subtotal)}</span>
            </div>
            {bill.discount > 0 && (
              <div className="flex justify-between text-sm text-green-400">
                <span>Discount</span>
                <span>− {formatNPR(bill.discount)}</span>
              </div>
            )}
            {bill.vatAmount > 0 && (
              <div className="flex justify-between text-sm text-zinc-300">
                <span>VAT</span>
                <span>{formatNPR(bill.vatAmount)}</span>
              </div>
            )}
            <div className="border-t border-zinc-700 pt-2 flex justify-between items-center">
              <span className="text-white font-semibold text-base">Total</span>
              <span className="text-white font-bold text-xl">{formatNPR(bill.total)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="p-5 flex items-center gap-3">
            <PaymentBadge status={bill.paymentStatus} />
            {bill.paymentMethod && (
              <span className="text-zinc-400 text-sm">
                via {bill.paymentMethod.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Notes */}
          {bill.notes && (
            <div className="px-5 pb-5 border-t border-zinc-700">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mt-4 mb-1">Notes</p>
              <p className="text-zinc-400 text-sm">{bill.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs mt-6">Powered by Invo</p>
      </div>
    </div>
  )
}
