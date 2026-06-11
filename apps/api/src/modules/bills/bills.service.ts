import { nanoid } from 'nanoid'
import { prisma } from '../../lib/prisma.js'
import type { Bill, BillItem } from '@prisma/client'
import type {
  CreateBillInput,
  UpdatePaymentInput,
  BillResponse,
  BillItemResponse,
} from './bills.types.js'

// ---------- Helpers ----------

function toBillItemResponse(item: BillItem): BillItemResponse {
  return {
    id: item.id,
    variantId: item.variantId,
    productCodeSnap: item.productCodeSnap,
    productNameSnap: item.productNameSnap,
    attributesSnap: item.attributesSnap as Record<string, string>,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
  }
}

function toBillResponse(bill: Bill & { items: BillItem[] }): BillResponse {
  return {
    id: bill.id,
    billNumber: bill.billNumber,
    publicToken: bill.publicToken,
    customerName: bill.customerName,
    customerPhone: bill.customerPhone,
    customerAddress: bill.customerAddress,
    customerId: bill.customerId,
    subtotal: bill.subtotal,
    discount: bill.discount,
    vatAmount: bill.vatAmount,
    total: bill.total,
    paymentStatus: bill.paymentStatus,
    paymentMethod: bill.paymentMethod,
    paymentProofUrl: bill.paymentProofUrl,
    status: bill.status,
    notes: bill.notes,
    items: bill.items.map(toBillItemResponse),
    createdAt: bill.createdAt.toISOString(),
  }
}

const billInclude = {
  items: { orderBy: { createdAt: 'asc' as const } },
}

// ---------- Service functions ----------

export async function createBill(
  storeId: string,
  createdById: string,
  input: CreateBillInput
): Promise<BillResponse> {
  if (input.items.length < 1) throw new Error('NO_ITEMS')

  const bill = await prisma.$transaction(async (tx) => {
    // Step 1: fetch variants + products
    const fetched = new Map<
      string,
      { variant: { id: string; variantCode: string; price: number | null; currentQty: number; attributes: unknown; deletedAt: Date | null }; product: { id: string; storeId: string; code: string; name: string; basePrice: number } }
    >()

    for (const item of input.items) {
      const variant = await tx.product_Variant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      })
      if (!variant || variant.deletedAt !== null || variant.product.storeId !== storeId) {
        throw new Error('VARIANT_NOT_FOUND')
      }
      fetched.set(item.variantId, { variant, product: variant.product })
    }

    // Step 2: stock check
    for (const item of input.items) {
      const { variant } = fetched.get(item.variantId)!
      if (variant.currentQty < item.quantity) {
        throw new Error(`INSUFFICIENT_STOCK:${variant.variantCode}`)
      }
    }

    // Step 3: compute totals
    let subtotal = 0
    const lineData: { unitPrice: number; lineTotal: number }[] = []
    for (const item of input.items) {
      const { variant, product } = fetched.get(item.variantId)!
      const unitPrice = item.unitPrice ?? variant.price ?? product.basePrice
      const lineTotal = unitPrice * item.quantity
      subtotal += lineTotal
      lineData.push({ unitPrice, lineTotal })
    }
    const discount = input.discount ?? 0
    const vatAmount = 0
    const total = subtotal - discount + vatAmount
    if (total < 0) throw new Error('INVALID_TOTAL')

    // Step 4: bill number
    const result = await tx.$queryRaw<{ max: bigint | null }[]>`
      SELECT MAX("billNumber") as max FROM "Bill" WHERE "storeId" = ${storeId}
    `
    const billNumber = Number(result[0]?.max ?? 0) + 1

    // Step 5: public token
    const publicToken = nanoid(12)

    // Step 6: create Bill
    const bill = await tx.bill.create({
      data: {
        storeId,
        billNumber,
        publicToken,
        customerId: input.customerId ?? null,
        customerName: input.customerName ?? null,
        customerPhone: input.customerPhone ?? null,
        customerAddress: input.customerAddress ?? null,
        subtotal,
        discount,
        vatAmount,
        total,
        paymentStatus: input.paymentStatus ?? 'UNPAID',
        paymentMethod: input.paymentMethod ?? null,
        status: 'ACTIVE',
        notes: input.notes ?? null,
        createdById,
      },
    })

    // Steps 7-9: BillItems + StockMovements + qty decrements
    for (let i = 0; i < input.items.length; i++) {
      const item = input.items[i]
      const { variant, product } = fetched.get(item.variantId)!
      const { unitPrice, lineTotal } = lineData[i]

      await tx.billItem.create({
        data: {
          billId: bill.id,
          variantId: item.variantId,
          productCodeSnap: product.code,
          productNameSnap: product.name,
          attributesSnap: variant.attributes as object,
          unitPrice,
          quantity: item.quantity,
          lineTotal,
        },
      })

      await tx.stockMovement.create({
        data: {
          storeId,
          variantId: item.variantId,
          delta: -item.quantity,
          reason: 'SALE',
          refType: 'bill',
          refId: bill.id,
          createdById,
        },
      })

      await tx.product_Variant.update({
        where: { id: item.variantId },
        data: { currentQty: { decrement: item.quantity } },
      })
    }

    // Step 10: return full bill with items
    return tx.bill.findUniqueOrThrow({
      where: { id: bill.id },
      include: billInclude,
    })
  })

  return toBillResponse(bill)
}

