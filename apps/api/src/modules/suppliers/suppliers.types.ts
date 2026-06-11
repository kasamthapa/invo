export interface CreateSupplierInput {
  name: string
  phone?: string
  note?: string
}

export interface UpdateSupplierInput {
  name?: string
  phone?: string
  note?: string
}

export interface SupplierResponse {
  id: string
  name: string
  phone: string | null
  note: string | null
  createdAt: string
}
