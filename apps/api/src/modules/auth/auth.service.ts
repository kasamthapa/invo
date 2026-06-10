import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '../../lib/prisma.js'
import { signAccessToken, generateRefreshToken } from '../../utils/tokens.js'
import type { RegisterInput, LoginInput, AuthResponse } from './auth.types.js'

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function refreshExpiresAt(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const existing = await prisma.store.findUnique({ where: { slug: input.storeSlug } })
  if (existing) throw new Error('SLUG_TAKEN')

  const passwordHash = await bcrypt.hash(input.password, 12)
  const storeId = uuidv4()
  const userId = uuidv4()

  const { store, user } = await prisma.$transaction(async (tx) => {
    const store = await tx.store.create({
      data: {
        id: storeId,
        name: input.storeName,
        slug: input.storeSlug,
        currency: 'NPR',
      },
    })
    const user = await tx.user.create({
      data: {
        id: userId,
        storeId: storeId,
        name: input.ownerName,
        phone: input.phone,
        passwordHash,
        role: 'OWNER',
      },
    })
    const updatedStore = await tx.store.update({
      where: { id: storeId },
      data: { ownerId: userId },
    })
    return { store: updatedStore, user }
  })

  const accessToken = signAccessToken({ userId: user.id, storeId: store.id, role: user.role })
  const refreshToken = generateRefreshToken()

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshExpiresAt(),
    },
  })

  return {
    user: { id: user.id, name: user.name, role: user.role },
    store: { id: store.id, name: store.name, slug: store.slug },
    tokens: { accessToken, refreshToken },
  }
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const store = await prisma.store.findUnique({ where: { slug: input.storeSlug } })
  if (!store) throw new Error('STORE_NOT_FOUND')

  const user = await prisma.user.findFirst({
    where: { phone: input.phone, storeId: store.id },
  })
  if (!user) throw new Error('INVALID_CREDENTIALS')

  const passwordMatch = await bcrypt.compare(input.password, user.passwordHash)
  if (!passwordMatch) throw new Error('INVALID_CREDENTIALS')

  if (user.deletedAt !== null) throw new Error('ACCOUNT_DISABLED')

  const accessToken = signAccessToken({ userId: user.id, storeId: store.id, role: user.role })
  const refreshToken = generateRefreshToken()

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshExpiresAt(),
    },
  })

  return {
    user: { id: user.id, name: user.name, role: user.role },
    store: { id: store.id, name: store.name, slug: store.slug },
    tokens: { accessToken, refreshToken },
  }
}

export async function refresh(token: string): Promise<{ accessToken: string }> {
  const record = await prisma.refreshToken.findUnique({ where: { token } })
  if (!record) throw new Error('INVALID_REFRESH_TOKEN')
  if (record.expiresAt < new Date()) throw new Error('REFRESH_TOKEN_EXPIRED')

  const user = await prisma.user.findUnique({ where: { id: record.userId } })
  if (!user) throw new Error('USER_NOT_FOUND')

  const accessToken = signAccessToken({ userId: user.id, storeId: user.storeId, role: user.role })
  return { accessToken }
}

export async function logout(token: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token } })
}
