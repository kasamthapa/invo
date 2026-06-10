import cloudinary from '../../lib/cloudinary.js'
import { prisma } from '../../lib/prisma.js'
import { generateVariantCode, isVariantCodeUnique } from '../../utils/variantCode.js'
import type {
  CreateProductInput,
  CreateVariantInput,
  UpdateProductInput,
  UpdateVariantInput,
  ProductResponse,
  VariantResponse,
} from './products.types.js'
import type { Product, Product_Variant, ProductImage } from '@prisma/client'

// ---------- Helpers ----------

function toVariantResponse(v: Product_Variant): VariantResponse {
  return {
    id: v.id,
    variantCode: v.variantCode,
    attributes: v.attributes as Record<string, string>,
    price: v.price,
    currentQty: v.currentQty,
    lowStockAt: v.lowStockAt,
  }
}

function toProductResponse(
  p: Product & { variants: Product_Variant[]; images: ProductImage[] }
): ProductResponse {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    category: p.category,
    basePrice: p.basePrice,
    visible: p.visible,
    images: p.images.map((img) => ({
      id: img.id,
      url: img.url,
      sortOrder: img.sortOrder,
      variantId: img.variantId,
    })),
    variants: p.variants.filter((v) => v.deletedAt === null).map(toVariantResponse),
    createdAt: p.createdAt.toISOString(),
  }
}

function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 800, height: 800, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'))
        resolve(result.secure_url)
      }
    )
    stream.end(buffer)
  })
}

const productInclude = {
  variants: { where: { deletedAt: null } },
  images: { orderBy: { sortOrder: 'asc' as const } },
}

// ---------- Service functions ----------

export async function createProduct(
  storeId: string,
  createdById: string,
  input: CreateProductInput
): Promise<ProductResponse> {
  if (input.variants.length < 1) throw new Error('AT_LEAST_ONE_VARIANT')

  const existing = await prisma.product.findUnique({
    where: { storeId_code: { storeId, code: input.code } },
  })
  if (existing) throw new Error('CODE_TAKEN')

  const variantCodes: string[] = []
  for (const v of input.variants) {
    const vc = generateVariantCode(input.code, v.attributes)
    if (!isVariantCodeUnique(vc, variantCodes)) throw new Error('DUPLICATE_VARIANT')
    variantCodes.push(vc)
  }

  const product = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        storeId,
        code: input.code,
        name: input.name,
        description: input.description,
        category: input.category,
        basePrice: input.basePrice,
        visible: input.visible ?? true,
      },
    })

    for (let i = 0; i < input.variants.length; i++) {
      const v = input.variants[i]
      const vc = variantCodes[i]
      const openingStock = v.openingStock ?? 0

      const variant = await tx.product_Variant.create({
        data: {
          productId: product.id,
          variantCode: vc,
          attributes: v.attributes,
          price: v.price ?? null,
          lowStockAt: v.lowStockAt ?? null,
          currentQty: openingStock,
        },
      })

      if (openingStock > 0) {
        await tx.stockMovement.create({
          data: {
            storeId,
            variantId: variant.id,
            delta: openingStock,
            reason: 'OPENING_STOCK',
            createdById,
          },
        })
      }
    }

    return tx.product.findUniqueOrThrow({
      where: { id: product.id },
      include: productInclude,
    })
  })

  return toProductResponse(product)
}

export async function getProducts(storeId: string): Promise<ProductResponse[]> {
  const products = await prisma.product.findMany({
    where: { storeId, deletedAt: null },
    include: productInclude,
    orderBy: { createdAt: 'desc' },
  })
  return products.map(toProductResponse)
}

export async function getProduct(storeId: string, productId: string): Promise<ProductResponse> {
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId, deletedAt: null },
    include: productInclude,
  })
  if (!product) throw new Error('NOT_FOUND')
  return toProductResponse(product)
}

export async function updateProduct(
  storeId: string,
  productId: string,
  input: UpdateProductInput
): Promise<ProductResponse> {
  const existing = await prisma.product.findFirst({
    where: { id: productId, storeId, deletedAt: null },
  })
  if (!existing) throw new Error('NOT_FOUND')

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.basePrice !== undefined && { basePrice: input.basePrice }),
      ...(input.visible !== undefined && { visible: input.visible }),
    },
    include: productInclude,
  })

  return toProductResponse(product)
}

