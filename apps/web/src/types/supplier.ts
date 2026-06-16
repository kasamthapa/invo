export interface Supplier {
  id: string
  name: string
  phone: string | null
  note: string | null
  createdAt: string
}

export interface CreateSupplierInput {
  name: string
  phone?: string
  note?: string
}
