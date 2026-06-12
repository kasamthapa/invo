export interface CreateCustomerInput {
  name: string
  phone?: string
  address?: string
  note?: string
}

export interface UpdateCustomerInput {
  name?: string
  phone?: string
  address?: string
  note?: string
}

export interface CustomerResponse {
  id: string
  name: string
  phone: string | null
  address: string | null
  note: string | null
  totalOrders: number
  totalSpent: number
  createdAt: string
}

export interface CustomerDetailResponse extends CustomerResponse {
  recentBills: {
    id: string
    billNumber: number
    total: number
    paymentStatus: string
    createdAt: string
  }[]
}