export async function deleteProduct(storeId: string, productId: string): Promise<void> {
  const existing = await prisma.product.findFirst({
    where: { id: productId, storeId, deletedAt: null },
  })
  if (!existing) throw new Error('NOT_FOUND')

  const now = new Date()
  await prisma.$transaction([
    prisma.product.update({ where: { id: productId }, data: { deletedAt: now } }),
    prisma.product_Variant.updateMany({
      where: { productId, deletedAt: null },
      data: { deletedAt: now },
    }),
  ])
}

export async function addVariant(
  storeId: string,
  productId: string,
  createdById: string,
  input: CreateVariantInput
): Promise<VariantResponse> {
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId, deletedAt: null },
    include: { variants: { where: { deletedAt: null }, select: { variantCode: true } } },
  })
  if (!product) throw new Error('NOT_FOUND')

  const vc = generateVariantCode(product.code, input.attributes)
  const existingCodes = product.variants.map((v) => v.variantCode)
  if (!isVariantCodeUnique(vc, existingCodes)) throw new Error('DUPLICATE_VARIANT')

  const openingStock = input.openingStock ?? 0

  const variant = await prisma.$transaction(async (tx) => {
    const variant = await tx.product_Variant.create({
      data: {
        productId,
        variantCode: vc,
        attributes: input.attributes,
        price: input.price ?? null,
        lowStockAt: input.lowStockAt ?? null,
        currentQty: openingStock,
      },
    })

    if (openingStock > 0) {
      await tx.stockMovement.create({
        data: {
          storeId,
          variantId: variant.id,
          delta: openingStock,
          reason: 'OPENING_STOCK',
          createdById,
        },
      })
    }

    return variant
  })

  return toVariantResponse(variant)
}

export async function updateVariant(
  storeId: string,
  productId: string,
  variantId: string,
  input: UpdateVariantInput
): Promise<VariantResponse> {
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId, deletedAt: null },
    include: { variants: { where: { deletedAt: null }, select: { id: true, variantCode: true } } },
  })
  if (!product) throw new Error('NOT_FOUND')

  const variantRecord = product.variants.find((v) => v.id === variantId)
  if (!variantRecord) throw new Error('NOT_FOUND')

  let newVariantCode: string | undefined
  if (input.attributes !== undefined) {
    newVariantCode = generateVariantCode(product.code, input.attributes)
    const otherCodes = product.variants
      .filter((v) => v.id !== variantId)
      .map((v) => v.variantCode)
    if (!isVariantCodeUnique(newVariantCode, otherCodes)) throw new Error('DUPLICATE_VARIANT')
  }

  const updated = await prisma.product_Variant.update({
    where: { id: variantId },
    data: {
      ...(input.price !== undefined && { price: input.price }),
      ...(input.lowStockAt !== undefined && { lowStockAt: input.lowStockAt }),
      ...(input.attributes !== undefined && {
        attributes: input.attributes,
        variantCode: newVariantCode,
      }),
    },
  })

  return toVariantResponse(updated)
}

export async function deleteVariant(
  storeId: string,
  productId: string,
  variantId: string
): Promise<void> {
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId, deletedAt: null },
    include: { variants: { where: { deletedAt: null }, select: { id: true } } },
  })
  if (!product) throw new Error('NOT_FOUND')

  const variantRecord = product.variants.find((v) => v.id === variantId)
  if (!variantRecord) throw new Error('NOT_FOUND')

  if (product.variants.length <= 1) throw new Error('LAST_VARIANT')

  await prisma.product_Variant.update({
    where: { id: variantId },
    data: { deletedAt: new Date() },
  })
}

export async function uploadImages(
  storeId: string,
  productId: string,
  files: Express.Multer.File[],
  variantId?: string
): Promise<ProductResponse> {
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId, deletedAt: null },
    include: productInclude,
  })
  if (!product) throw new Error('NOT_FOUND')

  const folder = `invo/${storeId}/products`
  const existingSortMax = product.images.reduce((max, img) => Math.max(max, img.sortOrder), -1)

  for (let i = 0; i < files.length; i++) {
    const url = await uploadToCloudinary(files[i].buffer, folder)
    await prisma.productImage.create({
      data: {
        productId,
        url,
        sortOrder: existingSortMax + 1 + i,
        variantId: variantId ?? null,
      },
    })
  }

  const updated = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    include: productInclude,
  })

  return toProductResponse(updated)
}
