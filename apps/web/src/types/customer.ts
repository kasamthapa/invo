export interface Customer {
  id: string
  name: string
  phone: string | null
  address: string | null
  note: string | null
  totalOrders: number
  totalSpent: number
  createdAt: string
}

export interface CustomerDetail extends Customer {
  recentBills: {
    id: string
    billNumber: number
    total: number
    paymentStatus: string
    createdAt: string
  }[]
}

export interface CreateCustomerInput {
  name: string
  phone?: string
  address?: string
  note?: string
}
