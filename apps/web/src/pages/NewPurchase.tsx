import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, X, Plus, Minus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../hooks/useProducts'
import { useSuppliers } from '../hooks/useSuppliers'
import { useCreatePurchase } from '../hooks/usePurchases'
import { formatNPR } from '../utils/money'
import { ApiError } from '../lib/api'
import type { Product, ProductVariant } from '../types/product'

function OwnerGate() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 px-6 text-center">
      <p className="text-zinc-400 text-sm font-medium">Owner access required</p>
      <p className="text-zinc-600 text-xs">This section is only available to store owners.</p>
    </div>
  )
}

interface PurchaseLine {
  id: string
  variantId: string
  variantCode: string
  productName: string
  attributesDisplay: string
  quantity: number
  costPriceNPR: string
}

function attrsDisplay(attrs: Record<string, string>): string {
  return Object.values(attrs).join(' / ')
}

function VariantPicker({
  product,
  onAdd,
  onClose,
}: {
  product: Product
  onAdd: (line: PurchaseLine) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<ProductVariant | null>(
    product.variants.length === 1 ? product.variants[0] : null,
  )
  const [qty, setQty] = useState(1)
  const [costPriceNPR, setCostPriceNPR] = useState('')

  function handleAdd() {
    if (!selected || !costPriceNPR) return
    onAdd({
      id: crypto.randomUUID(),
      variantId: selected.id,
      variantCode: selected.variantCode,
      productName: product.name,
      attributesDisplay: attrsDisplay(selected.attributes),
      quantity: qty,
      costPriceNPR,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-zinc-900 rounded-t-2xl px-4 pt-4 pb-8 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-white font-semibold text-base">{product.name}</h3>
            <p className="text-zinc-400 text-xs mt-0.5">{product.code}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 active:opacity-70 ml-4">
            <X size={20} />
          </button>
        </div>

        <div className="h-px bg-zinc-800 mb-4" />

        {/* Variant selection */}
        <p className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Select variant</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {product.variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelected(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selected?.id === v.id
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-300 active:opacity-70'
              }`}
            >
              {attrsDisplay(v.attributes) || 'Default'}
            </button>
          ))}
        </div>

        {selected && (
          <>
            <div className="h-px bg-zinc-800 mb-4" />

            {/* Cost price */}
            <p className="text-zinc-400 text-xs uppercase tracking-wider mb-2">Cost price (NPR) *</p>
            <input
              type="number"
              value={costPriceNPR}
              onChange={(e) => setCostPriceNPR(e.target.value)}
              placeholder="e.g. 800"
              min="0"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 outline-none focus:border-zinc-500 mb-4"
            />

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
                onClick={() => setQty((q) => q + 1)}
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white active:opacity-70"
              >
                <Plus size={16} />
              </button>
            </div>

            {costPriceNPR && parseFloat(costPriceNPR) > 0 && (
              <p className="text-zinc-300 text-sm mb-4">
                {formatNPR(Math.round(parseFloat(costPriceNPR) * 100))} × {qty} ={' '}
                <span className="text-white font-semibold">
                  {formatNPR(Math.round(parseFloat(costPriceNPR) * 100) * qty)}
                </span>
              </p>
            )}

            <button
              onClick={handleAdd}
              disabled={!costPriceNPR || parseFloat(costPriceNPR) <= 0}
              className="w-full bg-emerald-500 text-white font-semibold py-3.5 rounded-xl active:opacity-80 disabled:opacity-40"
            >
              Add to Purchase
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function NewPurchase() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: products } = useProducts()
  const { data: suppliers } = useSuppliers()
  const createPurchase = useCreatePurchase()

  const [lines, setLines] = useState<PurchaseLine[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split('T')[0]!,
  )
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')
  const [pickerProduct, setPickerProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (user?.role !== 'OWNER') return <OwnerGate />

  const searchResults =
    search.trim().length > 0 && products
      ? products
          .filter((p) => {
            const q = search.toLowerCase()
            return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
          })
          .slice(0, 6)
      : []

  const totalCostPaisa = lines.reduce((sum, l) => {
    const cost = Math.round(parseFloat(l.costPriceNPR || '0') * 100)
    return sum + cost * l.quantity
  }, 0)

  function updateQty(lineId: string, delta: number) {
    setLines((prev) =>
      prev.map((l) =>
        l.id === lineId ? { ...l, quantity: Math.max(1, l.quantity + delta) } : l,
      ),
    )
  }

  function removeLine(lineId: string) {
    setLines((prev) => prev.filter((l) => l.id !== lineId))
  }

  async function handleSubmit() {
    if (lines.length === 0) { setError('Add at least one item.'); return }
    setError(null)
    try {
      await createPurchase.mutateAsync({
        supplierId: supplierId || undefined,
        purchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : undefined,
        note: note.trim() || undefined,
        items: lines.map((l) => ({
          variantId: l.variantId,
          quantity: l.quantity,
          costPrice: Math.round(parseFloat(l.costPriceNPR) * 100),
        })),
      })
      navigate('/app/purchases')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to record purchase.')
    }
  }

  return (
    <div className="flex flex-col min-h-full">
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

      {/* Header */}
      <div className="sticky top-0 z-20 bg-zinc-900 px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <Link to="/app/purchases" className="flex items-center gap-1 text-zinc-400 active:opacity-70">
            <ChevronLeft size={20} />
            <span className="text-sm">Purchases</span>
          </Link>
          <h1 className="text-white font-semibold">New Purchase</h1>
          <div className="w-20" />
        </div>

        {/* Product search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product to add…"
            className="w-full bg-zinc-800 text-white text-sm placeholder-zinc-500 rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-zinc-600"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <X size={14} />
            </button>
          )}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 rounded-xl overflow-hidden shadow-xl z-30 border border-zinc-700">
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPickerProduct(p); setSearch('') }}
                  className="w-full flex items-center justify-between px-4 py-3 active:bg-zinc-700 border-b border-zinc-700 last:border-0"
                >
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">{p.name}</p>
                    <p className="text-zinc-400 text-xs">{p.code}</p>
                  </div>
                  <p className="text-zinc-400 text-xs">{p.variants.length} variants</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-28 space-y-5 mt-2">
        {/* Line items */}
        {lines.length > 0 && (
          <div className="divide-y divide-zinc-800">
            {lines.map((line) => (
              <div key={line.id} className="py-3">
                <div className="flex items-start justify-between">
                  <p className="text-white text-sm font-medium truncate flex-1 pr-2">{line.productName}</p>
                  <button onClick={() => removeLine(line.id)} className="text-zinc-500 active:text-red-400">
                    <X size={15} />
                  </button>
                </div>
                <p className="text-zinc-500 text-xs mt-0.5">{line.variantCode} · {line.attributesDisplay}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(line.id, -1)} className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center active:opacity-70">
                      <Minus size={12} className="text-white" />
                    </button>
                    <span className="text-white text-sm font-medium w-6 text-center">{line.quantity}</span>
                    <button onClick={() => updateQty(line.id, 1)} className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center active:opacity-70">
                      <Plus size={12} className="text-white" />
                    </button>
                  </div>
                  <p className="text-zinc-300 text-sm">
                    {formatNPR(Math.round(parseFloat(line.costPriceNPR) * 100))} × {line.quantity} ={' '}
                    <span className="text-white font-semibold">
                      {formatNPR(Math.round(parseFloat(line.costPriceNPR) * 100) * line.quantity)}
                    </span>
                  </p>
                </div>
              </div>
            ))}
            <div className="pt-3 flex justify-between">
              <span className="text-zinc-400 text-sm">Total cost</span>
              <span className="text-white font-bold text-base">{formatNPR(totalCostPaisa)}</span>
            </div>
          </div>
        )}

        {lines.length === 0 && (
          <p className="text-zinc-600 text-sm text-center py-6">Search for a product above to add items.</p>
        )}

        {/* Purchase details */}
        <div className="space-y-4 pt-2 border-t border-zinc-800">
          {/* Supplier */}
          <div>
            <label className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Supplier (optional)</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-zinc-500"
            >
              <option value="">No supplier</option>
              {suppliers?.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Purchase date */}
          <div>
            <label className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Purchase date</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-zinc-500"
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. June restock"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 outline-none focus:border-zinc-500"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-3">{error}</p>
        )}
      </div>

      {/* Sticky submit */}
      {lines.length > 0 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 md:left-60 right-0 px-4 pb-3 pt-2 bg-[var(--color-bg)]/95 backdrop-blur-sm border-t border-[var(--color-border)]">
          <button
            onClick={() => void handleSubmit()}
            disabled={createPurchase.isPending}
            className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl text-base active:opacity-80 disabled:opacity-50"
          >
            {createPurchase.isPending ? 'Recording…' : `Record Purchase — ${formatNPR(totalCostPaisa)}`}
          </button>
        </div>
      )}
    </div>
  )
}
