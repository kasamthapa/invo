import { prisma } from '../../lib/prisma.js'
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerResponse,
  CustomerDetailResponse,
} from './customers.types.js'

async function buildCustomerResponse(customer: {
  id: string
  name: string
  phone: string | null
  address: string | null
  note: string | null
  createdAt: Date
}): Promise<CustomerResponse> {
  const [totalOrders, spent] = await Promise.all([
    prisma.bill.count({ where: { customerId: customer.id } }),
    prisma.bill.aggregate({
      where: { customerId: customer.id, status: 'ACTIVE' },
      _sum: { total: true },
    }),
  ])
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    address: customer.address,
    note: customer.note,
    totalOrders,
    totalSpent: spent._sum.total ?? 0,
    createdAt: customer.createdAt.toISOString(),
  }
}

export async function createCustomer(
  storeId: string,
  input: CreateCustomerInput,
): Promise<CustomerResponse> {
  if (input.phone) {
    const existing = await prisma.customer.findFirst({
      where: { storeId, phone: input.phone, deletedAt: null },
    })
    if (existing) throw new Error('PHONE_TAKEN')
  }

  const customer = await prisma.customer.create({
    data: {
      storeId,
      name: input.name,
      phone: input.phone ?? null,
      address: input.address ?? null,
      note: input.note ?? null,
    },
  })

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    address: customer.address,
    note: customer.note,
    totalOrders: 0,
    totalSpent: 0,
    createdAt: customer.createdAt.toISOString(),
  }
}

export async function getCustomers(storeId: string): Promise<CustomerResponse[]> {
  const customers = await prisma.customer.findMany({
    where: { storeId, deletedAt: null },
    orderBy: { name: 'asc' },
  })
  return Promise.all(customers.map(buildCustomerResponse))
}

export async function getCustomer(
  storeId: string,
  customerId: string,
): Promise<CustomerDetailResponse> {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, storeId, deletedAt: null },
  })
  if (!customer) throw new Error('NOT_FOUND')

  const base = await buildCustomerResponse(customer)

  const bills = await prisma.bill.findMany({
    where: { customerId, storeId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, billNumber: true, total: true, paymentStatus: true, createdAt: true },
  })

  return {
    ...base,
    recentBills: bills.map((b) => ({
      id: b.id,
      billNumber: b.billNumber,
      total: b.total,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt.toISOString(),
    })),
  }
}

export async function updateCustomer(
  storeId: string,
  customerId: string,
  input: UpdateCustomerInput,
): Promise<CustomerResponse> {
  const existing = await prisma.customer.findFirst({
    where: { id: customerId, storeId, deletedAt: null },
  })
  if (!existing) throw new Error('NOT_FOUND')

  if (input.phone && input.phone !== existing.phone) {
    const taken = await prisma.customer.findFirst({
      where: { storeId, phone: input.phone, deletedAt: null, id: { not: customerId } },
    })
    if (taken) throw new Error('PHONE_TAKEN')
  }

  const updated = await prisma.customer.update({
    where: { id: customerId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.address !== undefined && { address: input.address }),
      ...(input.note !== undefined && { note: input.note }),
    },
  })

  return buildCustomerResponse(updated)
}

export async function deleteCustomer(storeId: string, customerId: string): Promise<void> {
  const existing = await prisma.customer.findFirst({
    where: { id: customerId, storeId, deletedAt: null },
  })
  if (!existing) throw new Error('NOT_FOUND')

  await prisma.customer.update({
    where: { id: customerId },
    data: { deletedAt: new Date() },
  })
}

export async function searchCustomers(
  storeId: string,
  query: string,
): Promise<CustomerResponse[]> {
  const customers = await prisma.customer.findMany({
    where: {
      storeId,
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { phone: { startsWith: query } },
      ],
    },
    take: 10,
    orderBy: { name: 'asc' },
  })
  return Promise.all(customers.map(buildCustomerResponse))
}
