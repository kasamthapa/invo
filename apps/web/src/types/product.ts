export interface ProductVariant {
  id: string
  variantCode: string
  attributes: Record<string, string>
  price: number | null
  currentQty: number
  lowStockAt: number | null
}

export interface ProductImage {
  id: string
  url: string
  sortOrder: number
  variantId: string | null
}

export interface Product {
  id: string
  code: string
  name: string
  description: string | null
  category: string | null
  basePrice: number
  visible: boolean
  images: ProductImage[]
  variants: ProductVariant[]
  createdAt: string
}
