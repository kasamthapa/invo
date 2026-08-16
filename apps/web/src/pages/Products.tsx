import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, ChevronRight, Search, Plus } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { formatNPR } from '../utils/money'
import type { Product } from '../types/product'

function totalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.currentQty, 0)
}

function hasLowStock(product: Product): boolean {
  return product.variants.some(
    (v) => v.lowStockAt !== null && v.currentQty <= v.lowStockAt,
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-14 h-14 rounded-lg bg-[var(--bg-surface)] flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[var(--bg-surface)] rounded w-3/4" />
        <div className="h-3 bg-[var(--bg-surface)] rounded w-1/2" />
        <div className="h-3 bg-[var(--bg-surface)] rounded w-1/3" />
      </div>
    </div>
  )
}

function ProductRow({ product }: { product: Product }) {
  const stock = totalStock(product)
  const lowStock = hasLowStock(product)
  const thumbnail = product.images[0]?.url ?? null

  return (
    <Link
      to={`/app/products/${product.id}`}
      className="flex items-center gap-3 px-4 py-3 active:bg-[var(--bg-surface)]/60 transition-colors"
    >
      <div className="w-14 h-14 rounded-lg bg-[var(--bg-surface)] flex-shrink-0 overflow-hidden flex items-center justify-center">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package size={24} className="text-[var(--text-muted)]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[var(--text-primary)] text-sm font-medium truncate">{product.name}</p>
          {lowStock && (
            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
          )}
        </div>
        <p className="text-[var(--text-secondary)] text-xs mt-0.5 truncate">
          {product.code}
          {product.category ? ` · ${product.category}` : ''}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[var(--text-muted)] text-xs">
            {product.variants.length} {product.variants.length === 1 ? 'variant' : 'variants'}
          </span>
          <span className="text-[var(--text-muted)] text-xs">·</span>
          {stock === 0 ? (
            <span className="text-[var(--danger)] text-xs">Out of stock</span>
          ) : (
            <span className="text-[var(--text-muted)] text-xs">{stock} in stock</span>
          )}
        </div>
        <p className="text-[var(--text-secondary)] text-xs mt-0.5">{formatNPR(product.basePrice)}</p>
      </div>

      <ChevronRight size={16} className="text-[var(--text-muted)] flex-shrink-0" />
    </Link>
  )
}

function ProductTableRow({ product }: { product: Product }) {
  const stock = totalStock(product)
  const lowStock = hasLowStock(product)
  const thumbnail = product.images[0]?.url ?? null
  const navigate = useNavigate()

  return (
    <tr
      onClick={() => navigate(`/app/products/${product.id}`)}
      className="cursor-pointer border-t border-[var(--border)] hover:bg-[var(--bg-surface-2)]/60 transition-colors"
    >
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface-2)] flex-shrink-0 overflow-hidden flex items-center justify-center">
            {thumbnail ? (
              <img src={thumbnail} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package size={16} className="text-[var(--text-muted)]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[var(--text-primary)] text-sm font-medium truncate">{product.name}</p>
              {lowStock && <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] flex-shrink-0" />}
            </div>
            <p className="text-[var(--text-muted)] text-xs truncate">{product.code}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-2.5 text-[var(--text-secondary)] text-sm">{product.category ?? '—'}</td>
      <td className="px-4 py-2.5 text-[var(--text-secondary)] text-sm">
        {product.variants.length} {product.variants.length === 1 ? 'variant' : 'variants'}
      </td>
      <td className="px-4 py-2.5 text-sm">
        {stock === 0 ? (
          <span className="text-[var(--danger)]">Out of stock</span>
        ) : (
          <span className={lowStock ? 'text-[var(--warning)]' : 'text-[var(--text-secondary)]'}>{stock} in stock</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-right text-[var(--text-primary)] text-sm font-semibold tabular-nums">
        {formatNPR(product.basePrice)}
      </td>
    </tr>
  )
}

export default function Products() {
  const [search, setSearch] = useState('')
  const { data: products, isLoading, isError, refetch } = useProducts()

  const filtered = products?.filter((p) => {
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
  }) ?? []

  return (
    <div className="flex flex-col min-h-full">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[var(--bg-app)] px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[var(--text-primary)] font-semibold text-lg">Products</h1>
            {products && (
              <p className="text-[var(--text-secondary)] text-xs">{products.length} products</p>
            )}
          </div>
          <Link
            to="/app/products/new"
            className="flex items-center gap-1 bg-[var(--accent)] text-[var(--text-primary)] text-xs font-medium px-3 py-1.5 rounded-lg active:opacity-80"
          >
            <Plus size={14} />
            Add
          </Link>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm placeholder-[var(--text-placeholder)] rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-[var(--accent)]/20"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {isLoading && (
          <div className="divide-y divide-[var(--border)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] px-6 text-center gap-3">
            <p className="text-[var(--text-secondary)] text-sm">Couldn't load products.</p>
            <button
              onClick={() => void refetch()}
              className="text-[var(--success)] text-sm font-medium active:opacity-70"
            >
              Tap to retry
            </button>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] px-6 text-center gap-4">
            <Package size={40} className="text-[var(--text-muted)]" />
            {search ? (
              <p className="text-[var(--text-muted)] text-sm">No products match "{search}"</p>
            ) : (
              <>
                <p className="text-[var(--text-secondary)] text-sm">No products yet.</p>
                <p className="text-[var(--text-muted)] text-xs">Add your first product to get started.</p>
                <Link
                  to="/app/products/new"
                  className="bg-[var(--accent)] text-[var(--text-primary)] text-sm font-medium px-5 py-2.5 rounded-xl active:opacity-80"
                >
                  Add Product
                </Link>
              </>
            )}
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <>
            {/* Mobile: list */}
            <div className="md:hidden divide-y divide-[var(--border)]">
              {filtered.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block px-4 pb-6">
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--bg-surface-2)]/60 border-b border-[var(--border)]">
                      <th className="text-left font-medium text-[var(--text-muted)] text-xs uppercase tracking-wider px-4 py-2.5">Product</th>
                      <th className="text-left font-medium text-[var(--text-muted)] text-xs uppercase tracking-wider px-4 py-2.5">Category</th>
                      <th className="text-left font-medium text-[var(--text-muted)] text-xs uppercase tracking-wider px-4 py-2.5">Variants</th>
                      <th className="text-left font-medium text-[var(--text-muted)] text-xs uppercase tracking-wider px-4 py-2.5">Stock</th>
                      <th className="text-right font-medium text-[var(--text-muted)] text-xs uppercase tracking-wider px-4 py-2.5">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((product) => (
                      <ProductTableRow key={product.id} product={product} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
