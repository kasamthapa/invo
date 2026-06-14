import { prisma } from '../../lib/prisma.js'
import type {
  OwnerDashboard,
  StaffDashboard,
  LowStockAlert,
  RecentBill,
  DailySales,
} from './dashboard.types.js'

const NEPAL_OFFSET_MINUTES = 5 * 60 + 45

function getNepalDateBoundaries() {
  const now = new Date()
  const nepalNow = new Date(now.getTime() + NEPAL_OFFSET_MINUTES * 60 * 1000)
  const todayStr = nepalNow.toISOString().split('T')[0]!

  const todayStart = new Date(todayStr + 'T00:00:00+05:45')
  const todayEnd = new Date(todayStr + 'T23:59:59+05:45')

  const nepalYear = nepalNow.getUTCFullYear()
  const nepalMonth = nepalNow.getUTCMonth()
  const monthStartNepal = new Date(Date.UTC(nepalYear, nepalMonth, 1))
  const monthStartUTC = new Date(monthStartNepal.getTime() - NEPAL_OFFSET_MINUTES * 60 * 1000)

  const sevenDaysAgo = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000)

  return { todayStart, todayEnd, monthStartUTC, sevenDaysAgo, todayStr, nepalNow }
}

function toLowStockAlert(v: {
  id: string
  variantCode: string
  currentQty: number
  lowStockAt: number | null
  product: { name: string; code: string }
}): LowStockAlert {
  return {
    variantId: v.id,
    variantCode: v.variantCode,
    productName: v.product.name,
    productCode: v.product.code,
    currentQty: v.currentQty,
    lowStockAt: v.lowStockAt!,
  }
}

function toRecentBill(b: {
  id: string
  billNumber: number
  customerName: string | null
  total: number
  paymentStatus: string
  paymentMethod: string | null
  status: string
  createdAt: Date
}): RecentBill {
  return {
    id: b.id,
    billNumber: b.billNumber,
    customerName: b.customerName,
    total: b.total,
    paymentStatus: b.paymentStatus,
    paymentMethod: b.paymentMethod,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
  }
}

function buildLast7Days(
  bills: { total: number; createdAt: Date }[],
  todayStart: Date,
  todayStr: string,
): DailySales[] {
  const byDate = new Map<string, { revenue: number; billCount: number }>()

  for (const bill of bills) {
    const billNepal = new Date(bill.createdAt.getTime() + NEPAL_OFFSET_MINUTES * 60 * 1000)
    const dateStr = billNepal.toISOString().split('T')[0]!
    const existing = byDate.get(dateStr) ?? { revenue: 0, billCount: 0 }
    byDate.set(dateStr, {
      revenue: existing.revenue + bill.total,
      billCount: existing.billCount + 1,
    })
  }

  const result: DailySales[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000)
    const nepalD = new Date(d.getTime() + NEPAL_OFFSET_MINUTES * 60 * 1000)
    const dateStr = nepalD.toISOString().split('T')[0]!
    const data = byDate.get(dateStr) ?? { revenue: 0, billCount: 0 }
    result.push({ date: dateStr, ...data })
  }

  return result
}

