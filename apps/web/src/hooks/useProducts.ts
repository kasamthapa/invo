import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch, STORAGE_KEYS } from '../lib/api'
import config from '../config'
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

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: unknown) =>
      apiFetch<Product>('/products', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: unknown) =>
      apiFetch<Product>(`/products/${productId}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['products', productId] })
    },
  })
}

export function useAddVariant(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: unknown) =>
      apiFetch(`/products/${productId}/variants`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products', productId] }),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUploadImages(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (files: File[]) => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      const formData = new FormData()
      files.forEach((file) => formData.append('images', file))
      const res = await fetch(`${config.apiUrl}/products/${productId}/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token ?? ''}` },
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      return res.json() as Promise<unknown>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products', productId] }),
  })
}
