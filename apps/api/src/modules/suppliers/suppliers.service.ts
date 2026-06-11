import { prisma } from '../../lib/prisma.js'
import type { CreateSupplierInput, UpdateSupplierInput, SupplierResponse } from './suppliers.types.js'

function toSupplierResponse(s: {
  id: string
  name: string
  phone: string | null
  note: string | null
  createdAt: Date
}): SupplierResponse {
  return {
    id: s.id,
    name: s.name,
    phone: s.phone,
    note: s.note,
    createdAt: s.createdAt.toISOString(),
  }
}

export async function createSupplier(
  storeId: string,
  input: CreateSupplierInput,
): Promise<SupplierResponse> {
  const supplier = await prisma.supplier.create({
    data: {
      storeId,
      name: input.name,
      phone: input.phone ?? null,
      note: input.note ?? null,
    },
  })
  return toSupplierResponse(supplier)
}

export async function getSuppliers(storeId: string): Promise<SupplierResponse[]> {
  const suppliers = await prisma.supplier.findMany({
    where: { storeId, deletedAt: null },
    orderBy: { name: 'asc' },
  })
  return suppliers.map(toSupplierResponse)
}

export async function getSupplier(
  storeId: string,
  supplierId: string,
): Promise<SupplierResponse> {
  const supplier = await prisma.supplier.findFirst({
    where: { id: supplierId, storeId, deletedAt: null },
  })
  if (!supplier) throw new Error('NOT_FOUND')
  return toSupplierResponse(supplier)
}

export async function updateSupplier(
  storeId: string,
  supplierId: string,
  input: UpdateSupplierInput,
): Promise<SupplierResponse> {
  const existing = await prisma.supplier.findFirst({
    where: { id: supplierId, storeId, deletedAt: null },
  })
  if (!existing) throw new Error('NOT_FOUND')

  const updated = await prisma.supplier.update({
    where: { id: supplierId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.note !== undefined && { note: input.note }),
    },
  })
  return toSupplierResponse(updated)
}

export async function deleteSupplier(storeId: string, supplierId: string): Promise<void> {
  const existing = await prisma.supplier.findFirst({
    where: { id: supplierId, storeId, deletedAt: null },
  })
  if (!existing) throw new Error('NOT_FOUND')

  await prisma.supplier.update({
    where: { id: supplierId },
    data: { deletedAt: new Date() },
  })
}
