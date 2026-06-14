export interface PublicVariantResponse {
  id: string
  variantCode: string
  attributes: Record<string, string>
  price: number | null
  currentQty: number
  inStock: boolean
}

export interface PublicProductResponse {
  id: string
  code: string
  name: string
  description: string | null
  category: string | null
  basePrice: number
  images: { id: string; url: string; sortOrder: number }[]
  variants: PublicVariantResponse[]
  hasStock: boolean
}

export interface PublicStoreResponse {
  name: string
  slug: string
  phone: string | null
  products: PublicProductResponse[]
}
