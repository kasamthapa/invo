import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { Product } from '../types/product'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => apiFetch<Product[]>('/products'),
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => apiFetch<Product>(`/products/${id}`),
    enabled: !!id,
  })
}
