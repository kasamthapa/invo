export interface LowStockAlert {
  variantId: string
  variantCode: string
  productName: string
  productCode: string
  currentQty: number
  lowStockAt: number
}

export interface RecentBill {
  id: string
  billNumber: number
  customerName: string | null
  total: number
  paymentStatus: string
  paymentMethod: string | null
  status: string
  createdAt: string
}

export interface DailySales {
  date: string
  revenue: number
  billCount: number
}

export interface DashboardData {
  todayRevenue: number
  todayBillCount: number
  todayAvgOrderValue: number
  monthRevenue?: number
  monthBillCount?: number
  monthExpenses?: number
  monthProfit?: number
  unpaidBillCount: number
  unpaidTotal?: number
  codPendingCount: number
  totalProducts: number
  totalVariants: number
  lowStockAlerts: LowStockAlert[]
  recentBills: RecentBill[]
  last7Days: DailySales[]
}
