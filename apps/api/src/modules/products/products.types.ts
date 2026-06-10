export interface CreateVariantInput {
  attributes: Record<string, string>
  price?: number
  lowStockAt?: number
  openingStock?: number
}

export interface CreateProductInput {
  code: string
  name: string
  description?: string
  category?: string
  basePrice: number
  visible?: boolean
  variants: CreateVariantInput[]
}

export interface UpdateProductInput {
  name?: string
  description?: string
  category?: string
  basePrice?: number
  visible?: boolean
}

export interface UpdateVariantInput {
  price?: number
  lowStockAt?: number
  attributes?: Record<string, string>
}

export interface VariantResponse {
  id: string
  variantCode: string
  attributes: Record<string, string>
  price: number | null
  currentQty: number
  lowStockAt: number | null
}

export interface ProductResponse {
  id: string
  code: string
  name: string
  description: string | null
  category: string | null
  basePrice: number
  visible: boolean
  images: { id: string; url: string; sortOrder: number; variantId: string | null }[]
  variants: VariantResponse[]
  createdAt: string
}
