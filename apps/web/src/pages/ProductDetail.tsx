import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Package } from 'lucide-react'
import { useProduct } from '../hooks/useProducts'
import { formatNPR } from '../utils/money'
import type { ProductVariant } from '../types/product'

function VariantRow({ variant, basePrice }: { variant: ProductVariant; basePrice: number }) {
  const effectivePrice = variant.price ?? basePrice
  const isOutOfStock = variant.currentQty === 0
  const isLowStock =
    !isOutOfStock && variant.lowStockAt !== null && variant.currentQty <= variant.lowStockAt

  const attributeLabel = Object.values(variant.attributes).join(' / ')

  return (
    <div className="bg-zinc-800 rounded-xl px-4 py-3 space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-white text-sm font-medium">{attributeLabel || 'Default'}</p>
        <p className="text-white text-sm">{formatNPR(effectivePrice)}</p>
      </div>
      <p className="text-zinc-500 text-xs">{variant.variantCode}</p>
      <div className="flex items-center gap-2">
        {isOutOfStock ? (
          <span className="text-xs text-red-400 font-medium">Out of stock</span>
        ) : (
          <span className="text-xs text-zinc-400">{variant.currentQty} in stock</span>
        )}
        {isLowStock && (
          <span className="text-xs text-amber-400 font-medium bg-amber-400/10 px-2 py-0.5 rounded-full">
            Low stock
          </span>
        )}
      </div>
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading, isError } = useProduct(id ?? '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-6 text-center">
        <p className="text-zinc-400 text-sm">Product not found.</p>
        <Link to="/app/products" className="text-emerald-400 text-sm font-medium active:opacity-70">
          ← Back to products
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-6">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <Link
          to="/app/products"
          className="flex items-center gap-1 text-zinc-400 active:opacity-70"
        >
          <ChevronLeft size={20} />
          <span className="text-sm">Products</span>
        </Link>
        <Link
          to={`/app/products/${product.id}/edit`}
          className="text-emerald-400 text-sm font-medium active:opacity-70"
        >
          Edit
        </Link>
      </div>

      {/* Image gallery */}
      {product.images.length > 0 ? (
        <div className="overflow-x-auto flex gap-3 px-4 snap-x snap-mandatory">
          {product.images.map((img) => (
            <img
              key={img.id}
              src={img.url}
              alt={product.name}
              className="w-[80vw] max-w-[360px] aspect-square object-cover rounded-xl flex-shrink-0 snap-start"
            />
          ))}
        </div>
      ) : (
        <div className="mx-4 aspect-square max-w-[360px] bg-zinc-800 rounded-xl flex items-center justify-center">
          <Package size={48} className="text-zinc-600" />
        </div>
      )}

      {/* Product info */}
      <div className="px-4 mt-4 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-white font-semibold text-xl leading-tight flex-1">{product.name}</h1>
          <p className="text-white font-medium text-lg flex-shrink-0">{formatNPR(product.basePrice)}</p>
        </div>
        <p className="text-zinc-400 text-sm">
          {product.code}
          {product.category ? ` · ${product.category}` : ''}
        </p>
        {product.description && (
          <p className="text-zinc-400 text-sm pt-1 leading-relaxed">{product.description}</p>
        )}
      </div>

      {/* Variants */}
      <div className="px-4 mt-6 space-y-3">
        <h2 className="text-white font-medium text-base">
          Variants ({product.variants.length})
        </h2>
        {product.variants.map((variant) => (
          <VariantRow key={variant.id} variant={variant} basePrice={product.basePrice} />
        ))}
      </div>
    </div>
  )
}
