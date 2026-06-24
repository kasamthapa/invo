import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, X, Plus, Minus, CheckCircle, Copy, ExternalLink } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { useCreateBill } from '../hooks/useBills'
import { formatNPR } from '../utils/money'
import { ApiError } from '../lib/api'
import type { Product, ProductVariant } from '../types/product'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BillLineItem {
  id: string
  variantId: string
  productName: string
  productCode: string
  variantCode: string
  attributesDisplay: string
  effectivePrice: number
  quantity: number
  maxQty: number
  lineTotal: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function attrsDisplay(attrs: Record<string, string>): string {
  return Object.values(attrs).join(' / ')
}

function effectivePrice(variant: ProductVariant, product: Product): number {
  return variant.price ?? product.basePrice
}

// ── Variant Picker modal ──────────────────────────────────────────────────────

function VariantPicker({
  product,
  onAdd,
  onClose,
}: {
  product: Product
  onAdd: (line: BillLineItem) => void
  onClose: () => void
}) {
  const inStockVariants = product.variants.filter((v) => v.currentQty > 0)
  const autoSelect = inStockVariants.length === 1 ? inStockVariants[0] : null

  const [selected, setSelected] = useState<ProductVariant | null>(autoSelect ?? null)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    setQty(1)
  }, [selected])

  function handleAdd() {
    if (!selected) return
    const price = effectivePrice(selected, product)
    onAdd({
      id: crypto.randomUUID(),
      variantId: selected.id,
      productName: product.name,
      productCode: product.code,
      variantCode: selected.variantCode,
      attributesDisplay: attrsDisplay(selected.attributes),
      effectivePrice: price,
      quantity: qty,
      maxQty: selected.currentQty,
      lineTotal: price * qty,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-zinc-900 rounded-t-2xl px-4 pt-4 pb-8 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-white font-semibold text-base">{product.name}</h3>
            <p className="text-zinc-400 text-xs mt-0.5">
              {product.code} · {formatNPR(product.basePrice)}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 active:opacity-70 ml-4 mt-0.5">
            <X size={20} />
          </button>
        </div>

        <div className="h-px bg-zinc-800 my-4" />

        {/* Variant pills */}
        <p className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Select variant</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {product.variants.map((v) => {
            const outOfStock = v.currentQty === 0
            const isSelected = selected?.id === v.id
            return (
              <button
                key={v.id}
                onClick={() => !outOfStock && setSelected(v)}
                disabled={outOfStock}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  outOfStock
                    ? 'bg-zinc-800 text-zinc-600 line-through cursor-not-allowed'
                    : isSelected
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-zinc-300 active:opacity-70'
                }`}
              >
                {attrsDisplay(v.attributes) || 'Default'}
                {!outOfStock && (
                  <span className={`ml-1.5 text-xs ${isSelected ? 'text-zinc-600' : 'text-zinc-500'}`}>
                    {v.currentQty}▸
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {selected && (
          <>
            <div className="h-px bg-zinc-800 mb-4" />

            {/* Qty stepper */}
            <p className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Quantity</p>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white active:opacity-70"
              >
                <Minus size={16} />
              </button>
              <span className="text-white text-xl font-semibold w-10 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(selected.currentQty, q + 1))}
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white active:opacity-70"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Price preview */}
            <p className="text-zinc-300 text-sm mb-4">
              {formatNPR(effectivePrice(selected, product))} × {qty} ={' '}
              <span className="text-white font-semibold">
                {formatNPR(effectivePrice(selected, product) * qty)}
              </span>
            </p>

            <button
              onClick={handleAdd}
              className="w-full bg-emerald-500 text-white font-semibold py-3.5 rounded-xl active:opacity-80"
            >
              Add to Bill
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Success screen ────────────────────────────────────────────────────────────

function SuccessScreen({ bill, onNew }: { bill: { id: string; billNumber: number; total: number; publicToken: string }; onNew: () => void }) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const publicUrl = `${window.location.origin}/bill/${bill.publicToken}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center gap-5">
      <CheckCircle size={56} className="text-emerald-500" />
      <div>
        <h2 className="text-white font-bold text-2xl">Bill Created</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Bill #{bill.billNumber} · {formatNPR(bill.total)}
        </p>
      </div>

      <div className="h-px bg-zinc-800 w-full" />

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={() => void handleCopy()}
          className="flex items-center justify-center gap-2 bg-zinc-800 text-white text-sm font-medium py-3 rounded-xl active:opacity-80"
        >
          <Copy size={16} />
          {copied ? 'Copied!' : 'Copy bill link'}
        </button>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-zinc-800 text-white text-sm font-medium py-3 rounded-xl active:opacity-80"
        >
          <ExternalLink size={16} />
          View bill
        </a>
      </div>

      <div className="h-px bg-zinc-800 w-full" />

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={onNew}
          className="bg-emerald-500 text-white font-semibold py-3 rounded-xl active:opacity-80"
        >
          + Create another bill
        </button>
        <button
          onClick={() => navigate('/app/bills')}
          className="text-zinc-400 text-sm active:opacity-70"
        >
          View all bills →
        </button>
      </div>
    </div>
  )
}

// ── Payment method / status pill selectors ────────────────────────────────────

function PillSelector({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            value === opt.value
              ? 'bg-white text-black font-medium'
              : 'bg-zinc-800 text-zinc-400 active:opacity-70'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

const PAYMENT_METHODS = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Khalti', value: 'KHALTI' },
  { label: 'eSewa', value: 'ESEWA' },
  { label: 'COD', value: 'COD' },
  { label: 'Bank', value: 'BANK_TRANSFER' },
]

const PAYMENT_STATUSES = [
  { label: 'Paid', value: 'PAID' },
  { label: 'Unpaid', value: 'UNPAID' },
  { label: 'COD Pending', value: 'COD_PENDING' },
]

// ── Main component ─────────────────────────────────────────────────────────────

export default function NewBill() {
  const { data: products } = useProducts()
  const createBill = useCreateBill()

  const [lines, setLines] = useState<BillLineItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [discount, setDiscount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [paymentStatus, setPaymentStatus] = useState('PAID')
  const [notes, setNotes] = useState('')
  const [search, setSearch] = useState('')
  const [pickerProduct, setPickerProduct] = useState<Product | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [createdBill, setCreatedBill] = useState<{ id: string; billNumber: number; total: number; publicToken: string } | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)

  // Computed
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
  const discountPaisa = Math.round(parseFloat(discount || '0') * 100)
  const total = Math.max(0, subtotal - discountPaisa)

  // Search results
  const searchResults =
    search.trim().length > 0 && products
      ? products.filter((p) => {
          const q = search.toLowerCase()
          return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
        }).slice(0, 6)
      : []

  function resetBill() {
    setLines([])
    setCustomerName('')
    setCustomerPhone('')
    setDiscount('')
    setPaymentMethod('CASH')
    setPaymentStatus('PAID')
    setNotes('')
    setSearch('')
    setGlobalError(null)
    setCreatedBill(null)
  }

  function handleClear() {
    if (lines.length > 0 && !confirm('Clear all bill items?')) return
    resetBill()
  }

  function updateLineQty(lineId: string, delta: number) {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== lineId) return l
        const newQty = Math.max(1, Math.min(l.maxQty, l.quantity + delta))
        return { ...l, quantity: newQty, lineTotal: l.effectivePrice * newQty }
      }),
    )
  }

  function removeLine(lineId: string) {
    setLines((prev) => prev.filter((l) => l.id !== lineId))
  }

  async function handleConfirm() {
    if (lines.length === 0 || total < 0 || createBill.isPending) return
    setGlobalError(null)
    try {
      const bill = await createBill.mutateAsync({
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        discount: discountPaisa > 0 ? discountPaisa : undefined,
        notes: notes.trim() || undefined,
        paymentMethod: paymentMethod || undefined,
        paymentStatus,
      })
      setCreatedBill({ id: bill.id, billNumber: bill.billNumber, total: bill.total, publicToken: bill.publicToken })
    } catch (err) {
      setGlobalError(err instanceof ApiError ? err.message : 'Something went wrong.')
    }
  }

  // Success screen
  if (createdBill) {
    return <SuccessScreen bill={createdBill} onNew={resetBill} />
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Picker modal */}
      {pickerProduct && (
        <VariantPicker
          product={pickerProduct}
          onAdd={(line) => {
            setLines((prev) => [...prev, line])
            setSearch('')
          }}
          onClose={() => setPickerProduct(null)}
        />
      )}

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 bg-zinc-900 px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-1 text-zinc-400 active:opacity-70">
            <ChevronLeft size={20} />
            <span className="text-sm">Home</span>
          </Link>
          <h1 className="text-white font-semibold">New Bill</h1>
          <button onClick={handleClear} className="text-zinc-400 text-sm active:opacity-70">
            Clear
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product by code or name…"
            className="w-full bg-zinc-800 text-white text-sm placeholder-zinc-500 rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-zinc-600"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
            >
              <X size={14} />
            </button>
          )}

          {/* Search dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 rounded-xl overflow-hidden shadow-xl z-30 border border-zinc-700">
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPickerProduct(p)
                    setSearch('')
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 active:bg-zinc-700 border-b border-zinc-700 last:border-0"
                >
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">{p.name}</p>
                    <p className="text-zinc-400 text-xs">
                      {p.code}
                      {p.category ? ` · ${p.category}` : ''}
                    </p>
                  </div>
                  <p className="text-zinc-300 text-sm flex-shrink-0 ml-3">
                    {formatNPR(p.basePrice)}
                  </p>
                </button>
              ))}
            </div>
          )}

          {search.trim().length > 0 && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 rounded-xl px-4 py-3 border border-zinc-700">
              <p className="text-zinc-500 text-sm">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-28">
        {/* Empty state */}
        {lines.length === 0 && (
          <div className="flex items-center justify-center min-h-[20vh]">
            <p className="text-zinc-600 text-sm text-center">
              Search for a product above to start building the bill
            </p>
          </div>
        )}

        {/* Line items */}
        {lines.length > 0 && (
          <div className="divide-y divide-zinc-800 mb-5">
            {lines.map((line) => (
              <div key={line.id} className="py-3">
                <div className="flex items-start justify-between">
                  <p className="text-white text-sm font-medium leading-tight flex-1 truncate pr-2">
                    {line.productName}
                  </p>
                  <button
                    onClick={() => removeLine(line.id)}
                    className="text-zinc-500 active:text-red-400 flex-shrink-0 mt-0.5"
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-2">
                    <p className="text-zinc-400 text-xs">{line.attributesDisplay}</p>
                    <span className="text-zinc-700 text-xs">×</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateLineQty(line.id, -1)}
                        className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-white active:opacity-70"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-white text-sm w-6 text-center font-medium">
                        {line.quantity}
                      </span>
                      <button
                        onClick={() => updateLineQty(line.id, 1)}
                        className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-white active:opacity-70"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                  <p className="text-white text-sm font-semibold">{formatNPR(line.lineTotal)}</p>
                </div>
                <p className="text-zinc-600 text-xs mt-0.5">
                  {line.variantCode} · {formatNPR(line.effectivePrice)}×{line.quantity}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Summary section */}
        {lines.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-zinc-800">
            {/* Customer */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">
                  Customer name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Discount */}
            <div>
              <label className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">
                Discount (NPR)
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 outline-none focus:border-zinc-500"
              />
            </div>

            {/* Payment method */}
            <div>
              <label className="text-zinc-500 text-xs uppercase tracking-wider block mb-2">
                Payment method
              </label>
              <PillSelector
                options={PAYMENT_METHODS}
                value={paymentMethod}
                onChange={setPaymentMethod}
              />
            </div>

            {/* Payment status */}
            <div>
              <label className="text-zinc-500 text-xs uppercase tracking-wider block mb-2">
                Payment status
              </label>
              <PillSelector
                options={PAYMENT_STATUSES}
                value={paymentStatus}
                onChange={setPaymentStatus}
              />
            </div>

            {/* Totals */}
            <div className="space-y-1 pt-2 border-t border-zinc-800">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-white">{formatNPR(subtotal)}</span>
              </div>
              {discountPaisa > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Discount</span>
                  <span className="text-red-400">-{formatNPR(discountPaisa)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-1">
                <span className="text-white">Total</span>
                <span className="text-white">{formatNPR(total)}</span>
              </div>
            </div>

            {globalError && (
              <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{globalError}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Sticky confirm button ── */}
      {lines.length > 0 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 md:left-60 right-0 px-4 pb-3 pt-2 bg-[var(--color-bg)]/95 backdrop-blur-sm border-t border-[var(--color-border)]">
          <button
            onClick={() => void handleConfirm()}
            disabled={lines.length === 0 || total < 0 || createBill.isPending}
            className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl text-base active:opacity-80 disabled:opacity-50"
          >
            {createBill.isPending ? 'Creating…' : `Confirm Bill — ${formatNPR(total)}`}
          </button>
        </div>
      )}
    </div>
  )
}