export async function getOwnerDashboard(storeId: string): Promise<OwnerDashboard> {
  const { todayStart, todayEnd, monthStartUTC, sevenDaysAgo, todayStr } = getNepalDateBoundaries()

  const [
    todayBills,
    monthBillAgg,
    monthExpenseAgg,
    unpaidAgg,
    codPendingCount,
    totalProducts,
    totalVariants,
    lowStockVariants,
    recentBillsRaw,
    last7DaysBills,
  ] = await Promise.all([
    prisma.bill.findMany({
      where: { storeId, status: 'ACTIVE', createdAt: { gte: todayStart, lte: todayEnd } },
      select: { total: true, paymentStatus: true },
    }),
    prisma.bill.aggregate({
      where: { storeId, status: 'ACTIVE', createdAt: { gte: monthStartUTC } },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.expense.aggregate({
      where: { storeId, deletedAt: null, expenseDate: { gte: monthStartUTC } },
      _sum: { amount: true },
    }),
    prisma.bill.aggregate({
      where: { storeId, status: 'ACTIVE', paymentStatus: 'UNPAID' },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.bill.count({
      where: { storeId, status: 'ACTIVE', paymentStatus: 'COD_PENDING' },
    }),
    prisma.product.count({ where: { storeId, deletedAt: null } }),
    prisma.product_Variant.count({ where: { product: { storeId }, deletedAt: null } }),
    prisma.product_Variant.findMany({
      where: { product: { storeId, deletedAt: null }, deletedAt: null, lowStockAt: { not: null } },
      include: { product: true },
      orderBy: { currentQty: 'asc' },
    }),
    prisma.bill.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        billNumber: true,
        customerName: true,
        total: true,
        paymentStatus: true,
        paymentMethod: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.bill.findMany({
      where: { storeId, status: 'ACTIVE', createdAt: { gte: sevenDaysAgo } },
      select: { total: true, createdAt: true },
    }),
  ])

  const todayRevenue = todayBills.reduce((sum, b) => sum + b.total, 0)
  const todayBillCount = todayBills.length
  const todayAvgOrderValue =
    todayBillCount > 0 ? Math.round(todayRevenue / todayBillCount) : 0

  const monthRevenue = monthBillAgg._sum.total ?? 0
  const monthBillCount = monthBillAgg._count.id
  const monthExpenses = monthExpenseAgg._sum.amount ?? 0
  const monthProfit = monthRevenue - monthExpenses

  const unpaidBillCount = unpaidAgg._count.id
  const unpaidTotal = unpaidAgg._sum.total ?? 0

  const lowStockAlerts = lowStockVariants
    .filter((v) => v.currentQty <= v.lowStockAt!)
    .map(toLowStockAlert)

  return {
    todayRevenue,
    todayBillCount,
    todayAvgOrderValue,
    monthRevenue,
    monthBillCount,
    monthExpenses,
    monthProfit,
    unpaidBillCount,
    unpaidTotal,
    codPendingCount,
    totalProducts,
    totalVariants,
    lowStockAlerts,
    recentBills: recentBillsRaw.map(toRecentBill),
    last7Days: buildLast7Days(last7DaysBills, todayStart, todayStr),
  }
}

export async function getStaffDashboard(storeId: string): Promise<StaffDashboard> {
  const { todayStart, todayEnd } = getNepalDateBoundaries()

  const [
    todayBillCount,
    unpaidBillCount,
    codPendingCount,
    totalProducts,
    lowStockVariants,
    recentBillsRaw,
  ] = await Promise.all([
    prisma.bill.count({
      where: { storeId, status: 'ACTIVE', createdAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.bill.count({
      where: { storeId, status: 'ACTIVE', paymentStatus: 'UNPAID' },
    }),
    prisma.bill.count({
      where: { storeId, status: 'ACTIVE', paymentStatus: 'COD_PENDING' },
    }),
    prisma.product.count({ where: { storeId, deletedAt: null } }),
    prisma.product_Variant.findMany({
      where: { product: { storeId, deletedAt: null }, deletedAt: null, lowStockAt: { not: null } },
      include: { product: true },
      orderBy: { currentQty: 'asc' },
    }),
    prisma.bill.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        billNumber: true,
        customerName: true,
        total: true,
        paymentStatus: true,
        paymentMethod: true,
        status: true,
        createdAt: true,
      },
    }),
  ])

  const lowStockAlerts = lowStockVariants
    .filter((v) => v.currentQty <= v.lowStockAt!)
    .map(toLowStockAlert)

  return {
    todayBillCount,
    unpaidBillCount,
    codPendingCount,
    totalProducts,
    lowStockAlerts,
    recentBills: recentBillsRaw.map(toRecentBill),
  }
}
