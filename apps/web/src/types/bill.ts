export interface BillItemInput {
  variantId: string
  quantity: number
  unitPrice?: number
}

export interface CreateBillInput {
  customerId?: string
  customerName?: string
  customerPhone?: string
  customerAddress?: string
  items: BillItemInput[]
  discount?: number
  notes?: string
  paymentMethod?: string
  paymentStatus?: string
}

export interface BillItem {
  id: string
  variantId: string
  productCodeSnap: string
  productNameSnap: string
  attributesSnap: Record<string, string>
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface Bill {
  id: string
  billNumber: number
  publicToken: string
  customerName: string | null
  customerPhone: string | null
  customerAddress: string | null
  customerId: string | null
  subtotal: number
  discount: number
  vatAmount: number
  total: number
  paymentStatus: string
  paymentMethod: string | null
  paymentProofUrl: string | null
  status: string
  notes: string | null
  items: BillItem[]
  createdAt: string
}
