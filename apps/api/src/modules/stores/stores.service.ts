import { prisma } from '../../lib/prisma.js'
import type { PublicStoreResponse, PublicProductResponse, PublicVariantResponse } from './stores.types.js'

export async function getPublicCatalog(slug: string): Promise<PublicStoreResponse> {
  const store = await prisma.store.findFirst({
    where: { slug, deletedAt: null },
  })
  if (!store) throw new Error('NOT_FOUND')

  const products = await prisma.product.findMany({
    where: { storeId: store.id, visible: true, deletedAt: null },
    include: {
      variants: {
        where: { deletedAt: null },
        select: {
          id: true,
          variantCode: true,
          attributes: true,
          price: true,
          currentQty: true,
        },
      },
      images: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, url: true, sortOrder: true },
      },
    },
  })

  const mappedProducts: PublicProductResponse[] = products.map((p) => {
    const variants: PublicVariantResponse[] = p.variants.map((v) => ({
      id: v.id,
      variantCode: v.variantCode,
      attributes: v.attributes as Record<string, string>,
      price: v.price,
      currentQty: v.currentQty,
      inStock: v.currentQty > 0,
    }))

    return {
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      category: p.category,
      basePrice: p.basePrice,
      images: p.images,
      variants,
      hasStock: variants.some((v) => v.inStock),
    }
  })

  const inStockProducts = mappedProducts.filter((p) => p.hasStock)
  const finalProducts = inStockProducts.length > 0 ? inStockProducts : mappedProducts

  return {
    name: store.name,
    slug: store.slug,
    phone: store.phone,
    products: finalProducts,
  }
}