export async function getBills(storeId: string): Promise<BillResponse[]> {
  const bills = await prisma.bill.findMany({
    where: { storeId },
    include: billInclude,
    orderBy: { billNumber: 'desc' },
  })
  return bills.map(toBillResponse)
}

export async function getBill(storeId: string, billId: string): Promise<BillResponse> {
  const bill = await prisma.bill.findFirst({
    where: { id: billId, storeId },
    include: billInclude,
  })
  if (!bill) throw new Error('NOT_FOUND')
  return toBillResponse(bill)
}

export async function getBillByToken(publicToken: string): Promise<BillResponse> {
  const bill = await prisma.bill.findUnique({
    where: { publicToken },
    include: billInclude,
  })
  if (!bill) throw new Error('NOT_FOUND')
  return toBillResponse(bill)
}

export async function updatePayment(
  storeId: string,
  billId: string,
  input: UpdatePaymentInput
): Promise<BillResponse> {
  const existing = await prisma.bill.findFirst({ where: { id: billId, storeId } })
  if (!existing) throw new Error('NOT_FOUND')
  if (existing.status === 'VOIDED') throw new Error('BILL_VOIDED')

  const bill = await prisma.bill.update({
    where: { id: billId },
    data: {
      paymentStatus: input.paymentStatus,
      ...(input.paymentMethod !== undefined && { paymentMethod: input.paymentMethod }),
      ...(input.paymentProofUrl !== undefined && { paymentProofUrl: input.paymentProofUrl }),
    },
    include: billInclude,
  })
  return toBillResponse(bill)
}

export async function voidBill(
  storeId: string,
  billId: string,
  createdById: string
): Promise<BillResponse> {
  const bill = await prisma.$transaction(async (tx) => {
    const bill = await tx.bill.findFirst({
      where: { id: billId, storeId },
      include: billInclude,
    })
    if (!bill) throw new Error('NOT_FOUND')
    if (bill.status === 'VOIDED') throw new Error('ALREADY_VOIDED')

    await tx.bill.update({ where: { id: billId }, data: { status: 'VOIDED' } })

    for (const item of bill.items) {
      await tx.stockMovement.create({
        data: {
          storeId,
          variantId: item.variantId,
          delta: item.quantity,
          reason: 'VOID_REVERSAL',
          refType: 'bill',
          refId: bill.id,
          createdById,
        },
      })

      await tx.product_Variant.update({
        where: { id: item.variantId },
        data: { currentQty: { increment: item.quantity } },
      })
    }

    return tx.bill.findUniqueOrThrow({
      where: { id: billId },
      include: billInclude,
    })
  })

  return toBillResponse(bill)
}
