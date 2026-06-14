import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import config from '../config'
import type { CatalogStore, CatalogProduct, CatalogVariant } from '../types/catalog'
import { formatNPR } from '../utils/money'

function Spinner() {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="text-zinc-400 text-sm">Loading…</div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-zinc-300 text-lg font-medium">{message}</p>
        <p className="text-zinc-600 text-sm mt-2">Check the link and try again.</p>
      </div>
    </div>
  )
}

function ImagePlaceholder() {
  return (
    <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
      <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  )
}

function lowestPrice(product: CatalogProduct): number {
  const variantPrices = product.variants.map((v) => v.price ?? product.basePrice)
  return variantPrices.length > 0 ? Math.min(...variantPrices) : product.basePrice
}

function ProductCard({
  product,
  onClick,
}: {
  product: CatalogProduct
  onClick: () => void
}) {
  const firstImage = product.images[0]
  const price = lowestPrice(product)
  const variantCount = product.variants.length

  return (
    <div
      className="bg-zinc-800 rounded-xl overflow-hidden cursor-pointer active:scale-[0.97] transition-transform"
      onClick={onClick}
    >
      <div className="relative aspect-square">
        {firstImage ? (
          <img
            src={firstImage.url}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <ImagePlaceholder />
        )}
        {!product.hasStock && (
          <div className="absolute inset-0 bg-zinc-900/75 flex items-center justify-center">
            <span className="text-zinc-400 text-xs font-medium uppercase tracking-wide">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-white text-sm font-medium leading-tight line-clamp-2">{product.name}</p>
        <p className="text-zinc-300 text-sm mt-1">{formatNPR(price)}</p>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-zinc-500 text-xs">{product.code}</p>
          {variantCount > 1 && (
            <p className="text-zinc-500 text-xs">{variantCount} variants</p>
          )}
        </div>
      </div>
    </div>
  )
}

function VariantPill({ variant, basePrice }: { variant: CatalogVariant; basePrice: number }) {
  const label = Object.values(variant.attributes).join(' / ')
  const price = variant.price ?? basePrice

  return (
    <div
      className={`inline-flex flex-col items-center px-3 py-1.5 rounded-full border text-sm ${
        variant.inStock
          ? 'border-zinc-400 text-zinc-200'
          : 'border-zinc-700 text-zinc-600'
      }`}
    >
      <span className={variant.inStock ? '' : 'line-through'}>{label}</span>
      <span className={`text-xs mt-0.5 ${variant.inStock ? 'text-zinc-400' : 'text-zinc-700'}`}>
        {formatNPR(price)}
      </span>
    </div>
  )
}

function ProductModal({
  product,
  store,
  onClose,
}: {
  product: CatalogProduct
  store: CatalogStore
  onClose: () => void
}) {
  const firstImage = product.images[0]
  const price = lowestPrice(product)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative bg-zinc-800 rounded-t-2xl max-h-[85vh] overflow-y-auto w-full max-w-[480px] mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-zinc-400 hover:text-zinc-200 p-1"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <div className="aspect-square w-full">
          {firstImage ? (
            <img
              src={firstImage.url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImagePlaceholder />
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h2 className="text-white text-xl font-bold leading-snug">{product.name}</h2>
          <p className="text-zinc-500 text-sm mt-0.5">{product.code}</p>

          {product.description && (
            <p className="text-zinc-400 text-sm mt-3 leading-relaxed">{product.description}</p>
          )}

          <p className="text-white text-lg font-semibold mt-4">{formatNPR(price)}</p>

          {product.variants.length > 0 && (
            <>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mt-5 mb-2">
                Available options
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <VariantPill key={v.id} variant={v} basePrice={product.basePrice} />
                ))}
              </div>
            </>
          )}

          <div className="mt-6 space-y-3">
            <p className="text-zinc-400 text-sm text-center">
              DM us on Instagram / TikTok to order
            </p>
            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                className="block w-full bg-white text-black text-center font-semibold rounded-xl py-3 active:opacity-80"
              >
                Call to order · {store.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PublicCatalog() {
  const { slug } = useParams<{ slug: string }>()
  const [store, setStore] = useState<CatalogStore | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null)

  useEffect(() => {
    if (!slug) {
      setError('Store not found')
      setLoading(false)
      return
    }
    fetch(`${config.apiUrl}/store/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('not_found')
        return res.json() as Promise<CatalogStore>
      })
      .then((data) => {
        setStore(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Store not found')
        setLoading(false)
      })
  }, [slug])

  const closeModal = useCallback(() => setSelectedProduct(null), [])

  if (loading) return <Spinner />
  if (error || !store) return <ErrorState message={error ?? 'Store not found'} />

  const categories = ['All', ...Array.from(
    new Set(store.products.map((p) => p.category).filter((c): c is string => c !== null))
  )]

  const filteredProducts =
    activeCategory === 'All'
      ? store.products
      : store.products.filter((p) => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-zinc-900 pb-8">
      <div className="max-w-[480px] mx-auto">
        {/* Header */}
        <div className="pt-10 pb-6 px-4 text-center">
          <h1 className="text-2xl font-bold text-white">{store.name}</h1>
          <p className="text-zinc-400 text-sm mt-1">
            @{store.slug}
            {store.phone && <> · {store.phone}</>}
          </p>
        </div>

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex gap-2 px-4 pb-5 overflow-x-auto scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-white text-black'
                    : 'bg-zinc-700 text-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Product grid */}
        {filteredProducts.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-12">No products in this category.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs py-6 mt-4">Powered by Invo</p>
      </div>

      {/* Product modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          store={store}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
