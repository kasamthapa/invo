export interface CatalogVariant {
  id: string
  variantCode: string
  attributes: Record<string, string>
  price: number | null
  currentQty: number
  inStock: boolean
}

export interface CatalogProduct {
  id: string
  code: string
  name: string
  description: string | null
  category: string | null
  basePrice: number
  images: { id: string; url: string; sortOrder: number }[]
  variants: CatalogVariant[]
  hasStock: boolean
}

export interface CatalogStore {
  name: string
  slug: string
  phone: string | null
  products: CatalogProduct[]
}
