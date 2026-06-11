import { prisma } from '../../lib/prisma.js'
import type { Prisma } from '@prisma/client'
import type {
  CreatePurchaseInput,
  PurchaseItemResponse,
  PurchaseResponse,
} from './purchases.types.js'

function toPurchaseItemResponse(item: {
  id: string
  variantId: string
  quantity: number
  costPrice: number
  lineTotal: number
  variant: {
    variantCode: string
    product: { name: string }
  }
}): PurchaseItemResponse {
  return {
    id: item.id,
    variantId: item.variantId,
    variantCode: item.variant.variantCode,
    productName: item.variant.product.name,
    quantity: item.quantity,
    costPrice: item.costPrice,
    lineTotal: item.lineTotal,
  }
}

function toPurchaseResponse(purchase: {
  id: string
  supplierId: string | null
  supplier: { name: string } | null
  purchaseDate: Date
  totalCost: number
  note: string | null
  items: Array<{
    id: string
    variantId: string
    quantity: number
    costPrice: number
    lineTotal: number
    variant: { variantCode: string; product: { name: string } }
  }>
  createdAt: Date
}): PurchaseResponse {
  return {
    id: purchase.id,
    supplierId: purchase.supplierId,
    supplierName: purchase.supplier?.name ?? null,
    purchaseDate: purchase.purchaseDate.toISOString(),
    totalCost: purchase.totalCost,
    note: purchase.note,
    items: purchase.items.map(toPurchaseItemResponse),
    createdAt: purchase.createdAt.toISOString(),
  }
}

const itemInclude = {
  variant: {
    include: { product: true },
  },
} as const

export async function createPurchase(
  storeId: string,
  createdById: string,
  input: CreatePurchaseInput,
): Promise<PurchaseResponse> {
  if (input.items.length === 0) throw new Error('NO_ITEMS')

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (input.supplierId) {
      const supplier = await tx.supplier.findFirst({
        where: { id: input.supplierId, storeId, deletedAt: null },
      })
      if (!supplier) throw new Error('SUPPLIER_NOT_FOUND')
    }

    const variantMap = new Map<string, { variantCode: string; product: { name: string } }>()
    for (const item of input.items) {
      const variant = await tx.product_Variant.findFirst({
        where: { id: item.variantId, deletedAt: null },
        include: { product: true },
      })
      if (!variant || variant.product.storeId !== storeId) {
        throw new Error('VARIANT_NOT_FOUND')
      }
      variantMap.set(item.variantId, {
        variantCode: variant.variantCode,
        product: { name: variant.product.name },
      })
    }

    let totalCost = 0
    for (const item of input.items) {
      totalCost += item.costPrice * item.quantity
    }

    const purchase = await tx.purchase.create({
      data: {
        storeId,
        supplierId: input.supplierId ?? null,
        purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : new Date(),
        totalCost,
        note: input.note ?? null,
        createdById,
      },
    })

    const createdItems: Array<{
      id: string
      variantId: string
      quantity: number
      costPrice: number
      lineTotal: number
      variant: { variantCode: string; product: { name: string } }
    }> = []

    for (const item of input.items) {
      const purchaseItem = await tx.purchaseItem.create({
        data: {
          purchaseId: purchase.id,
          variantId: item.variantId,
          quantity: item.quantity,
          costPrice: item.costPrice,
          lineTotal: item.costPrice * item.quantity,
        },
      })

      await tx.stockMovement.create({
        data: {
          storeId,
          variantId: item.variantId,
          delta: item.quantity,
          reason: 'RESTOCK',
          refType: 'purchase',
          refId: purchase.id,
          createdById,
        },
      })

      await tx.product_Variant.update({
        where: { id: item.variantId },
        data: { currentQty: { increment: item.quantity } },
      })

      createdItems.push({
        ...purchaseItem,
        variant: variantMap.get(item.variantId)!,
      })
    }

    const supplier = input.supplierId
      ? await tx.supplier.findFirst({ where: { id: input.supplierId } })
      : null

    return toPurchaseResponse({
      ...purchase,
      supplier: supplier ? { name: supplier.name } : null,
      items: createdItems,
    })
  })

  return result
}

export async function getPurchases(storeId: string): Promise<PurchaseResponse[]> {
  const purchases = await prisma.purchase.findMany({
    where: { storeId, deletedAt: null },
    include: {
      supplier: true,
      items: { include: itemInclude },
    },
    orderBy: { purchaseDate: 'desc' },
  })
  return purchases.map(toPurchaseResponse)
}

export async function getPurchase(
  storeId: string,
  purchaseId: string,
): Promise<PurchaseResponse> {
  const purchase = await prisma.purchase.findFirst({
    where: { id: purchaseId, storeId, deletedAt: null },
    include: {
      supplier: true,
      items: { include: itemInclude },
    },
  })
  if (!purchase) throw new Error('NOT_FOUND')
  return toPurchaseResponse(purchase)
}

export async function deletePurchase(
  storeId: string,
  purchaseId: string,
  createdById: string,
): Promise<void> {
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const purchase = await tx.purchase.findFirst({
      where: { id: purchaseId, storeId, deletedAt: null },
      include: { items: true },
    })
    if (!purchase) throw new Error('NOT_FOUND')

    await tx.purchase.update({
      where: { id: purchaseId },
      data: { deletedAt: new Date() },
    })

    for (const item of purchase.items) {
      await tx.stockMovement.create({
        data: {
          storeId,
          variantId: item.variantId,
          delta: -item.quantity,
          reason: 'VOID_REVERSAL',
          refType: 'purchase',
          refId: purchase.id,
          createdById,
        },
      })

      await tx.product_Variant.update({
        where: { id: item.variantId },
        data: { currentQty: { decrement: item.quantity } },
      })
    }
  })
}
