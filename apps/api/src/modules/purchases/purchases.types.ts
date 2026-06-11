export interface PurchaseItemInput {
  variantId: string
  quantity: number
  costPrice: number
}

export interface CreatePurchaseInput {
  supplierId?: string
  purchaseDate?: string
  items: PurchaseItemInput[]
  note?: string
}

export interface PurchaseItemResponse {
  id: string
  variantId: string
  variantCode: string
  productName: string
  quantity: number
  costPrice: number
  lineTotal: number
}

export interface PurchaseResponse {
  id: string
  supplierId: string | null
  supplierName: string | null
  purchaseDate: string
  totalCost: number
  note: string | null
  items: PurchaseItemResponse[]
  createdAt: string
}
